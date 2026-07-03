import React, { useState, useMemo, useCallback } from 'react';
import { Button, useToast } from '@genzite/shared-ui';
import { 
  Bell, Check, CheckCheck, Inbox, Info, Sparkles, Database, Plus, 
  ShieldAlert, Settings, Mail, Smartphone, Eye, DollarSign,
  Filter, TrendingUp, Zap, Clock, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useQuery, useMutation, useQueryClient 
} from '@tanstack/react-query';
import { 
  fetchNotificationsApi, 
  markNotificationAsReadApi, 
  markAllNotificationsAsReadApi 
} from '../api/notifications';
import type { AppNotification } from '../api/notifications';
import { useNotificationStore } from '../store/notifications';

// ─── Toggle Switch (Cozy Rounded) ────────────────────────────────────────
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between p-5 bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 text-left rounded-2xl">
    <div className="flex flex-col pr-4">
      <span className="text-sm font-bold text-slate-200 tracking-tight">{label}</span>
      {description && (
        <span className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{description}</span>
      )}
    </div>
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer transition-all duration-300 ease-in-out focus:outline-none rounded-full p-0.5 ${
        checked ? 'bg-emerald-500' : 'bg-slate-700'
      }`}
      onClick={() => onChange(!checked)}
      aria-label={label}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform bg-white shadow-md rounded-full transition duration-300 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ─── Notification Type Config (Elegent Style) ──────────────────────────────
const getEventConfig = (event?: string) => {
  switch (event) {
    case 'user.registered':
      return { 
        icon: <Users className="w-4 h-4" />, 
        color: 'text-cyan-400', 
        bg: 'bg-cyan-500/10', 
        border: 'border-cyan-500/20', 
        dot: 'bg-cyan-400', 
        label: 'Người dùng' 
      };
    case 'site.generated':
    case 'site.created':
      return { 
        icon: <Sparkles className="w-4 h-4" />, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20', 
        dot: 'bg-amber-400', 
        label: 'AI Live' 
      };
    case 'cms.generated':
      return { 
        icon: <Database className="w-4 h-4" />, 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20', 
        dot: 'bg-emerald-400', 
        label: 'CMS Data' 
      };
    case 'security.alert':
    case 'auth.failed':
      return { 
        icon: <ShieldAlert className="w-4 h-4" />, 
        color: 'text-rose-400', 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/20', 
        dot: 'bg-rose-400', 
        label: 'Bảo mật' 
      };
    case 'payment.succeeded':
    case 'payment':
      return { 
        icon: <DollarSign className="w-4 h-4" />, 
        color: 'text-yellow-400', 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/20', 
        dot: 'bg-yellow-400', 
        label: 'Giao dịch' 
      };
    default:
      return { 
        icon: <Bell className="w-4 h-4" />, 
        color: 'text-slate-400', 
        bg: 'bg-slate-800/50', 
        border: 'border-slate-700/50', 
        dot: 'bg-slate-400', 
        label: 'Hệ thống' 
      };
  }
};

// ─── Relative Time ────────────────────────────────────────────────────────────
const getRelativeTime = (dateStr: string) => {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  if (d < 7) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

// ─── Category Filter Config ───────────────────────────────────────────────────
type CategoryId = 'all' | 'unread' | 'system' | 'security' | 'activity' | 'transactions';
const CATEGORIES: Array<{ id: CategoryId; label: string; icon: React.ReactNode }> = [
  { id: 'all', label: 'Tất cả', icon: <Inbox className="w-3.5 h-3.5" /> },
  { id: 'unread', label: 'Chưa đọc', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'system', label: 'Hệ thống', icon: <Info className="w-3.5 h-3.5" /> },
  { id: 'security', label: 'Bảo mật', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { id: 'activity', label: 'AI / CMS', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'transactions', label: 'Giao dịch', icon: <DollarSign className="w-3.5 h-3.5" /> },
];

export const AdminNotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'simulator'>('notifications');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  const [settings, setSettings] = useState({
    emailSecurity: true, emailSystem: true, emailBilling: false,
    pushActivity: true, pushAi: true, pushBilling: true
  });

  const { simulatedNotifications, addSimulatedNotification, markSimulatedAsRead, markAllSimulatedAsRead } = useNotificationStore();

  const { data: serverNotifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
    retry: 1
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const allNotifications = useMemo(() => {
    const merged = [...simulatedNotifications, ...(serverNotifications || [])];
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serverNotifications, simulatedNotifications]);

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(n => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'unread') return !n.isRead;
      const event = n.metadata?.event || '';
      if (selectedCategory === 'system') return event === 'user.registered' || event === 'system' || !event;
      if (selectedCategory === 'security') return event.startsWith('security') || event === 'auth.failed';
      if (selectedCategory === 'activity') return ['site.generated', 'site.created', 'cms.generated', 'resume.analyzed', 'interview.completed'].includes(event);
      if (selectedCategory === 'transactions') return event.startsWith('payment') || event.startsWith('commerce') || event === 'billing';
      return true;
    });
  }, [allNotifications, selectedCategory]);

  const unreadCount = useMemo(() => allNotifications.filter(n => !n.isRead).length, [allNotifications]);

  const readRatio = useMemo(() => {
    if (allNotifications.length === 0) return 100;
    return Math.round((1 - unreadCount / allNotifications.length) * 100);
  }, [allNotifications, unreadCount]);

  const handleMarkAsRead = async (id: string) => {
    if (id.startsWith('sim-')) {
      markSimulatedAsRead(id);
      toast({ title: 'Đã đọc thông báo', description: 'Đánh dấu giả lập là đã đọc.', variant: 'success' });
      return;
    }
    markReadMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Đã đọc thông báo', description: 'Cập nhật trạng thái thành công.', variant: 'success' }),
      onError: () => toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái.', variant: 'error' })
    });
  };

  const handleMarkAllAsRead = () => {
    markAllSimulatedAsRead();
    const unreadServerCount = unreadCount - simulatedNotifications.filter(n => !n.isRead).length;
    if (unreadServerCount > 0) {
      markAllReadMutation.mutate(undefined, {
        onSuccess: () => toast({ title: 'Thành công', description: 'Tất cả thông báo đã được đánh dấu là đã đọc.', variant: 'success' })
      });
    } else {
      toast({ title: 'Thành công', description: 'Tất cả thông báo đã được đánh dấu là đã đọc.', variant: 'success' });
    }
  };

  const triggerSimulation = useCallback((eventType: 'register' | 'site_ready' | 'security' | 'payment') => {
    const randId = `sim-${Date.now()}`;
    const templates: Record<string, AppNotification> = {
      register: {
        id: randId, userId: 'sim-user', type: 'IN_APP', isRead: false,
        title: 'Đăng ký tài khoản mới',
        body: 'Người dùng mới hoang.nguyen@example.com vừa đăng ký tài khoản thành công.',
        metadata: { event: 'user.registered', email: 'hoang.nguyen@example.com' },
        createdAt: new Date().toISOString()
      },
      site_ready: {
        id: randId, userId: 'sim-user', type: 'IN_APP', isRead: false,
        title: 'Sản xuất giao diện AI hoàn tất',
        body: 'Giao diện "Homestead Cozy Cafe" đã được Stitch Engine dựng thành công với 12 widgets.',
        metadata: { event: 'site.generated', siteId: '109', widgets: 12 },
        createdAt: new Date().toISOString()
      },
      security: {
        id: randId, userId: 'sim-user', type: 'IN_APP', isRead: false,
        title: 'Cảnh báo đăng nhập bất thường',
        body: 'Phát hiện đăng nhập từ IP lạ (103.45.122.9) tại khu vực Hải Phòng, Việt Nam.',
        metadata: { event: 'security.alert', ip: '103.45.122.9', location: 'Hai Phong, VN' },
        createdAt: new Date().toISOString()
      },
      payment: {
        id: randId, userId: 'sim-user', type: 'IN_APP', isRead: false,
        title: 'Giao dịch thanh toán thành công',
        body: 'Hóa đơn #INV-9904 trị giá 490.000đ đã được thanh toán qua PayOS.',
        metadata: { event: 'payment.succeeded', orderId: 'INV-9904', amount: '490,000 VND' },
        createdAt: new Date().toISOString()
      }
    };
    const mockNotif = templates[eventType];
    addSimulatedNotification(mockNotif);
    toast({ title: 'Giả lập thành công', description: mockNotif.title, variant: 'info' });
  }, [addSimulatedNotification, toast]);

  const TABS = [
    { id: 'notifications' as const, label: 'Thông báo', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'settings' as const, label: 'Cài đặt', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'simulator' as const, label: 'Dev Simulator', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto text-left space-y-6">
      
      {/* Header section (Cozy layout) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Genzite Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Trung tâm Thông báo</h1>
          <p className="text-xs text-slate-400 mt-1">Quản lý và kiểm thử các kênh truyền đạt thông báo trong hệ thống.</p>
        </div>
      </div>

      {/* KPI Cards (Elegent sample dashboard layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Chưa đọc */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:border-slate-700/60 transition-all duration-300">
          <span className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bell size={24} />
          </span>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Chưa đọc</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{unreadCount}</h2>
            <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold mt-0.5">
              Cần xử lý
            </span>
          </div>
        </div>

        {/* Card 2: Tổng số */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:border-slate-700/60 transition-all duration-300">
          <span className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Inbox size={24} />
          </span>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tổng số</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{allNotifications.length}</h2>
            <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-semibold mt-0.5">
              Hộp thư đến
            </span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ đọc */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:border-slate-700/60 transition-all duration-300">
          <span className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={24} />
          </span>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tỷ lệ đọc</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{readRatio}%</h2>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              Đã xử lý
            </span>
          </div>
        </div>

      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'notifications' && unreadCount > 0 && (
              <span className={`ml-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content wrapper */}
      <AnimatePresence mode="wait">
        
        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6"
          >
            {/* Category Filter Sidebar */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-3xl space-y-1.5 self-start shadow-sm">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Filter className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Danh mục</span>
              </div>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = cat.id === 'unread' ? unreadCount : undefined;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700/80 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    {count !== undefined && count > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notification List Feed */}
            <div className="space-y-4">
              
              {/* List Header */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-400">
                  Hiển thị {filteredNotifications.length} thông báo
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer rounded-xl hover:bg-slate-800/60"
                >
                  Đọc tất cả
                </Button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-slate-900/40 rounded-3xl border border-slate-800/80">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 border-2 border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Đang tải dữ liệu...</span>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredNotifications.length === 0 && (
                <div className="bg-slate-900/40 rounded-3xl border border-dashed border-slate-800/80 py-20 text-center">
                  <Inbox className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hộp thư trống</p>
                  <p className="text-xs text-slate-500 mt-1">Không có thông báo trong danh mục này.</p>
                </div>
              )}

              {/* Notification Cards (Elegent Transaction style) */}
              {!isLoading && filteredNotifications.length > 0 && (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map((notif) => {
                      const config = getEventConfig(notif.metadata?.event);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`p-4 rounded-3xl border flex items-center justify-between gap-4 group hover:border-slate-700/60 transition-all duration-300 shadow-sm ${
                            notif.isRead 
                              ? 'bg-slate-950/20 border-slate-900' 
                              : 'bg-gradient-to-br from-slate-900 to-slate-950/90 border-slate-800/60'
                          }`}
                        >
                          <div className="flex gap-4 items-center min-w-0 flex-1">
                            {/* Icon Badge */}
                            <div className={`p-3 flex items-center justify-center shrink-0 rounded-2xl border ${config.bg} ${config.color} ${config.border}`}>
                              {config.icon}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`text-sm leading-snug font-bold ${notif.isRead ? 'text-slate-500' : 'text-slate-200'}`}>
                                  {notif.title}
                                </h3>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.bg} ${config.color} ${config.border}`}>
                                  {config.label}
                                </span>
                                {!notif.isRead && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                )}
                              </div>
                              <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-400'}`}>
                                {notif.body}
                              </p>
                              {/* Metadata tags */}
                              {notif.metadata && Object.keys(notif.metadata).length > 1 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {Object.entries(notif.metadata).map(([k, v]) => {
                                    if (k === 'event') return null;
                                    return (
                                      <span
                                        key={k}
                                        className="text-[9px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800/80 px-2 py-0.5 rounded-lg"
                                      >
                                        {k}: <span className="text-slate-300 font-semibold">{String(v)}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Side Info & Action */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock size={10} />
                              <span className="text-[10px] font-mono">{getRelativeTime(notif.createdAt)}</span>
                            </div>
                            {!notif.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                title="Đánh dấu đã đọc"
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-400 bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all duration-300 cursor-pointer shadow-inner"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Email Channel */}
            <div className="border border-slate-800/60 bg-slate-900/40 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800/60">
                <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center rounded-2xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Channel 01</span>
                  <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">Thông báo qua Email</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Cấu hình gửi email tự động từ hệ thống.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ToggleSwitch
                  checked={settings.emailSecurity}
                  onChange={(val) => setSettings(prev => ({ ...prev, emailSecurity: val }))}
                  label="Cảnh báo bảo mật quan trọng"
                  description="Gửi ngay khi phát hiện đăng nhập trái phép hoặc đổi mật khẩu."
                />
                <ToggleSwitch
                  checked={settings.emailSystem}
                  onChange={(val) => setSettings(prev => ({ ...prev, emailSystem: val }))}
                  label="Báo cáo sức khỏe hệ thống"
                  description="Email thống kê định kỳ hàng tuần về hiệu năng và lưu trữ."
                />
                <ToggleSwitch
                  checked={settings.emailBilling}
                  onChange={(val) => setSettings(prev => ({ ...prev, emailBilling: val }))}
                  label="Hóa đơn & Giao dịch"
                  description="Xác nhận hóa đơn GTGT điện tử ngay khi thanh toán thành công."
                />
              </div>
            </div>

            {/* Push Channel */}
            <div className="border border-slate-800/60 bg-slate-900/40 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800/60">
                <div className="p-3 bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center rounded-2xl">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">Channel 02</span>
                  <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">Browser Push Alerts</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Thông báo đẩy trực tiếp trên trình duyệt.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ToggleSwitch
                  checked={settings.pushActivity}
                  onChange={(val) => setSettings(prev => ({ ...prev, pushActivity: val }))}
                  label="Hoạt động thành viên"
                  description="Khi có thay đổi nhân sự hoặc phân quyền trong nhóm."
                />
                <ToggleSwitch
                  checked={settings.pushAi}
                  onChange={(val) => setSettings(prev => ({ ...prev, pushAi: val }))}
                  label="Hoàn tất quy trình AI"
                  description="Khi AI hoàn tất tạo lập website hoặc phân tích CV."
                />
                <ToggleSwitch
                  checked={settings.pushBilling}
                  onChange={(val) => setSettings(prev => ({ ...prev, pushBilling: val }))}
                  label="Trạng thái giao dịch"
                  description="Thông tin thanh toán vừa phát sinh trong thời gian thực."
                />
              </div>
            </div>

            {/* Action bar */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setSettings({ emailSecurity: true, emailSystem: true, emailBilling: false, pushActivity: true, pushAi: true, pushBilling: true });
                  toast({ title: 'Khôi phục cấu hình', description: 'Đã hoàn trả cài đặt về mặc định.', variant: 'info' });
                }}
                className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                ← Mặc định
              </button>
              <button
                onClick={() => toast({ title: 'Đã lưu', description: 'Cấu hình kênh nhận thông báo đã được cập nhật.', variant: 'success' })}
                className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 transition-all duration-300 rounded-2xl shadow-md cursor-pointer"
              >
                Lưu cài đặt
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SIMULATOR TAB ── */}
        {activeTab === 'simulator' && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl"
          >
            <div className="border border-slate-800/80 bg-slate-900/40 rounded-3xl p-6 shadow-sm">
              <div className="pb-6 border-b border-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px w-4 bg-orange-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">Dev Tools</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Mô phỏng sự kiện</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Kích hoạt các sự kiện thông báo để kiểm tra khả năng hiển thị thời gian thực của hệ thống.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {([
                  { id: 'register' as const, label: 'Sự kiện Đăng ký', desc: 'User mới đăng ký tài khoản thành công.', icon: <Plus className="w-5 h-5" />, colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10', tag: 'user.registered' },
                  { id: 'site_ready' as const, label: 'AI Dựng Website', desc: 'Stitch Engine hoàn tất sinh giao diện.', icon: <Sparkles className="w-5 h-5" />, colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10', tag: 'site.generated' },
                  { id: 'security' as const, label: 'Mối đe dọa Bảo mật', desc: 'Phát hiện đăng nhập bất thường từ IP lạ.', icon: <ShieldAlert className="w-5 h-5" />, colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10', tag: 'security.alert' },
                  { id: 'payment' as const, label: 'Thanh toán hóa đơn', desc: 'Đơn hàng được chi trả qua PayOS.', icon: <DollarSign className="w-5 h-5" />, colorClass: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10', tag: 'payment.succeeded' },
                ] as const).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => triggerSimulation(item.id)}
                    className={`flex items-center gap-5 p-5 text-left transition-all duration-300 border rounded-3xl cursor-pointer relative overflow-hidden group shadow-sm bg-slate-950/20 border-slate-900`}
                  >
                    <div className={`p-3.5 flex items-center justify-center shrink-0 border rounded-2xl ${item.colorClass}`}>
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white tracking-tight">{item.label}</div>
                      <div className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[9px] font-mono text-slate-600">event:</span>
                        <span className={`text-[9px] font-mono font-bold ${item.colorClass.split(' ')[0]}`}>{item.tag}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 p-4 border border-indigo-500/10 bg-indigo-500/5 rounded-2xl">
              <Zap className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Sau khi kích hoạt sự kiện, chuyển sang tab <strong className="text-indigo-400">Thông báo</strong> để xem kết quả.
                Notification badge trên thanh header cũng sẽ cập nhật theo thời gian thực.
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
export default AdminNotificationsPage;
