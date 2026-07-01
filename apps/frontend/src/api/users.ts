import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export const fetchUsersApi = async () => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};
