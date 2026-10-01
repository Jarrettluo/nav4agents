import data from '@/data/generated/mcp.json';
import type { ApiResponse, McpServer, PageResult } from './types';
import { searchBlob } from '@/lib/i18n';

// 静态数据模式：数据由 scripts/scan_sources.py 每周生成
const all = (data as unknown) as McpServer[];

export interface McpListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  type?: string;
  search?: string;
  featured?: boolean;
}

const pageOf = <T>(list: T[], page = 1, pageSize = 1000): PageResult<T> => ({
  list: list.slice((page - 1) * pageSize, page * pageSize),
  total: list.length,
  page,
  pageSize,
});

export const getMcpServers = async (
  params: McpListParams = {}
): Promise<ApiResponse<PageResult<McpServer>>> => {
  let list = all.slice();
  if (params.category && params.category !== '全部') {
    list = list.filter((x) => x.category === params.category);
  }
  if (params.type && params.type !== 'all') {
    list = list.filter((x) => x.type === params.type);
  }
  if (params.search) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((x) =>
      searchBlob(x.name, x.description, x.descriptionZh, x.category).includes(q)
    );
  }
  if (params.featured) {
    list = list.filter((x) => x.featured);
  }
  return { code: 200, msg: 'ok', data: pageOf(list, params.page, params.pageSize || 1000) };
};

export const getMcpBySlug = async (slug: string): Promise<ApiResponse<McpServer>> => {
  const hit = all.find((x) => x.slug === slug);
  if (!hit) return { code: 404, msg: 'not found', data: null as unknown as McpServer };
  return { code: 200, msg: 'ok', data: hit };
};

export const getMcpCategories = async (): Promise<ApiResponse<string[]>> => {
  const order = ['开发工具', '效率工具', 'AI 增强', '内容处理', '数据处理', '垂直行业'];
  const present = Array.from(new Set(all.map((x) => x.category)));
  const cats = order.filter((c) => present.includes(c)).concat(present.filter((c) => !order.includes(c)));
  return { code: 200, msg: 'ok', data: cats };
};

/** 全量数据（供首页精选等场景直接使用） */
export const getAllMcp = () => all;