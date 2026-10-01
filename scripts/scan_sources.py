#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nav4agents 静态数据扫描器（无后端方案）
=========================================
从公开数据源抓取并归一化为前端可直接 import 的静态 JSON：
  - MCP 服务器: Smithery Registry + MCP 官方注册表
  - AI Skills : ClawHub 公开 API
  - Coding Plan: wmpeng/codingplan（门户页面标注的数据来源）

输出（写入 src/data/generated/）:
  mcp.json / skills.json / codingplan.json / meta.json

用法:
  python3 scripts/scan_sources.py            # 正常抓取并写入
  python3 scripts/scan_sources.py --dry-run  # 只打印统计，不写文件

设计原则: 单个数据源失败时保留旧数据文件（不覆盖），并打印告警。
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "src", "data", "generated")
CST = timezone(timedelta(hours=8))

UA = "Mozilla/5.0 (compatible; nav4agents-scanner/1.0; +https://nav4agents.com)"
SESSION = requests.Session()
SESSION.headers["User-Agent"] = UA

FAILED = []

# ---------------------------------------------------------------- helpers


def log(msg):
    print(msg, flush=True)


def get_json(url, params=None, timeout=35, retries=2):
    last = None
    for i in range(retries + 1):
        try:
            r = SESSION.get(url, params=params, timeout=timeout)
            r.raise_for_status()
            return r.json()
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"GET {url} failed: {last}")


def slugify(s):
    s = (s or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "item"


def stable_id(key):
    """由稳定键派生一个稳定正整数 id（收藏功能依赖其跨周稳定）。"""
    return int(hashlib.md5(key.encode("utf-8")).hexdigest()[:8], 16) % 90_000_000 + 10_000_000


def norm_iso(ts):
    """毫秒时间戳 / ISO 字符串 -> ISO 字符串。"""
    if ts is None:
        return None
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts / 1000, tz=timezone.utc).isoformat()
    return str(ts)


def fmt_num(v):
    if isinstance(v, (int, float)):
        return f"{v:,}"
    return str(v) if v not in (None, "") else "未公开"


# ---------------------------------------------------------------- classify

CATS = ["AI 增强", "开发工具", "数据处理", "内容处理", "效率工具", "垂直行业"]

_RULES = [
    ("数据处理", r"\bdata\b|analytics|database|sql|postgres|mysql|sqlite|mongodb|redis|csv|excel|spreadsheet|etl|warehouse|snowflake|bigquery|scrap|stock|finance|market|ethereum|blockchain"),
    ("内容处理", r"image|video|audio|music|pdf|document|markdown|translat|transcri|speech|ocr|media|photo|screenshot|design|figma|canva|podcast|rss|news|content|svg|font"),
    ("开发工具", r"github|gitlab|\bgit\b|code|coding|developer|\bdev\b|build|\bci\b|deploy|docker|kubernetes|terminal|shell|debug|lint|test|npm|package|\bapi\b|sdk|ide|vscode|jetbrains|webhook|typescript|python|rust|\bserver\b"),
    ("效率工具", r"email|gmail|outlook|calendar|schedul|task|todo|notion|slack|discord|telegram|whatsapp|message|chat|search|browser|map|note|obsidian|drive|dropbox|file|directory|docs|wiki|knowledge|slides|meeting|zoom|browse"),
    ("AI 增强", r"\bai\b|llm|gpt|claude|gemini|openai|anthropic|embedding|rag\b|vector|memory|prompt|agentic|inference|machine learning|neural|chatbot|copilot|model context|agent"),
]


def classify(text):
    t = (text or "").lower()
    for cat, pat in _RULES:
        if re.search(pat, t):
            return cat
    return "垂直行业"


# ---------------------------------------------------------------- mcp: smithery

SMITHERY_LIMIT = 150


def scan_smithery():
    raw = []
    for page in (1, 2):
        d = get_json("https://registry.smithery.ai/servers", {"page": page, "pageSize": 100})
        raw += d.get("servers", [])
    raw = [x for x in raw if not x.get("unlisted") and not x.get("inactive")]
    raw.sort(key=lambda x: -(x.get("useCount") or 0))

    out, seen = [], set()
    for x in raw:
        if len(out) >= SMITHERY_LIMIT:
            break
        qn = (x.get("qualifiedName") or "").strip()
        if not qn or qn in seen:
            continue
        seen.add(qn)
        slug = slugify(qn)
        name = x.get("displayName") or qn
        desc = (x.get("description") or "").strip()
        if len(desc) < 10:
            continue
        remote = bool(x.get("remote"))
        out.append({
            "id": stable_id("mcp:" + slug),
            "name": name,
            "slug": slug,
            "description": desc[:400],
            "category": classify(f"{name} {qn} {desc}"),
            "type": "remote" if remote else "local",
            "url": x.get("homepage") or f"https://smithery.ai/servers/{qn}",
            "installCmd": f"npx -y smithery mcp add {qn}" if remote else f"npx -y smithery mcp add {qn}",
            "stars": x.get("useCount") or 0,
            "featured": False,
            "source": "Smithery",
            "createdAt": norm_iso(x.get("createdAt")),
        })
    return out


# ---------------------------------------------------------------- mcp: official registry

OFFICIAL_LIMIT = 50


def scan_official_registry():
    latest, cursor = [], None
    for _ in range(3):
        params = {"limit": 100}
        if cursor:
            params["cursor"] = cursor
        d = get_json("https://registry.modelcontextprotocol.io/v0/servers", params)
        for it in d.get("servers", []):
            meta = (it.get("_meta") or {}).get("io.modelcontextprotocol.registry/official", {})
            if not meta.get("isLatest"):
                continue
            s = it.get("server") or {}
            if not s.get("name"):
                continue
            latest.append((meta.get("updatedAt") or meta.get("publishedAt"), s))
        cursor = (d.get("metadata") or {}).get("nextCursor")
        if not cursor:
            break
    # dedupe by name, keep most recently updated
    by_name = {}
    for ts, s in latest:
        by_name[s["name"]] = (ts, s)
    ordered = sorted(by_name.values(), key=lambda t: t[0] or "", reverse=True)

    out, seen = [], set()
    for _, s in ordered:
        if len(out) >= OFFICIAL_LIMIT:
            break
        name = s["name"]
        slug = slugify(name)
        if slug in seen:
            continue
        seen.add(slug)
        desc = (s.get("description") or "").strip()
        if len(desc) < 10:
            continue
        remotes = s.get("remotes") or []
        pkgs = s.get("packages") or []
        install = None
        for p in pkgs:
            if p.get("registryType") == "npm" and p.get("identifier"):
                install = f"npx {p['identifier']}"
                break
        url = s.get("websiteUrl") or (remotes[0].get("url") if remotes else None)
        out.append({
            "id": stable_id("mcp:" + slug),
            "name": s.get("title") or name,
            "slug": slug,
            "description": desc[:400],
            "category": classify(f"{name} {desc}"),
            "type": "remote" if remotes else "local",
            "url": url,
            "installCmd": install,
            "stars": 0,  # 官方注册表无热度数据（0 = 前端显示「官方收录」）
            "featured": False,
            "source": "MCP 官方注册表",
        })
    return out


# ---------------------------------------------------------------- skills: clawhub

CLAWHUB_LIMIT = 165


def scan_clawhub():
    d = get_json("https://clawhub.ai/api/v1/skills", {"limit": 200, "sort": "downloads"})
    items = d.get("items", [])
    out, seen = [], set()
    for x in items:
        if len(out) >= CLAWHUB_LIMIT:
            break
        owner = (x.get("ownerHandle") or "").strip()
        raw_slug = (x.get("slug") or "").strip()
        if not owner or not raw_slug:
            continue
        slug = f"{slugify(owner)}--{slugify(raw_slug)}"
        if slug in seen:
            continue
        seen.add(slug)
        name = x.get("displayName") or raw_slug
        desc = (x.get("summary") or "").strip()
        if len(desc) < 15:
            continue
        topics = x.get("topics") or []
        stats = x.get("stats") or {}
        out.append({
            "id": stable_id("skill:" + slug),
            "name": name[:120],
            "slug": slug,
            "ownerHandle": owner,
            "rawSlug": raw_slug,
            "description": desc[:400],
            "category": classify(f"{name} {' '.join(topics)} {desc}"),
            "source": "社区",
            "installCmd": f"clawhub install @{owner}/{raw_slug}",
            "usage": stats.get("downloads") or 0,
            "featured": False,
            "githubUrl": None,
            "url": f"https://clawhub.ai/{owner}/skills/{raw_slug}",
            "version": (x.get("latestVersion") or {}).get("version"),
            "changelog": (((x.get("latestVersion") or {}).get("changelog") or "")[:3000]) or None,
            "createdAt": norm_iso(x.get("createdAt")),
        })
    return out


# ---------------------------------------------------------------- codingplan (wmpeng)

CDN = "https://cdn.jsdelivr.net/gh/wmpeng/codingplan@main"


def _price(v, cur):
    if v is None or v == "-":
        return "-"
    if isinstance(v, str):
        return v
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return f"{cur}{s}"


def scan_codingplan():
    plans = get_json(f"{CDN}/plans.json")["plans"]
    platforms = {p["slug"]: p for p in get_json(f"{CDN}/platforms.json")["platforms"]}
    plan_models = get_json(f"{CDN}/plan-models.json")["planModels"]
    model_names = {m["slug"]: (m.get("name") or m["slug"]) for m in get_json(f"{CDN}/models.json")["models"]}

    models_by_plan = defaultdict(list)
    for e in plan_models:
        nm = model_names.get(e.get("modelSlug")) or e.get("modelSlug")
        if nm and nm not in models_by_plan[e["planSlug"]]:
            models_by_plan[e["planSlug"]].append(nm)

    keep = []
    for p in plans:
        if p.get("discontinued"):
            continue
        if p.get("billingMode") != "subscription":
            continue
        pslug = p.get("platformSlug") or ""
        if "intl" in pslug:
            continue  # 国际版平台不纳入对比页（价格货币不同）
        plat = platforms.get(pslug)
        if not plat:
            continue
        if plat.get("platformStatus") not in ("open",):
            continue
        cur = p.get("currency") or "¥"
        keep.append({
            "id": stable_id("plan:" + (p.get("slug") or p.get("name", ""))),
            "platform": plat.get("name") or p.get("platformSlug"),
            "plan": p.get("name") or "",
            "link": p.get("action") or "",
            "firstMonthPrice": _price(p.get("firstMonthPrice"), cur),
            "monthlyPrice": _price(p.get("monthlyPrice"), cur),
            "quarterlyPrice": _price(p.get("quarterlyPrice"), cur),
            "yearlyPrice": _price(p.get("yearlyPrice"), cur),
            "models": models_by_plan.get(p.get("slug"), [])[:8],
            "fiveHourRequests": fmt_num(p.get("fiveHoursRequests")),
            "weeklyRequests": fmt_num(p.get("weeklyRequests")),
            "monthlyRequests": fmt_num(p.get("monthlyRequests")),
            "otherBenefits": "，".join(p.get("benefits") or []) or "-",
            "notes": re.sub(r"\s+", " ", (p.get("note") or "")).strip()[:160],
            "rating": plat.get("rating") or 0,
            "_mprice": p.get("monthlyPrice") if isinstance(p.get("monthlyPrice"), (int, float)) else 99999,
        })
    keep.sort(key=lambda x: (-x["rating"], x["_mprice"]))
    for x in keep:
        x.pop("_mprice", None)
    return keep


# ---------------------------------------------------------------- featured pick & sw bump


def mark_featured(mcp, skills):
    """选 featured：热门 + 类别多样性（每类最多 3 个）。"""
    picked, per_cat = [], defaultdict(int)
    for it in mcp:
        if not it.get("stars"):
            continue
        if per_cat[it["category"]] >= 3:
            continue
        it["featured"] = True
        per_cat[it["category"]] += 1
        picked.append(it)
        if len(picked) >= 12:
            break
    for it in skills[:12]:
        it["featured"] = True


def bump_sw(force=False):
    path = os.path.join(ROOT, "public", "sw.js")
    if not os.path.exists(path):
        return False
    t = open(path, encoding="utf-8").read()
    ver = datetime.now(CST).strftime("%Y%m%d")
    new = re.sub(r"const CACHE_NAME = '[^']*';",
                 f"const CACHE_NAME = 'nav4agent-v{ver}';", t, count=1)
    if new != t:
        open(path, "w", encoding="utf-8").write(new)
        return True
    return False


# ---------------------------------------------------------------- main


def write_json(name, data):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, path)
    log(f"  [write] {name}: {len(data) if isinstance(data, list) else 'obj'} entries")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    log(f"== nav4agents scan @ {datetime.now(CST).isoformat(timespec='seconds')} ==")

    # --- MCP
    mcp = []
    try:
        sm = scan_smithery()
        log(f"  smithery: {len(sm)} items")
        mcp += sm
    except Exception as e:  # noqa: BLE001
        FAILED.append(f"smithery: {e}")
        log(f"  !! smithery failed: {e}")
    try:
        off = scan_official_registry()
        log(f"  official registry: {len(off)} items")
        # 去重：与 smithery 的 slug 不重复
        have = {x["slug"] for x in mcp}
        mcp += [x for x in off if x["slug"] not in have]
    except Exception as e:  # noqa: BLE001
        FAILED.append(f"official registry: {e}")
        log(f"  !! official registry failed: {e}")

    # --- Skills
    skills = []
    try:
        skills = scan_clawhub()
        log(f"  clawhub: {len(skills)} items")
    except Exception as e:  # noqa: BLE001
        FAILED.append(f"clawhub: {e}")
        log(f"  !! clawhub failed: {e}")

    # --- CodingPlan
    cps = []
    try:
        cps = scan_codingplan()
        log(f"  codingplan: {len(cps)} items")
    except Exception as e:  # noqa: BLE001
        FAILED.append(f"codingplan: {e}")
        log(f"  !! codingplan failed: {e}")

    if mcp:
        mark_featured(mcp, skills)

    # stats
    from collections import Counter
    log("  mcp categories: " + str(dict(Counter(x['category'] for x in mcp))))
    log("  skill categories: " + str(dict(Counter(x['category'] for x in skills))))

    meta = {
        "scannedAt": datetime.now(CST).isoformat(timespec="seconds"),
        "counts": {"mcp": len(mcp), "skills": len(skills), "codingplan": len(cps)},
        "sources": {
            "mcp": ["registry.smithery.ai", "registry.modelcontextprotocol.io"],
            "skills": ["clawhub.ai"],
            "codingplan": ["github.com/wmpeng/codingplan"],
        },
    }

    if args.dry_run:
        log("-- dry-run, no files written --")
        log(json.dumps(meta, ensure_ascii=False, indent=1))
        return 0 if not FAILED else 1

    # 写入：单个源失败时保留旧文件
    if mcp:
        write_json("mcp.json", mcp)
    if skills:
        write_json("skills.json", skills)
    if cps:
        write_json("codingplan.json", cps)
    write_json("meta.json", meta)

    if bump_sw():
        log("  [sw] CACHE_NAME bumped")

    if FAILED:
        log("== finished with failures: " + "; ".join(FAILED))
        return 1
    log("== done ==")
    return 0


if __name__ == "__main__":
    sys.exit(main())