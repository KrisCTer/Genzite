import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatarUrl: string | null;
  status: 'ACTIVE' | 'LOCKED' | 'INACTIVE';
  createdAt: string;
  metadata?: Record<string, unknown>;
  credits?: number;
}

export const fetchUsersApi = async () => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

export const getUserByIdApi = async (id: string) => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const getMeApi = async () => {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
};

export const updateMeApi = async (data: Partial<User>) => {
  const response = await apiClient.post<User>('/users/me', data);
  return response.data;
};

export const lockUserApi = async (id: string) => {
  const response = await apiClient.post<{ message: string }>(`/users/${id}/lock`);
  return response.data;
};

export const unlockUserApi = async (id: string) => {
  const response = await apiClient.post<{ message: string }>(`/users/${id}/unlock`);
  return response.data;
};

export const deactivateUserApi = async (id: string) => {
  const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};

export const adjustCreditsApi = async (id: string, amount: number) => {
  const response = await apiClient.post<{ success: boolean; adjusted: number; credits: number }>(
    `/users/${id}/credits/adjust`,
    { amount },
  );
  return response.data;
};

export const updateRolesApi = async (id: string, roles: string[]) => {
  const response = await apiClient.post<{ message: string; roles: string[] }>(`/users/${id}/roles`, { roles });
  return response.data;
};
