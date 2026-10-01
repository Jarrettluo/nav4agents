#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 nav4agents.com 的 sitemap.xml（含全部详情页）。"""
import json
import os
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://nav4agents.com"


def load(name):
    with open(os.path.join(ROOT, "src/data/generated", name), encoding="utf-8") as f:
        return json.load(f)


def main():
    mcp = load("mcp.json")
    skills = load("skills.json")
    meta = load("meta.json")
    lastmod = (meta.get("scannedAt") or "")[:10]

    urls = []
    urls.append(f"{BASE}/")
    for path in ["/mcp", "/skills", "/subscriptions", "/codingplan"]:
        urls.append(f"{BASE}{path}")
    for it in mcp:
        if it.get("slug"):
            urls.append(f"{BASE}/mcp/{quote(it['slug'])}")
    for it in skills:
        if it.get("slug"):
            urls.append(f"{BASE}/skills/{quote(it['slug'])}")

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc in urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        if lastmod:
            lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")

    out = os.path.join(ROOT, "public", "sitemap.xml")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"[sitemap] wrote {len(urls)} urls -> public/sitemap.xml")


if __name__ == "__main__":
    main()