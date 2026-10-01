#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 nav4agents.com 的 Open Graph 分享卡片图（1200x630）

产出:
  public/og/site.jpg            — 站点默认卡片（首页 / 兜底）
  public/og/pages/mcp.jpg       — 列表页卡片（mcp / skills / subscriptions / codingplan）
  public/og/mcp/{slug}.jpg      — 每个 MCP 服务器
  public/og/skills/{slug}.jpg   — 每个 Skill

增量逻辑: public/og/_manifest.json 记录指纹，输入未变则跳过；--force 强制重生成。
"""
import hashlib
import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og")
MANIFEST = os.path.join(OUT, "_manifest.json")

FONT_BOLD = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
FONT_REG = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
SC_INDEX = 2  # Noto Sans CJK SC

W, H = 1200, 630
BRAND = (20, 86, 240)      # #1456f0
PURPLE = (124, 58, 237)
PINK = (236, 72, 153)
INK = (25, 30, 40)
GRAY = (108, 117, 130)
PILL_BG = (232, 240, 254)
PILL_TX = (20, 86, 240)
LINE = (235, 238, 244)

EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D\u20E3]+")

_font_cache = {}


def font(bold: bool, size: int):
    key = (bold, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size, index=SC_INDEX)
    return _font_cache[key]


def clean(s, limit=None):
    if not s:
        return ""
    s = EMOJI_RE.sub("", str(s))
    s = re.sub(r"^(description|name|title)\s*[:：]\s*", "", s.strip(), flags=re.IGNORECASE)
    s = re.sub(r"\s+", " ", s).strip()
    if limit and len(s) > limit:
        s = s[: limit - 1].rstrip() + "…"
    return s


def short_name(s):
    """超长 name（源数据把描述塞进名字时）截断到首句。"""
    if len(s) <= 72:
        return s
    m = re.search(r"[。.!?]\s", s[:96])
    if m and m.start() >= 20:
        return s[: m.start() + 1]
    return s[:72].rstrip() + "…"


def pick_zh(it):
    """优先取中文描述（翻译管线产物），回退英文原文。"""
    z = (it.get("descriptionZh") or "").strip()
    return z or (it.get("description") or "")


def text_w(draw, s, f):
    return draw.textlength(s, font=f)


def wrap_fit(draw, s, f, maxw, max_lines):
    """按宽度折行；超出 max_lines 时截断并加省略号。返回行列表。"""
    lines, cur, i = [], "", 0
    n = len(s)
    while i < n:
        ch = s[i]
        if text_w(draw, cur + ch, f) <= maxw:
            cur += ch
            i += 1
            continue
        if cur:
            brk = cur.rfind(" ")
            if brk > len(cur) * 0.55:
                lines.append(cur[:brk])
                cur = cur[brk + 1:]
            else:
                lines.append(cur)
                cur = ""
        else:
            lines.append(ch)
            i += 1
        if len(lines) >= max_lines:
            break
    if i >= n and cur and len(lines) < max_lines:
        lines.append(cur)
        return lines
    if len(lines) >= max_lines and i < n:
        last = lines[-1]
        while last and text_w(draw, last + "…", f) > maxw:
            last = last[:-1]
        lines[-1] = last + "…"
    elif cur:
        lines.append(cur)
    return lines[:max_lines]


def hgradient(img, y0, y1):
    d = ImageDraw.Draw(img)
    stops = [(0.0, BRAND), (0.5, PURPLE), (1.0, PINK)]
    for x in range(W):
        t = x / (W - 1)
        # find segment
        for k in range(len(stops) - 1):
            t0, c0 = stops[k]
            t1, c1 = stops[k + 1]
            if t0 <= t <= t1:
                r = (t - t0) / (t1 - t0)
                col = tuple(int(c0[j] + (c1[j] - c0[j]) * r) for j in range(3))
                break
        else:
            col = stops[-1][1]
        d.line([(x, y0), (x, y1)], fill=col)


def draw_pill(draw, text, f, right_x, y_top):
    tw = text_w(draw, text, f)
    pad_x, pad_y = 22, 12
    x0, x1 = right_x - tw - pad_x * 2, right_x
    y0, y1 = y_top, y_top + f.size + pad_y * 2
    draw.rounded_rectangle((x0, y0, x1, y1), radius=(y1 - y0) // 2, fill=PILL_BG)
    draw.text((x0 + pad_x, y0 + pad_y - 2), text, font=f, fill=PILL_TX)
    return x1


def base_canvas(blobs=True):
    img = Image.new("RGB", (W, H), (255, 255, 255))
    if blobs:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse((W - 540, -300, W + 240, 180), fill=(20, 86, 240, 16))
        od.ellipse((W - 340, -220, W + 90, 160), fill=(236, 72, 153, 12))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    hgradient(img, 0, 11)
    return img


def item_card(kind_label, meta_line, name, desc, category, filename, fingerprint):
    """单条工具卡片。"""
    img = base_canvas()
    d = ImageDraw.Draw(img)

    # 品牌
    d.text((64, 48), "Nav4Agent", font=font(True, 42), fill=BRAND)
    # 右上分类 pill
    if category:
        draw_pill(d, clean(category, 12), font(False, 28), W - 64, 56)

    # 标题（自适应字号）
    n = len(name)
    size = 84 if n <= 14 else 72 if n <= 22 else 60 if n <= 34 else 50 if n <= 60 else 44
    tf = font(True, size)
    lines = wrap_fit(d, name, tf, W - 128, 3)
    lh = int(size * 1.28)
    y = 170
    for ln in lines:
        d.text((64, y), ln, font=tf, fill=INK)
        y += lh

    # 描述
    y += 18
    if desc:
        df = font(False, 33)
        dlines = wrap_fit(d, desc, df, W - 128, 2)
        for ln in dlines:
            d.text((64, y), ln, font=df, fill=GRAY)
            y += int(33 * 1.5)

    # 分隔线 + 底部
    d.line([(64, 536), (W - 64, 536)], fill=LINE, width=2)
    d.text((64, 558), meta_line, font=font(False, 28), fill=GRAY)
    rt = "nav4agents.com"
    d.text((W - 64 - text_w(d, rt, font(False, 28)), 558), rt, font=font(False, 28), fill=GRAY)

    save(img, filename, fingerprint)


def center_card(title, sub, pills, footer, filename, fingerprint, title_size=76):
    img = base_canvas()
    d = ImageDraw.Draw(img)
    d.text((64, 48), "Nav4Agent", font=font(True, 42), fill=BRAND)

    tf = font(True, title_size)
    tlines = wrap_fit(d, title, tf, W - 200, 2)
    lh = int(title_size * 1.28)
    total = len(tlines) * lh
    y = int((H - total) / 2) - 70
    for ln in tlines:
        tw = text_w(d, ln, tf)
        d.text(((W - tw) / 2, y), ln, font=tf, fill=INK)
        y += lh

    y += 14
    if sub:
        sf = font(False, 36)
        slines = wrap_fit(d, sub, sf, W - 260, 2)
        for ln in slines:
            tw = text_w(d, ln, sf)
            d.text(((W - tw) / 2, y), ln, font=sf, fill=GRAY)
            y += int(36 * 1.5)

    if pills:
        y += 22
        pf = font(False, 30)
        pad = 26
        widths = [text_w(d, p, pf) + pad * 2 for p in pills]
        gap = 18
        totalw = sum(widths) + gap * (len(pills) - 1)
        x = (W - totalw) / 2
        for p, wpx in zip(pills, widths):
            d.rounded_rectangle((x, y, x + wpx, y + pf.size + 24), radius=(pf.size + 24) // 2, fill=PILL_BG)
            d.text((x + pad, y + 10), p, font=pf, fill=PILL_TX)
            x += wpx + gap

    d.text((64, 558), footer, font=font(False, 28), fill=GRAY)
    rt = "nav4agents.com"
    d.text((W - 64 - text_w(d, rt, font(False, 28)), 558), rt, font=font(False, 28), fill=GRAY)

    save(img, filename, fingerprint)


def save(img, filename, fingerprint):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, "JPEG", quality=88, optimize=True, progressive=True)
    rel = os.path.relpath(filename, ROOT)
    manifest["files"][rel] = fingerprint
    return rel


SQ = 500


def square_card(name, category, footer, filename, fingerprint):
    """方形缩略图（500x500）——微信内分享/朋友圈用。"""
    img = Image.new("RGB", (SQ, SQ), (255, 255, 255))
    overlay = Image.new("RGBA", (SQ, SQ), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((SQ - 260, -140, SQ + 100, 100), fill=(20, 86, 240, 16))
    od.ellipse((SQ - 160, -100, SQ + 40, 80), fill=(236, 72, 153, 12))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)

    # 顶部渐变条
    stops = [(0.0, BRAND), (0.5, PURPLE), (1.0, PINK)]
    for x in range(SQ):
        t = x / (SQ - 1)
        for k in range(len(stops) - 1):
            t0, c0 = stops[k]
            t1, c1 = stops[k + 1]
            if t0 <= t <= t1:
                r = (t - t0) / (t1 - t0)
                col = tuple(int(c0[j] + (c1[j] - c0[j]) * r) for j in range(3))
                break
        else:
            col = stops[-1][1]
        d.line([(x, 0), (x, 8)], fill=col)

    d.text((40, 30), "Nav4Agent", font=font(True, 30), fill=BRAND)

    # 名字（居中、自适应）
    n = len(name)
    size = 54 if n <= 10 else 44 if n <= 16 else 36 if n <= 26 else 30 if n <= 44 else 26
    tf = font(True, size)
    lines = wrap_fit(d, name, tf, SQ - 80, 4)
    lh = int(size * 1.3)
    total = len(lines) * lh
    y = int((SQ - total) / 2) - 30 + 10
    for ln in lines:
        tw = text_w(d, ln, tf)
        d.text(((SQ - tw) / 2, y), ln, font=tf, fill=INK)
        y += lh

    # 分类 pill
    if category:
        pf = font(False, 24)
        cw = text_w(d, category, pf)
        x0 = (SQ - cw) / 2 - 20
        y0 = y + 12
        d.rounded_rectangle((x0, y0, x0 + cw + 40, y0 + pf.size + 18), radius=(pf.size + 18) // 2, fill=PILL_BG)
        d.text((x0 + 20, y0 + 7), category, font=pf, fill=PILL_TX)

    d.text((40, SQ - 46), footer, font=font(False, 22), fill=GRAY)
    save(img, filename, fingerprint)


def fp(*parts):
    h = hashlib.sha1("||".join(str(p) for p in parts).encode("utf-8")).hexdigest()[:16]
    return h


def main():
    force = "--force" in sys.argv

    global manifest
    if os.path.exists(MANIFEST) and not force:
        with open(MANIFEST, encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = {"version": 1, "files": {}}
    manifest.setdefault("files", {})

    mcp = json.load(open(os.path.join(ROOT, "src/data/generated/mcp.json"), encoding="utf-8"))
    skills = json.load(open(os.path.join(ROOT, "src/data/generated/skills.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(ROOT, "src/data/generated/meta.json"), encoding="utf-8"))
    counts = meta.get("counts", {})
    mcp_n, skill_n, plan_n = counts.get("mcp", len(mcp)), counts.get("skills", len(skills)), counts.get("codingplan", 0)

    generated = skipped = 0

    def maybe(path, fingerprint, fn):
        nonlocal generated, skipped
        rel = os.path.relpath(path, ROOT)
        if not force and manifest["files"].get(rel) == fingerprint and os.path.exists(path):
            skipped += 1
            return
        fn()
        generated += 1

    # ---- 站点默认卡片 ----
    def site():
        center_card(
            "让 AI 找对工具，不再翻 GitHub",
            "中文开发者挑选 MCP · Skills · 智能体工具的第一站",
            [f"{mcp_n}+ MCP 服务器", f"{skill_n}+ AI Skills", f"{plan_n}+ Coding Plan"],
            "中文开发者的 AI 工具选型站",
            os.path.join(OUT, "site.jpg"),
            site_fp,
            title_size=68,
        )

    site_fp = fp("site-v1", mcp_n, skill_n, plan_n)
    maybe(os.path.join(OUT, "site.jpg"), site_fp, site)

    # ---- 列表页卡片 ----
    pages = [
        ("mcp", "MCP 服务器库", f"{mcp_n}+ 精选 · 搜索 / 分类 / 一键复制安装命令", ["Smithery + 官方注册表"], "MCP · 服务器"),
        ("skills", "AI Skills 技能库", f"{skill_n}+ 精选 · 装进 Claude / Cursor 就能用", ["ClawHub 社区精选"], "Skills · 技能"),
        ("subscriptions", "智能体工具对比", "Cursor / Claude / Copilot 怎么选、多少钱", ["人工精选 · 持续更新"], "对比 · 选型"),
        ("codingplan", "Coding Plan 套餐对比", f"{plan_n}+ 套餐 · 价格 / 额度 / 模型一览", ["数据源 wmpeng/codingplan"], "套餐 · 对比"),
    ]
    for key, title, sub, pills, footer in pages:
        p = os.path.join(OUT, "pages", f"{key}.jpg")
        f = fp("page-v1", key, title, sub, pills, footer)
        maybe(p, f, lambda key=key, title=title, sub=sub, pills=pills, footer=footer, p=p, f=f:
              center_card(title, sub, pills, footer, p, f, title_size=72))

    # ---- MCP 条目 ----
    for it in mcp:
        slug = it.get("slug")
        if not slug:
            continue
        name = short_name(clean(it.get("name", ""), 130))
        desc = clean(pick_zh(it), 90)
        cat = it.get("category", "")
        src = it.get("source", "")
        ty = "本地" if it.get("type") == "local" else "远程"
        meta_line = " · ".join(x for x in ["MCP 服务器", ty, src] if x)
        f = fp("mcp-v2", name, desc, cat, ty, src)
        p = os.path.join(OUT, "mcp", f"{slug}.jpg")
        maybe(p, f, lambda name=name, desc=desc, cat=cat, meta_line=meta_line, p=p, f=f:
              item_card("MCP", meta_line, name, desc, cat, p, f))

    # ---- Skills 条目 ----
    for it in skills:
        slug = it.get("slug")
        if not slug:
            continue
        name = short_name(clean(it.get("name", ""), 130))
        desc = clean(pick_zh(it), 90)
        cat = it.get("category", "")
        ver = it.get("version")
        meta_line = " · ".join(x for x in ["AI Skill", it.get("source", ""), (f"v{ver}" if ver else "")] if x)
        f = fp("skill-v2", name, desc, cat, meta_line)
        p = os.path.join(OUT, "skills", f"{slug}.jpg")
        maybe(p, f, lambda name=name, desc=desc, cat=cat, meta_line=meta_line, p=p, f=f:
              item_card("Skill", meta_line, name, desc, cat, p, f))

    # ---- 方形缩略图（微信内分享/朋友圈） ----
    sq_root = os.path.join(OUT, "sq")

    def sq_site():
        square_card("Nav4Agent", "中文开发者的 AI 工具选型站", "nav4agents.com",
                    os.path.join(sq_root, "site.jpg"), fp("sq-site-v1", mcp_n, skill_n, plan_n))

    f = fp("sq-site-v1", mcp_n, skill_n, plan_n)
    maybe(os.path.join(sq_root, "site.jpg"), f, sq_site)

    for key, title, _sub, _pills, _footer in pages:
        f = fp("sq-page-v1", key, title)
        p = os.path.join(sq_root, "pages", f"{key}.jpg")
        maybe(p, f, lambda key=key, title=title, p=p, f=f:
              square_card(title, "导航站", "nav4agents.com", p, f))

    for it in mcp:
        slug = it.get("slug")
        if not slug:
            continue
        name = short_name(clean(it.get("name", ""), 130))
        f = fp("sq-mcp-v1", name, it.get("category", ""))
        p = os.path.join(sq_root, "mcp", f"{slug}.jpg")
        maybe(p, f, lambda name=name, cat=it.get("category", ""), p=p, f=f:
              square_card(name, clean(cat, 10), "MCP 服务器 · nav4agents.com", p, f))

    for it in skills:
        slug = it.get("slug")
        if not slug:
            continue
        name = short_name(clean(it.get("name", ""), 130))
        f = fp("sq-skill-v1", name, it.get("category", ""))
        p = os.path.join(sq_root, "skills", f"{slug}.jpg")
        maybe(p, f, lambda name=name, cat=it.get("category", ""), p=p, f=f:
              square_card(name, clean(cat, 10), "AI Skill · nav4agents.com", p, f))

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1, sort_keys=True)

    total_files = len(manifest["files"])
    print(f"[og] generated={generated} skipped={skipped} tracked={total_files} out={os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()