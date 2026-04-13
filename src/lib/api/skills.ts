import apiClient from './client';
import type { ApiResponse, Skill, PageResult } from './types';

export interface SkillListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  source?: string;
  search?: string;
  featured?: boolean;
}

export const getSkills = (params: SkillListParams = {}) => {
  return apiClient.get<ApiResponse<PageResult<Skill>>>('/skills', { params }) as unknown as Promise<ApiResponse<PageResult<Skill>>>;
};

export const getSkillBySlug = (slug: string) => {
  return apiClient.get<ApiResponse<Skill>>(`/skills/${slug}`) as unknown as Promise<ApiResponse<Skill>>;
};

export const getSkillCategories = () => {
  return apiClient.get<ApiResponse<string[]>>('/skills/categories') as unknown as Promise<ApiResponse<string[]>>;
};
