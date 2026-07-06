import apiClient from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    avatarUrl?: string | null;
    status: 'ACTIVE' | 'LOCKED' | 'INACTIVE';
    createdAt: string;
  };
}

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const registerApi = async (data: { email: string; password: string; name: string }) => {
  const response = await apiClient.post<{ id: string; email: string; name: string }>('/auth/register', data);
  return response.data;
};

export const logoutApi = async () => {
  const refreshToken = localStorage.getItem('gz_refresh_token') ?? undefined;
  const response = await apiClient.post<{ message: string }>('/auth/logout', { refreshToken });
  return response.data;
};

export const forgotPasswordApi = async (data: { email: string }) => {
  const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
  return response.data;
};

export const resetPasswordApi = async (data: { token: string; newPassword: string }) => {
  const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
  return response.data;
};

export const changePasswordApi = async (data: { oldPassword: string; newPassword: string }) => {
  const response = await apiClient.put<{ message: string }>('/auth/change-password', data);
  return response.data;
};

export const refreshTokenApi = async (data: { refreshToken: string }) => {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
    '/auth/refresh',
    data,
  );
  return response.data;
};
