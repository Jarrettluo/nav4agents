import type { Metadata } from 'next';
import SkillsListClient from './SkillsListClient';
import { buildPageMetadata, ogImage } from '@/lib/seo';
import HiddenShareImage from '@/components/HiddenShareImage';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Skills',
  description: '精选 AI Skills（Claude / Cursor 技能），支持搜索、分类筛选、一键复制安装命令 —— 装进你的 AI 编程助手即用。',
  path: '/skills',
  ogKey: 'skills',
});

export default function SkillsPage() {
  return (
    <>
      <HiddenShareImage src={ogImage.sqPage('skills')} />
      <SkillsListClient />
    </>
  );
}