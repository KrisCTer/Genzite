import { create } from 'zustand';
import type { AppNotification } from '../api/notifications';

interface NotificationState {
  simulatedNotifications: AppNotification[];
  addSimulatedNotification: (notif: AppNotification) => void;
  markSimulatedAsRead: (id: string) => void;
  markAllSimulatedAsRead: () => void;
  deleteSimulatedNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  simulatedNotifications: [
    {
      id: 'sim-notif-1',
      userId: 'sim-user',
      title: 'Đăng ký tài khoản mới',
      body: 'Người dùng mới hoang.nguyen@example.com vừa đăng ký tài khoản thành công.',
      type: 'IN_APP',
      isRead: false,
      metadata: { event: 'user.registered', email: 'hoang.nguyen@example.com' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'sim-notif-2',
      userId: 'sim-user',
      title: 'Sản xuất giao diện AI hoàn tất',
      body: 'Giao diện "Homestead Cozy Cafe" đã được Stitch Engine dựng thành công với 12 widgets.',
      type: 'IN_APP',
      isRead: false,
      metadata: { event: 'site.generated', siteId: '109', widgets: 12 },
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'sim-notif-3',
      userId: 'sim-user',
      title: 'Cảnh báo đăng nhập bất thường',
      body: 'Phát hiện đăng nhập từ IP lạ (103.45.122.9) tại khu vực Hải Phòng, Việt Nam.',
      type: 'IN_APP',
      isRead: true,
      metadata: { event: 'security.alert', ip: '103.45.122.9', location: 'Hai Phong, VN' },
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'sim-notif-4',
      userId: 'sim-user',
      title: 'Giao dịch thanh toán thành công',
      body: 'Hóa đơn #INV-9904 trị giá 490.000đ đã được thanh toán qua PayOS.',
      type: 'IN_APP',
      isRead: true,
      metadata: { event: 'payment.succeeded', orderId: 'INV-9904', amount: '490,000 VND' },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  addSimulatedNotification: (notif) =>
    set((state) => ({
      simulatedNotifications: [notif, ...state.simulatedNotifications],
    })),
  markSimulatedAsRead: (id) =>
    set((state) => ({
      simulatedNotifications: state.simulatedNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  markAllSimulatedAsRead: () =>
    set((state) => ({
      simulatedNotifications: state.simulatedNotifications.map((n) => ({
        ...n,
        isRead: true,
      })),
    })),
  deleteSimulatedNotification: (id) =>
    set((state) => ({
      simulatedNotifications: state.simulatedNotifications.filter((n) => n.id !== id),
    })),
}));
