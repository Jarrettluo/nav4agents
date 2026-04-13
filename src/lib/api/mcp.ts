import apiClient from './client';
import type { ApiResponse, McpServer, PageResult } from './types';

export interface McpListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  type?: string;
  search?: string;
  featured?: boolean;
}

export const getMcpServers = (params: McpListParams = {}) => {
  return apiClient.get<ApiResponse<PageResult<McpServer>>>('/mcp', { params }) as unknown as Promise<ApiResponse<PageResult<McpServer>>>;
};

export const getMcpBySlug = (slug: string) => {
  return apiClient.get<ApiResponse<McpServer>>(`/mcp/${slug}`) as unknown as Promise<ApiResponse<McpServer>>;
};

export const getMcpCategories = () => {
  return apiClient.get<ApiResponse<string[]>>('/mcp/categories') as unknown as Promise<ApiResponse<string[]>>;
};
