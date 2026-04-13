import apiClient from './client';
import type { ApiResponse, LoginResult, User } from './types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  username: string;
}

export const login = (params: LoginParams) => {
  return apiClient.post<ApiResponse<LoginResult>>('/auth/login', params) as unknown as Promise<ApiResponse<LoginResult>>;
};

export const register = (params: RegisterParams) => {
  return apiClient.post<ApiResponse<{ userId: number; token: string }>>('/auth/register', params) as unknown as Promise<ApiResponse<{ userId: number; token: string }>>;
};

export const logout = () => {
  return apiClient.post<ApiResponse<void>>('/auth/logout') as unknown as Promise<ApiResponse<void>>;
};

export const getCurrentUser = () => {
  return apiClient.get<ApiResponse<User>>('/auth/me') as unknown as Promise<ApiResponse<User>>;
};
