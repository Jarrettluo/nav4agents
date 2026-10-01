import { subscriptions as allRaw } from '@/data/subscriptions';
import type { ApiResponse, PageResult, Subscription } from './types';

// 静态数据模式：订阅方案为人工精选维护（src/data/subscriptions.ts）
const all = allRaw as Subscription[];

export interface SubscriptionListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getSubscriptions = async (
  params: SubscriptionListParams = {}
): Promise<ApiResponse<PageResult<Subscription>>> => {
  let list = all.slice();
  if (params.category && params.category !== '全部' && params.category !== 'all') {
    list = list.filter((x) => x.category === params.category);
  }
  if (params.search) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((x) => `${x.platform} ${x.product} ${x.description}`.toLowerCase().includes(q));
  }
  if (typeof params.minPrice === 'number') list = list.filter((x) => x.price >= params.minPrice!);
  if (typeof params.maxPrice === 'number') list = list.filter((x) => x.price <= params.maxPrice!);

  const page = params.page || 1;
  const pageSize = params.pageSize || 1000;
  return {
    code: 200,
    msg: 'ok',
    data: {
      list: list.slice((page - 1) * pageSize, page * pageSize),
      total: list.length,
      page,
      pageSize,
    },
  };
};

export const getSubscriptionCategories = async (): Promise<ApiResponse<string[]>> => {
  const order: string[] = ['IDE', '聊天助手', '云IDE', 'CLI'];
  const present = Array.from(new Set(all.map((x) => x.category))) as string[];
  const cats = order.filter((c) => present.includes(c)).concat(present.filter((c) => !order.includes(c)));
  return { code: 200, msg: 'ok', data: cats };
};

export const getAllSubscriptions = () => all;