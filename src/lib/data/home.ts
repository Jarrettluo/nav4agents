import mcpData from '@/data/generated/mcp.json';
import skillsData from '@/data/generated/skills.json';
import metaData from '@/data/generated/meta.json';
import type { ApiResponse, HomeData, McpServer, Skill } from './types';
import { getAllSubscriptions } from './subscriptions';

// 静态模式：首页数据由 scripts/scan_sources.py 每周生成
const mcps = (mcpData as unknown) as McpServer[];
const skills = (skillsData as unknown) as Skill[];
const meta = (metaData as unknown) as {
  counts: { mcp: number; skills: number; codingplan: number };
};

function relTime(iso?: string): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return '刚刚';
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}天前`;
  return `${Math.floor(d / 30)}个月前`;
}

export const getHomeData = async (): Promise<ApiResponse<HomeData>> => {
  const featuredMcp = mcps.filter((x) => x.featured).slice(0, 8);
  const featuredSkills = skills.filter((x) => x.featured).slice(0, 8);

  const recent = [
    ...mcps
      .filter((x) => x.createdAt)
      .map((x) => ({ type: 'MCP' as const, name: x.name, slug: x.slug, ts: Date.parse(x.createdAt!) })),
    ...skills
      .filter((x) => x.createdAt)
      .map((x) => ({ type: 'Skill' as const, name: x.name, slug: x.slug, ts: Date.parse(x.createdAt!) })),
  ]
    .filter((x) => !Number.isNaN(x.ts))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6)
    .map((x) => ({ type: x.type, name: x.name, slug: x.slug, time: relTime(new Date(x.ts).toISOString()) }));

  const subCount = getAllSubscriptions().length;

  return {
    code: 200,
    msg: 'ok',
    data: {
      featuredMcp,
      featuredSkills,
      recentItems: recent,
      stats: {
        mcpCount: meta.counts?.mcp || mcps.length,
        skillCount: meta.counts?.skills || skills.length,
        subscriptionCount: subCount,
        codingplanCount: meta.counts?.codingplan || 0,
      },
    },
  };
};