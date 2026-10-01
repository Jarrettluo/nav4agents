#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""nav4agents 中文化翻译管线（增量 + 缓存）。

把 MCP / Skill 的英文内容翻译成简体中文，写入 descriptionZh / changelogZh 字段：
  - mcp.json          : description -> descriptionZh
  - skills.json       : description -> descriptionZh；changelog -> changelogZh
  - mcp-details.json  : tools[].description / config[].description -> descriptionZh
并同步 public/data/ 副本。缓存文件 scripts/translation_cache.json 保证增量：
已翻译过的文本（按原文精确匹配）不会重复调用 LLM。

用法:
  python3 scripts/translate_content.py                # 增量翻译并回写（需要 NAV4_LLM_KEY）
  python3 scripts/translate_content.py --dry-run      # 只统计待翻译量，不调用 LLM、不写回
  python3 scripts/translate_content.py --limit 24     # 小样测试（只翻前 24 条）
  python3 scripts/translate_content.py --concurrency 3

环境变量:
  NAV4_LLM_KEY    API key（必填；缺失时只做回写，不发起请求）
  NAV4_LLM_BASE   默认 https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic
  NAV4_LLM_MODEL  默认 deepseek-v4.1-flash
"""
import argparse
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_PATH = os.path.join(ROOT, "scripts", "translation_cache.json")
SRC_DIR = os.path.join(ROOT, "src", "data", "generated")
PUB_DIR = os.path.join(ROOT, "public", "data")

DEFAULT_BASE = "https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic"
DEFAULT_MODEL = "deepseek-v4.1-flash"

BATCH_MAX_CHARS = 5200
BATCH_MAX_ITEMS = 80
CALL_TIMEOUT = 240

CJK_RE = re.compile(r"[\u4e00-\u9fff]")

PROMPT = """你是资深技术本地化译者，面向中国开发者翻译 AI 工具信息。

任务：把输入 JSON 数组中每一项的 text 字段翻译成简体中文。
要求：
1. 译文准确、简洁、专业，符合中文技术社区习惯。
2. 保留不译：产品名/公司名/服务名（如 GitHub、Slack、Notion、Claude、Cursor、Smithery）、代码标识符（如 ask_pipeworx、函数名、参数名）、URL、数字、Markdown 标记（#、-、* 等）。
3. 只输出 JSON 数组（与输入等长、id 一一对应）：[{"id":1,"zh":"译文"}]
4. 不要输出代码块、解释、思考过程或任何其他文字。

输入：
%s"""

_lock = threading.Lock()


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def dump_src(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, path)


def dump_pub(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    os.replace(tmp, path)


def cjk_ratio(s):
    s2 = re.sub(r"\s", "", s or "")
    if not s2:
        return 0.0
    return len(CJK_RE.findall(s2)) / len(s2)


def needs_translation(s):
    s = (s or "").strip()
    if len(s) < 2:
        return False
    return cjk_ratio(s) < 0.2


# ---------------------------------------------------------------- collect

def collect_pending(cache):
    """收集所有待翻译的唯一文本（去重、按出现顺序）。"""
    pending, seen = [], set()

    def add(t):
        if needs_translation(t) and t not in cache and t not in seen:
            seen.add(t)
            pending.append(t)

    mcp = load_json(os.path.join(SRC_DIR, "mcp.json"))
    skills = load_json(os.path.join(SRC_DIR, "skills.json"))
    details = load_json(os.path.join(SRC_DIR, "mcp-details.json"))

    for x in mcp:
        add(x.get("description"))
    for x in skills:
        add(x.get("description"))
        add(x.get("changelog"))
    for slug, det in details.items():
        for t in det.get("tools", []):
            add(t.get("description"))
        for c in det.get("config", []):
            add(c.get("description"))

    return pending


# ---------------------------------------------------------------- llm

def parse_array(s):
    s = (s or "").strip()
    s = re.sub(r"^```(?:json)?\s*", "", s)
    s = re.sub(r"\s*```$", "", s)
    i, j = s.find("["), s.rfind("]")
    if i >= 0 and j > i:
        s = s[i:j + 1]
    try:
        return json.loads(s)
    except Exception:
        fixed = re.sub(r",\s*([\]}])", r"\1", s)
        return json.loads(fixed)


def call_llm(payload_text, key, base, model, retries=3):
    url = base.rstrip("/") + "/v1/messages"
    body = {
        "model": model,
        "max_tokens": 16000,
        "temperature": 0.2,
        "messages": [{"role": "user", "content": PROMPT % payload_text}],
    }
    last_err = None
    for attempt in range(retries):
        try:
            r = requests.post(
                url,
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json=body,
                timeout=CALL_TIMEOUT,
            )
            if r.status_code != 200:
                raise RuntimeError("HTTP %s: %s" % (r.status_code, r.text[:200]))
            d = r.json()
            texts = [b.get("text", "") for b in d.get("content", []) if b.get("type") == "text"]
            return "\n".join(texts).strip()
        except Exception as e:  # noqa: BLE001
            last_err = e
            if attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError("LLM call failed: %s" % last_err)


def translate_batch(batch, key, base, model):
    """batch: list[str] -> dict[str, str]（原文->译文，失败条目缺省）"""
    payload = json.dumps(
        [{"id": i + 1, "text": t} for i, t in enumerate(batch)],
        ensure_ascii=False,
    )
    raw = call_llm(payload, key, base, model)
    arr = parse_array(raw)
    out = {}
    for item in arr:
        try:
            i = int(item["id"]) - 1
            zh = item.get("zh") or item.get("translation") or item.get("text") or ""
        except Exception:
            continue
        zh = str(zh).strip()
        if 0 <= i < len(batch) and zh:
            out[batch[i]] = zh
    return out


def make_batches(texts):
    batches, cur, cur_chars = [], [], 0
    for t in texts:
        if cur and (cur_chars + len(t) > BATCH_MAX_CHARS or len(cur) >= BATCH_MAX_ITEMS):
            batches.append(cur)
            cur, cur_chars = [], 0
        cur.append(t)
        cur_chars += len(t)
    if cur:
        batches.append(cur)
    return batches


# ---------------------------------------------------------------- write-back

def assign_zh(cache):
    """把缓存译文写入数据文件（src + public 同步）。返回统计。"""
    st = {"mcp": 0, "skills": 0, "changelog": 0, "tools": 0, "config": 0}

    mcp = load_json(os.path.join(SRC_DIR, "mcp.json"))
    skills = load_json(os.path.join(SRC_DIR, "skills.json"))
    details = load_json(os.path.join(SRC_DIR, "mcp-details.json"))

    for x in mcp:
        z = cache.get(x.get("description") or "")
        if z and z != x.get("description"):
            x["descriptionZh"] = z
            st["mcp"] += 1

    for x in skills:
        z = cache.get(x.get("description") or "")
        if z and z != x.get("description"):
            x["descriptionZh"] = z
            st["skills"] += 1
        c = x.get("changelog")
        if c:
            zc = cache.get(c)
            if zc and zc != c:
                x["changelogZh"] = zc
                st["changelog"] += 1

    for slug, det in details.items():
        for t in det.get("tools", []):
            z = cache.get(t.get("description") or "")
            if z and z != t.get("description"):
                t["descriptionZh"] = z
                st["tools"] += 1
        for cfg in det.get("config", []):
            z = cache.get(cfg.get("description") or "")
            if z and z != cfg.get("description"):
                cfg["descriptionZh"] = z
                st["config"] += 1

    dump_src(os.path.join(SRC_DIR, "mcp.json"), mcp)
    dump_src(os.path.join(SRC_DIR, "skills.json"), skills)
    dump_src(os.path.join(SRC_DIR, "mcp-details.json"), details)
    dump_pub(os.path.join(PUB_DIR, "mcp.json"), mcp)
    dump_pub(os.path.join(PUB_DIR, "skills.json"), skills)
    dump_pub(os.path.join(PUB_DIR, "mcp-details.json"), details)
    return st


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="只统计，不调用 LLM、不写回")
    ap.add_argument("--limit", type=int, default=0, help="只处理前 N 条（测试用）")
    ap.add_argument("--concurrency", type=int, default=3)
    args = ap.parse_args()

    key = os.environ.get("NAV4_LLM_KEY", "").strip()
    base = os.environ.get("NAV4_LLM_BASE", DEFAULT_BASE).strip()
    model = os.environ.get("NAV4_LLM_MODEL", DEFAULT_MODEL).strip()

    if os.path.exists(CACHE_PATH):
        cache = load_json(CACHE_PATH)
    else:
        cache = {}

    pending = collect_pending(cache)
    if args.limit:
        pending = pending[: args.limit]

    total_chars = sum(len(t) for t in pending)
    print("[translate] cache=%d, pending=%d (%d chars)" % (len(cache), len(pending), total_chars))

    if args.dry_run:
        batches = make_batches(pending)
        print("[translate] dry-run: %d batches, no LLM calls" % len(batches))
        # 仍执行回写（把已有缓存应用上去）
        st = assign_zh(cache)
        print("[translate] write-back: %s" % st)
        return

    translated = 0
    failed = 0
    if pending and key:
        batches = make_batches(pending)
        print("[translate] %d batches, concurrency=%d" % (len(batches), args.concurrency))

        def work(idx_batch):
            idx, batch = idx_batch
            t0 = time.time()
            got = translate_batch(batch, key, base, model)
            return idx, batch, got, time.time() - t0

        with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as ex:
            futs = [ex.submit(work, (i, b)) for i, b in enumerate(batches)]
            done = 0
            for fut in as_completed(futs):
                done += 1
                try:
                    idx, batch, got, dt = fut.result()
                    with _lock:
                        cache.update(got)
                        with open(CACHE_PATH, "w", encoding="utf-8") as f:
                            json.dump(cache, f, ensure_ascii=False, indent=1, sort_keys=True)
                    translated += len(got)
                    miss = len(batch) - len(got)
                    failed += miss
                    print("[translate] batch %d/%d: +%d%s (%.1fs)"
                          % (idx + 1, len(batches), len(got), (" miss=%d" % miss) if miss else "", dt))
                except Exception as e:  # noqa: BLE001
                    failed += 1
                    print("[translate] batch FAILED: %s" % str(e)[:200])
    elif pending:
        print("[translate] NAV4_LLM_KEY missing -> skip LLM, write back cache only (%d pending left)" % len(pending))

    st = assign_zh(cache)
    print("[translate] done: translated_now=%d failed=%d cache_total=%d" % (translated, failed, len(cache)))
    print("[translate] write-back stats: %s" % st)


if __name__ == "__main__":
    main()