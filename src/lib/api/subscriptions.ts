import apiClient from './client';
import type { ApiResponse, Subscription, PageResult } from './types';

export interface SubscriptionListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getSubscriptions = (params: SubscriptionListParams = {}) => {
  return apiClient.get<ApiResponse<PageResult<Subscription>>>('/subscriptions', { params }) as unknown as Promise<ApiResponse<PageResult<Subscription>>>;
};

export const getSubscriptionCategories = () => {
  return apiClient.get<ApiResponse<string[]>>('/subscriptions/categories') as unknown as Promise<ApiResponse<string[]>>;
};
