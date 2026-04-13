import apiClient from './client';
import type { ApiResponse, HomeData } from './types';

export const getHomeData = () => {
  return apiClient.get<ApiResponse<HomeData>>('/home') as unknown as Promise<ApiResponse<HomeData>>;
};
