# Nav4Agents

AI Agent 工具导航门户：MCP 服务器 / AI Skills / Coding Plan 对比。
**纯静态无后端架构**——数据由扫描器生成 JSON 提交到仓库，EdgeOne Pages 自动构建上线。

## 架构

- **前端**: Next.js 14 (App Router) + Tailwind CSS + TypeScript
  - 数据层直读 `src/data/generated/*.json`（无 API 调用、无后端依赖）
  - 收藏功能保存在浏览器 localStorage（无需登录）
- **数据管线**: `scripts/scan_sources.py` 抓取并归一化数据
  - MCP 服务器: [Smithery Registry](https://registry.smithery.ai) + [MCP 官方注册表](https://registry.modelcontextprotocol.io)（约 200 条）
  - AI Skills: [ClawHub](https://clawhub.ai) 公开 API（约 165 条）
  - Coding Plan: [wmpeng/codingplan](https://github.com/wmpeng/codingplan)（约 75 条套餐）
- **自动更新**: `scripts/weekly_update.sh` 每周一自动运行（拉取→扫描→构建验证→推送）
- **部署**: push 到 GitHub master → EdgeOne Pages 自动构建

## 本地命令

```bash
npm install

npm run dev     # 开发模式
npm run build   # 生产构建（构建前自动使用已生成的数据）
npm run scan    # 手动扫描数据源，刷新 src/data/generated/*.json

# 完整周更流程（拉取→扫描→构建→推送）
bash scripts/weekly_update.sh
bash scripts/weekly_update.sh --dry-run   # 演练模式（不推送）
```

## 常用链接

- 线上站点: https://nav4agents.com
- 数据来源: registry.smithery.ai / registry.modelcontextprotocol.io / clawhub.ai / github.com/wmpeng/codingplan

---
MIT License © 2026