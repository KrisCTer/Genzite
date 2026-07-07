import React, { useState, useMemo } from 'react';
import { Button, useToast } from '@genzite/shared-ui';
import { 
  Bell, Check, CheckCheck, Inbox, Info, Sparkles, Database, 
  ShieldAlert, Settings, Mail, Smartphone, Eye, DollarSign,
  Filter, TrendingUp, Clock
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
        icon: <Info className="w-4 h-4" />, 
        color: 'text-cyan-400', 
        bg: 'bg-cyan-500/10', 
        border: 'border-cyan-500/20', 
        dot: 'bg-cyan-400', 
        label: 'Users' 
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
        label: 'Security' 
      };
    case 'payment.succeeded':
    case 'payment':
      return { 
        icon: <DollarSign className="w-4 h-4" />, 
        color: 'text-yellow-400', 
        bg: 'bg-yellow-500/10', 
        border: 'border-yellow-500/20', 
        dot: 'bg-yellow-400', 
        label: 'Transactions' 
      };
    default:
      return { 
        icon: <Bell className="w-4 h-4" />, 
        color: 'text-slate-400', 
        bg: 'bg-slate-800/50', 
        border: 'border-slate-700/50', 
        dot: 'bg-slate-400', 
        label: 'System' 
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
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} mins ago`;
  if (h < 24) return `${h} hours ago`;
  if (d < 7) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
};

// ─── Category Filter Config ───────────────────────────────────────────────────
type CategoryId = 'all' | 'unread' | 'system' | 'security' | 'activity' | 'transactions';
const CATEGORIES: Array<{ id: CategoryId; label: string; icon: React.ReactNode }> = [
  { id: 'all', label: 'All', icon: <Inbox className="w-3.5 h-3.5" /> },
  { id: 'unread', label: 'Unread', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'system', label: 'System', icon: <Info className="w-3.5 h-3.5" /> },
  { id: 'security', label: 'Security', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { id: 'activity', label: 'Activity', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'transactions', label: 'Transactions', icon: <DollarSign className="w-3.5 h-3.5" /> },
];

export const AdminNotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  const [settings, setSettings] = useState({
    emailSecurity: true, emailSystem: true, emailBilling: false,
    pushActivity: true, pushAi: true, pushBilling: true
  });

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
    const merged = [...(serverNotifications || [])];
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serverNotifications]);

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
    markReadMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Notification read', description: 'Status updated successfully.', variant: 'success' }),
      onError: () => toast({ title: 'Error', description: 'Failed to update status.', variant: 'error' })
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllReadMutation.mutate(undefined, {
        onSuccess: () => toast({ title: 'Success', description: 'All notifications marked as read.', variant: 'success' })
      });
    } else {
      toast({ title: 'Success', description: 'All notifications marked as read.', variant: 'success' });
    }
  };

  const TABS = [
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Notification Center</h1>
          <p className="text-xs text-slate-400 mt-1">Manage and monitor system notification channels.</p>
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
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Unread</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{unreadCount}</h2>
            <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold mt-0.5">
              Requires Action
            </span>
          </div>
        </div>

        {/* Card 2: Tổng số */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:border-slate-700/60 transition-all duration-300">
          <span className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Inbox size={24} />
          </span>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{allNotifications.length}</h2>
            <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-semibold mt-0.5">
              Inbox
            </span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ đọc */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:border-slate-700/60 transition-all duration-300">
          <span className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={24} />
          </span>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Read Ratio</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{readRatio}%</h2>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              Processed
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Categories</span>
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
                  Showing {filteredNotifications.length} notifications
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer rounded-xl hover:bg-slate-800/60"
                >
                  Mark all as read
                </Button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-slate-900/40 rounded-3xl border border-slate-800/80">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 border-2 border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Loading data...</span>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredNotifications.length === 0 && (
                <div className="bg-slate-900/40 rounded-3xl border border-dashed border-slate-800/80 py-20 text-center">
                  <Inbox className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbox Empty</p>
                  <p className="text-xs text-slate-500 mt-1">No notifications in this category.</p>
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
                                title="Mark as read"
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
                  <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">Email Notifications</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Configure automatic system emails.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ToggleSwitch
                  checked={settings.emailSecurity}
                  onChange={(val) => setSettings(prev => ({ ...prev, emailSecurity: val }))}
                  label="Critical Security Alerts"
                  description="Sent immediately upon unauthorized access or password changes."
                />
                <ToggleSwitch
                  checked={settings.emailSystem}
                  onChange={(val) => setSettings(prev => ({ ...prev, emailSystem: val }))}
                  label="System Health Reports"
                  description="Weekly statistics on performance and storage."
                />
                <ToggleSwitch
                  checked={settings.emailBilling}
                  onChange={(val) => setSettings(prev => ({ ...prev, emailBilling: val }))}
                  label="Billing & Transactions"
                  description="Electronic invoice confirmation upon successful payment."
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
                  <p className="text-xs text-slate-400 mt-0.5">Direct push notifications in browser.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ToggleSwitch
                  checked={settings.pushActivity}
                  onChange={(val) => setSettings(prev => ({ ...prev, pushActivity: val }))}
                  label="Member Activities"
                  description="Role or team membership changes."
                />
                <ToggleSwitch
                  checked={settings.pushAi}
                  onChange={(val) => setSettings(prev => ({ ...prev, pushAi: val }))}
                  label="AI Process Completion"
                  description="When AI finishes building a website or analyzing."
                />
                <ToggleSwitch
                  checked={settings.pushBilling}
                  onChange={(val) => setSettings(prev => ({ ...prev, pushBilling: val }))}
                  label="Transaction Status"
                  description="Real-time payment information."
                />
              </div>
            </div>

            {/* Action bar */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setSettings({ emailSecurity: true, emailSystem: true, emailBilling: false, pushActivity: true, pushAi: true, pushBilling: true });
                  toast({ title: 'Restored', description: 'Settings restored to defaults.', variant: 'info' });
                }}
                className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                ← Default
              </button>
              <button
                onClick={() => toast({ title: 'Saved', description: 'Notification channels configured.', variant: 'success' })}
                className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 transition-all duration-300 rounded-2xl shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
export default AdminNotificationsPage;
