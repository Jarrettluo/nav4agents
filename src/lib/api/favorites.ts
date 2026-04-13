import apiClient from './client';
import type { ApiResponse, FavoriteItem, PageResult, FavoriteType } from './types';

export interface FavoriteListParams {
  type?: FavoriteType;
  page?: number;
  pageSize?: number;
}

export const getFavorites = (params: FavoriteListParams = {}) => {
  return apiClient.get<ApiResponse<PageResult<FavoriteItem>>>('/favorites', { params }) as unknown as Promise<ApiResponse<PageResult<FavoriteItem>>>;
};

export const addFavorite = (type: FavoriteType, itemId: number) => {
  return apiClient.post<ApiResponse<number>>('/favorites', { type, itemId }) as unknown as Promise<ApiResponse<number>>;
};

export const removeFavorite = (type: FavoriteType, itemId: number) => {
  return apiClient.delete<ApiResponse<void>>(`/favorites/${type}/${itemId}`) as unknown as Promise<ApiResponse<void>>;
};

export const checkFavorite = (type: FavoriteType, itemId: number) => {
  return apiClient.get<ApiResponse<{ isFavorited: boolean }>>('/favorites/check', {
    params: { type, itemId },
  }) as unknown as Promise<ApiResponse<{ isFavorited: boolean }>>;
};
