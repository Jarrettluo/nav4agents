import apiClient from './client';
import type { ApiResponse, PageResult } from './types';

// CodingPlan 类型定义 - 与后端 CodingPlanDTO 对齐
export interface CodingPlan {
  id: number;
  platform: string;
  plan: string;
  link: string;
  firstMonthPrice: string;
  monthlyPrice: string;
  quarterlyPrice: string;
  yearlyPrice: string;
  models: string;        // 后端返回逗号分隔的字符串
  fiveHourRequests: string;
  weeklyRequests: string;
  monthlyRequests: string;
  otherBenefits: string;
  notes?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CodingPlanListParams {
  page?: number;
  pageSize?: number;
  platform?: string;
  search?: string;
}

export const getCodingPlans = (params: CodingPlanListParams = {}) => {
  return apiClient.get<ApiResponse<PageResult<CodingPlan>>>('/codingplans', { params }) as unknown as Promise<ApiResponse<PageResult<CodingPlan>>>;
};

export const getCodingPlanPlatforms = () => {
  return apiClient.get<ApiResponse<string[]>>('/codingplans/platforms') as unknown as Promise<ApiResponse<string[]>>;
};
