import type { Metadata } from 'next';
import type { McpServer, Skill } from '@/lib/data/types';

// 站点级 SEO / 分享配置（微信、社交平台卡片统一从这里出）
export const SITE_URL = 'https://nav4agents.com';
export const SITE_NAME = 'Nav4Agent';
export const SITE_SLOGAN = '让 AI 找对工具，不再翻 GitHub';
export const SITE_DESC = '中文开发者挑选 MCP 服务器、AI Skills、智能体工具的第一站 —— 发现、对比、复制即用。';

const OG_SIZE = { width: 1200, height: 630 };

export const cleanText = (s: string | null | undefined, max = 118): string => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
};

export const ogImage = {
  site: `${SITE_URL}/og/site.jpg`,
  page: (key: string) => `${SITE_URL}/og/pages/${key}.jpg`,
  mcp: (slug: string) => `${SITE_URL}/og/mcp/${encodeURIComponent(slug)}.jpg`,
  skill: (slug: string) => `${SITE_URL}/og/skills/${encodeURIComponent(slug)}.jpg`,
  // 方形缩略图（微信内分享/朋友圈用，500x500）
  sqSite: `${SITE_URL}/og/sq/site.jpg`,
  sqPage: (key: string) => `${SITE_URL}/og/sq/pages/${key}.jpg`,
  sqMcp: (slug: string) => `${SITE_URL}/og/sq/mcp/${encodeURIComponent(slug)}.jpg`,
  sqSkill: (slug: string) => `${SITE_URL}/og/sq/skills/${encodeURIComponent(slug)}.jpg`,
};

const sharedOg = (title: string, description: string, url: string, image: string, alt: string): Metadata['openGraph'] => ({
  type: 'website',
  locale: 'zh_CN',
  siteName: SITE_NAME,
  url,
  title,
  description,
  images: [
    {
      url: image,
      width: OG_SIZE.width,
      height: OG_SIZE.height,
      type: 'image/jpeg',
      alt,
    },
  ],
});

const sharedTwitter = (title: string, description: string, image: string): Metadata['twitter'] => ({
  card: 'summary_large_image',
  title,
  description,
  images: [image],
});

/** MCP 详情页元数据 */
export function buildMcpMetadata(mcp: McpServer): Metadata {
  const title = `${mcp.name} - MCP 服务器`;
  const description = cleanText(mcp.description, 92) + `｜${mcp.category} · 一键复制安装命令 · Nav4Agent`;
  const url = `${SITE_URL}/mcp/${mcp.slug}`;
  const image = ogImage.mcp(mcp.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: sharedOg(`${mcp.name} - MCP 服务器 | ${SITE_NAME}`, description, url, image, `${mcp.name} MCP 服务器`),
    twitter: sharedTwitter(`${mcp.name} - MCP 服务器 | ${SITE_NAME}`, description, image),
  };
}

/** Skill 详情页元数据 */
export function buildSkillMetadata(skill: Skill): Metadata {
  const title = `${skill.name} - AI Skill`;
  const description = cleanText(skill.description, 92) + `｜${skill.category} · 装进 Claude / Cursor 即用 · Nav4Agent`;
  const url = `${SITE_URL}/skills/${skill.slug}`;
  const image = ogImage.skill(skill.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: sharedOg(`${skill.name} - AI Skill | ${SITE_NAME}`, description, url, image, `${skill.name} AI Skill`),
    twitter: sharedTwitter(`${skill.name} - AI Skill | ${SITE_NAME}`, description, image),
  };
}

/** 列表页 / 静态页元数据 */
export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  ogKey: string;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  const image = ogImage.page(opts.ogKey);
  const fullTitle = `${opts.title} | ${SITE_NAME}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: sharedOg(fullTitle, opts.description, url, image, `${opts.title} · ${SITE_NAME}`),
    twitter: sharedTwitter(fullTitle, opts.description, image),
  };
}