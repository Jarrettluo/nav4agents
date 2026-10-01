import type { Metadata } from 'next';
import SubscriptionsClient from './SubscriptionsClient';
import { buildPageMetadata, ogImage } from '@/lib/seo';
import HiddenShareImage from '@/components/HiddenShareImage';

export const metadata: Metadata = buildPageMetadata({
  title: '智能体工具对比',
  description: 'Cursor / Claude / Copilot 等智能体工具怎么选、多少钱 —— 人工精选对比，持续更新。',
  path: '/subscriptions',
  ogKey: 'subscriptions',
});

export default function SubscriptionsPage() {
  return (
    <>
      <HiddenShareImage src={ogImage.sqPage('subscriptions')} />
      <SubscriptionsClient />
    </>
  );
}