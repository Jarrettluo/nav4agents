import type { ApiResponse, FavoriteItem, FavoriteType } from './types';
import { getAllMcp } from './mcp';
import { getAllSkills } from './skills';
import { getAllSubscriptions } from './subscriptions';

// 静态模式：收藏保存在浏览器 localStorage（无需登录、无后端）
const KEY = 'nav4agent_favorites_v1';

interface FavoriteRecord {
  type: FavoriteType;
  itemId: number;
  createdAt: string;
}

const load = (): FavoriteRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavoriteRecord[]) : [];
  } catch {
    return [];
  }
};

const save = (recs: FavoriteRecord[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(recs));
};

export interface FavoriteListParams {
  type?: FavoriteType;
  page?: number;
  pageSize?: number;
}

export const getFavorites = async (
  params: FavoriteListParams = {}
): Promise<ApiResponse<{ list: FavoriteItem[]; total: number; page: number; pageSize: number }>> => {
  let recs = load();
  if (params.type) recs = recs.filter((r) => r.type === params.type);

  const items: FavoriteItem[] = recs
    .map((r, i) => {
      const item: FavoriteItem = { id: i + 1, type: r.type, itemId: r.itemId };
      if (r.type === 'mcp') item.mcp = getAllMcp().find((x) => x.id === r.itemId);
      if (r.type === 'skill') item.skill = getAllSkills().find((x) => x.id === r.itemId);
      if (r.type === 'subscription') item.subscription = getAllSubscriptions().find((x) => x.id === r.itemId);
      return item;
    })
    .filter((it) => it.mcp || it.skill || it.subscription);

  return { code: 200, msg: 'ok', data: { list: items, total: items.length, page: 1, pageSize: 1000 } };
};

export const addFavorite = async (type: FavoriteType, itemId: number): Promise<ApiResponse<number>> => {
  const recs = load();
  if (!recs.some((r) => r.type === type && r.itemId === itemId)) {
    recs.unshift({ type, itemId, createdAt: new Date().toISOString() });
    save(recs);
  }
  return { code: 200, msg: 'ok', data: itemId };
};

export const removeFavorite = async (type: FavoriteType, itemId: number): Promise<ApiResponse<void>> => {
  save(load().filter((r) => !(r.type === type && r.itemId === itemId)));
  return { code: 200, msg: 'ok', data: undefined as unknown as void };
};

export const checkFavorite = async (
  type: FavoriteType,
  itemId: number
): Promise<ApiResponse<{ isFavorited: boolean }>> => {
  const isFavorited = load().some((r) => r.type === type && r.itemId === itemId);
  return { code: 200, msg: 'ok', data: { isFavorited } };
};

/** 同步读取某类收藏的 id 列表（组件初始化用） */
export const getFavoriteIds = (type: FavoriteType): number[] =>
  load()
    .filter((r) => r.type === type)
    .map((r) => r.itemId);