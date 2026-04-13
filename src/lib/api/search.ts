import apiClient from './client';
import type { ApiResponse, McpServer, Skill, Subscription } from './types';

// 搜索结果类型
export interface SearchResult {
  mcp?: {
    list: McpServer[];
    total: number;
  };
  skills?: {
    list: Skill[];
    total: number;
  };
  subscriptions?: {
    list: Subscription[];
    total: number;
  };
}

export interface SearchParams {
  q: string;
  type?: 'all' | 'mcp' | 'skills' | 'subscriptions';
}

export const search = (params: SearchParams) => {
  return apiClient.get<ApiResponse<SearchResult>>('/search', { params }) as unknown as Promise<ApiResponse<SearchResult>>;
};
