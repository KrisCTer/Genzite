import apiClient from './client';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'EMAIL' | 'PUSH' | 'IN_APP';
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

export const fetchNotificationsApi = async (unreadOnly?: boolean) => {
  const response = await apiClient.get<AppNotification[]>('/notifications', {
    params: unreadOnly !== undefined ? { unreadOnly: String(unreadOnly) } : {},
  });
  return response.data;
};

export const markNotificationAsReadApi = async (id: string) => {
  const response = await apiClient.put<AppNotification>(`/notifications/${id}/read`, {});
  return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await apiClient.put<{ success: boolean }>('/notifications/read-all', {});
  return response.data;
};
