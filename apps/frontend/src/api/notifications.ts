import apiClient from './client';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const fetchNotificationsApi = async () => {
  const response = await apiClient.get<AppNotification[]>('/notifications');
  return response.data;
};

export const markNotificationAsReadApi = async (id: string) => {
  const response = await apiClient.patch<AppNotification>(`/notifications/${id}/read`, {});
  return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await apiClient.post<{ success: boolean }>('/notifications/read-all', {});
  return response.data;
};
