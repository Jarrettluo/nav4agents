import type { Metadata } from 'next';
import CodingPlanClient from './CodingPlanClient';
import { buildPageMetadata, ogImage } from '@/lib/seo';
import HiddenShareImage from '@/components/HiddenShareImage';

export const metadata: Metadata = buildPageMetadata({
  title: 'Coding Plan 套餐对比',
  description: '主流 AI 编程套餐价格 / 额度 / 模型一览，周更数据 —— 帮你选出最划算的 Coding Plan。',
  path: '/codingplan',
  ogKey: 'codingplan',
});

export default function CodingPlanPage() {
  return (
    <>
      <HiddenShareImage src={ogImage.sqPage('codingplan')} />
      <CodingPlanClient />
    </>
  );
}