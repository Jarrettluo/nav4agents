import type { Metadata } from 'next';
import McpListClient from './McpListClient';
import { buildPageMetadata, ogImage } from '@/lib/seo';
import HiddenShareImage from '@/components/HiddenShareImage';

export const metadata: Metadata = buildPageMetadata({
  title: 'MCP 服务器',
  description: '精选 MCP 服务器，支持搜索、分类筛选、一键复制安装命令 —— 中文开发者挑选 MCP 的第一站。',
  path: '/mcp',
  ogKey: 'mcp',
});

export default function McpPage() {
  return (
    <>
      <HiddenShareImage src={ogImage.sqPage('mcp')} />
      <McpListClient />
    </>
  );
}