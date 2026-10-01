#!/usr/bin/env bash
# =============================================================
# nav4agents 每周数据更新（供 OpenClaw cron 每周一调用）
#   流程: git pull → 扫描数据源 → 生成 src/data/generated/*.json
#         → 本地构建验证 → 有变更则 commit+push → EdgeOne 自动构建
#   用法:
#     bash scripts/weekly_update.sh             # 正常周更
#     bash scripts/weekly_update.sh --dry-run   # 演练（扫描+构建，不推送）
#   输出约定（stdout → cron announce → 微信）:
#     - 有更新: 摘要消息（MCP/Skills/套餐 计数 + 链接）
#     - 无更新: NO_REPLY（cron 抑制投递）
#     - 失败  : ⚠️ 开头告警
#   详细日志: /tmp/nav4agents-weekly.log
# =============================================================
set -uo pipefail

REPO=/home/ubuntu/github/nav4agents-dev
LOG=/tmp/nav4agents-weekly.log

# 若以 root 运行（OpenClaw cron 默认），切换为 ubuntu 用户执行（仓库/密钥属主）
if [ "$(id -u)" = "0" ]; then
  exec sudo -u ubuntu -H bash "$(readlink -f "$0")" "$@"
fi

cd "$REPO" || { echo "⚠️ nav4agents 周更：仓库目录不存在 [$REPO]"; exit 0; }

export HOME=/home/ubuntu
export PATH="/usr/bin:/bin:/usr/local/bin:$PATH"
export GIT_SSH_COMMAND="ssh -i /home/ubuntu/.ssh/id_ed25519 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

{
  echo "================ $(date '+%F %T') weekly update start ================"
} >>"$LOG" 2>&1

run() { "$@" >>"$LOG" 2>&1; }

# 0. 确保工作区在 master 分支
if [ "$(git rev-parse --abbrev-ref HEAD)" != "master" ]; then
  if ! run git checkout master; then
    echo "⚠️ nav4agents 周更：无法切换到 master 分支（详见 /tmp/nav4agents-weekly.log）"
    exit 0
  fi
fi

# 1. 同步最新代码
if ! run git pull --ff-only origin master; then
  echo "⚠️ nav4agents 周更：git pull 失败（详见服务器日志 /tmp/nav4agents-weekly.log）"
  exit 0
fi

# 2. 扫描数据源（部分源失败时保留旧数据，扫描器自身处理）
scan_rc=0
python3 scripts/scan_sources.py >>"$LOG" 2>&1 || scan_rc=$?

# 2.5 增强 MCP 详情（工具列表/配置项，失败不阻断）
python3 scripts/enhance_details.py >>"$LOG" 2>&1 || echo "  !! enhance_details failed" >>"$LOG"

# 3. 检查是否有实质性数据变更（meta.json 时间戳不计入；排除后无变化则静默）
git add -A src/data/generated public/data public/sw.js >>"$LOG" 2>&1
if git diff --cached --quiet -- src/data/generated/mcp.json src/data/generated/skills.json src/data/generated/codingplan.json src/data/generated/mcp-details.json public/data/mcp.json public/data/skills.json public/data/codingplan.json public/data/mcp-details.json; then
  run git reset -q -- src/data/generated public/data public/sw.js
  run git checkout -- src/data/generated public/sw.js
  run git checkout -- public/data 2>/dev/null || run git rm -r --cached -q --ignore-unmatch public/data
  if [ "$scan_rc" -ne 0 ]; then
    echo "⚠️ nav4agents 周更：本次扫描失败且无新数据，请检查 /tmp/nav4agents-weekly.log"
  else
    echo "NO_REPLY"
  fi
  exit 0
fi

echo "--- data changed, running build check ---" >>"$LOG" 2>&1

# 4. 本地构建验证（防止坏数据上线）
if ! run npm run build; then
  # 构建失败：回滚工作区改动，不推送
  run git reset -q -- src/data/generated public/data public/sw.js
  run git checkout -- src/data/generated public/sw.js
  run git checkout -- public/data 2>/dev/null || true
  echo "⚠️ nav4agents 周更：本地构建失败，数据未推送（详见 /tmp/nav4agents-weekly.log）"
  exit 0
fi

# 4.5 演练模式：不推送
if [ "${1:-}" = "--dry-run" ]; then
  run git reset -q -- src/data/generated public/data public/sw.js
  run git checkout -- src/data/generated public/sw.js
  run git checkout -- public/data 2>/dev/null || true
  echo "🔍 nav4agents 周更演练完成：扫描 + 构建均通过，未推送（dry-run）"
  exit 0
fi

# 5. 提交并推送（触发 EdgeOne 自动构建）
run git commit -m "chore: weekly data update $(date +%F)"
if ! run git push origin master; then
  echo "⚠️ nav4agents 周更：git push 失败（数据已提交未推送，详见 /tmp/nav4agents-weekly.log）"
  exit 0
fi

# 6. 摘要输出
MCP_N=$(python3 -c "import json;print(len(json.load(open('src/data/generated/mcp.json'))))" 2>/dev/null || echo "?")
SKILL_N=$(python3 -c "import json;print(len(json.load(open('src/data/generated/skills.json'))))" 2>/dev/null || echo "?")
PLAN_N=$(python3 -c "import json;print(len(json.load(open('src/data/generated/codingplan.json'))))" 2>/dev/null || echo "?")

MSG="📦 nav4agents 周更完成（$(date +%m-%d)）
· MCP 服务器：${MCP_N} 条
· AI Skills：${SKILL_N} 条
· Coding Plan：${PLAN_N} 条
新数据已推送，EdgeOne 自动构建中（约 5 分钟）：https://nav4agents.com"

if [ "$scan_rc" -ne 0 ]; then
  MSG="$MSG
⚠️ 注意：个别数据源本次抓取失败，已保留对应旧数据"
fi

echo "$MSG"
exit 0