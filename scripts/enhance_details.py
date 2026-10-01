#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nav4agents MCP 详情增强脚本
============================
为热门 MCP 服务器抓取 Smithery 详情（工具列表 / 配置项 / 图标 / 远程地址），
生成 src/data/generated/mcp-details.json（按 slug 索引），供详情页展示真实内容。

用法:
  python3 scripts/enhance_details.py             # 抓取并写入（默认前 60 条）
  python3 scripts/enhance_details.py --limit 30  # 限制数量

设计：单个条目失败时保留该条旧数据；全部失败时保留旧文件（不覆盖）。
"""
import argparse
import json
import os
import sys
import time

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = os.path.join(ROOT, "src", "data", "generated")
OUT = os.path.join(GEN, "mcp-details.json")
UA = "Mozilla/5.0 (compatible; nav4agents-scanner/1.0; +https://nav4agents.com)"


def trim(s, n):
    s = (s or "").replace("\n", " ").strip()
    return s[:n]


def fetch(qn, timeout=25):
    r = requests.get(
        f"https://registry.smithery.ai/servers/{qn}",
        headers={"User-Agent": UA},
        timeout=timeout,
    )
    r.raise_for_status()
    return r.json()


def extract(d, item=None):
    tools = []
    for t in (d.get("tools") or [])[:15]:
        tools.append({
            "name": trim(t.get("name"), 80),
            "description": trim(t.get("description"), 160),
        })

    config, remote_url = [], None
    for c in (d.get("connections") or []):
        if c.get("type") == "http":
            remote_url = c.get("deploymentUrl") or remote_url
            sch = c.get("configSchema") or {}
            props = sch.get("properties") or {}
            req = set(sch.get("required") or [])
            for k, v in props.items():
                config.append({
                    "name": k,
                    "required": k in req,
                    "description": trim(v.get("description"), 140),
                })
            break

    return {
        "tools": tools,
        "config": config[:12],
        "remoteUrl": remote_url,
        "iconUrl": d.get("iconUrl"),
        "verified": bool(d.get("verified") or (item or {}).get("verified")),
        "homepage": d.get("homepage"),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=120)
    args = ap.parse_args()

    with open(os.path.join(GEN, "mcp.json"), encoding="utf-8") as f:
        items = json.load(f)
    targets = [x for x in items if x.get("smitheryId")]
    targets.sort(key=lambda x: -(x.get("stars") or 0))
    targets = targets[: args.limit]

    old = {}
    if os.path.exists(OUT):
        try:
            with open(OUT, encoding="utf-8") as f:
                old = json.load(f)
        except Exception:  # noqa: BLE001
            old = {}

    details, ok, fail = {}, 0, 0
    for x in targets:
        qn, slug = x["smitheryId"], x["slug"]
        try:
            details[slug] = extract(fetch(qn), x)
            ok += 1
        except Exception as e:  # noqa: BLE001
            fail += 1
            print(f"  !! {qn}: {e}", flush=True)
            if slug in old:
                details[slug] = old[slug]  # 保留旧数据
        time.sleep(0.15)

    print(f"== enhanced: {ok} ok, {fail} failed ==")

    if not details:
        print("no data fetched; keep old file")
        return 1

    os.makedirs(GEN, exist_ok=True)
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(details, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, OUT)

    # 同步一份到 public/data/
    pub_dir = os.path.join(ROOT, "public", "data")
    os.makedirs(pub_dir, exist_ok=True)
    with open(os.path.join(pub_dir, "mcp-details.json"), "w", encoding="utf-8") as f:
        json.dump(details, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")

    print(f"[write] mcp-details.json: {len(details)} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())