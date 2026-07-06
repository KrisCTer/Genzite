import apiClient from './client';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const registerApi = async (data: { email: string; password: string; name: string }) => {
  const response = await apiClient.post<LoginResponse>('/auth/register', data);
  return response.data;
};
