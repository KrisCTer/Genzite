import React, { useMemo } from 'react';
import { AppShell, PageWrapper, DropdownMenu, DropdownItem } from '@genzite/shared-ui';
import { 
  Layout as LayoutIcon, 
  Sparkles as LucideSparkles, 
  LogOut, 
  Bell, 
  Inbox, 
  Info, 
  Sparkles, 
  Database, 
  ShieldAlert, 
  DollarSign
} from 'lucide-react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotificationsApi, 
  markNotificationAsReadApi, 
  markAllNotificationsAsReadApi 
} from '../api/notifications';
import { useNotificationStore } from '../store/notifications';

export const Layout: React.FC = () => {
  const { logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Access simulated notifications from store
  const { 
    simulatedNotifications, 
    markSimulatedAsRead, 
    markAllSimulatedAsRead 
  } = useNotificationStore();

  // Fetch server notifications
  const { data: serverNotifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
    retry: 1,
    enabled: !!token,
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Merge server and simulated notifications
  const allNotifications = useMemo(() => {
    const serverList = serverNotifications || [];
    const merged = [...simulatedNotifications, ...serverList];
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serverNotifications, simulatedNotifications]);

  const totalUnreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.isRead).length;
  }, [allNotifications]);

  const latestNotifications = useMemo(() => {
    return allNotifications.slice(0, 5);
  }, [allNotifications]);

  const handleMarkAsRead = (id: string) => {
    if (id.startsWith('sim-')) {
      markSimulatedAsRead(id);
      return;
    }
    markReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAllSimulatedAsRead();
    
    const unreadSystemCount = allNotifications.filter(n => !n.isRead && !n.id.startsWith('sim-')).length;
    if (unreadSystemCount > 0) {
      markAllReadMutation.mutate(undefined);
    }
  };

  const handleItemClick = (id: string) => {
    handleMarkAsRead(id);
    navigate('/admin/notifications');
  };

  const getEventIcon = (event?: string) => {
    switch (event) {
      case 'user.registered':
        return <Info className="w-3.5 h-3.5" />;
      case 'site.generated':
      case 'site.created':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'cms.generated':
        return <Database className="w-3.5 h-3.5" />;
      case 'security.alert':
      case 'auth.failed':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'payment.succeeded':
      case 'payment':
        return <DollarSign className="w-3.5 h-3.5" />;
      default:
        return <Bell className="w-3.5 h-3.5" />;
    }
  };

  const getIconColorClass = (event?: string) => {
    switch (event) {
      case 'user.registered':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-500';
      case 'site.generated':
      case 'site.created':
        return 'bg-orange-500/10 border border-orange-500/20 text-orange-500';
      case 'cms.generated':
        return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500';
      case 'security.alert':
      case 'auth.failed':
        return 'bg-red-500/10 border border-red-500/20 text-red-400';
      case 'payment.succeeded':
      case 'payment':
        return 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500';
      default:
        return 'bg-zinc-800 border border-zinc-700 text-zinc-400';
    }
  };

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/cms':
        return { title: 'CMS Dashboard', description: 'Manage and publish dynamic JSONB records.' };
      case '/admin/notifications':
        return { title: 'Admin Notifications', description: 'View and manage system alerts and user registered notifications.' };
      case '/builder':
        return { title: 'App Builder Canvas', description: 'Visually compose and stack application components.' };
      case '/ai':
        return { title: 'AI Generator', description: 'Describe the website you want, AI will do the rest.' };
      default:
        return { title: 'Genzite Portal', description: 'Welcome to your AI workspace.' };
    }
  };

  const { title, description } = getPageInfo();

  return (
    <AppShell
      header={
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-[var(--gz-radius-lg)] bg-[var(--gz-primary-600)] flex items-center justify-center p-2 shadow-[var(--gz-shadow-sm)]">
              <LayoutIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[var(--gz-text)] m-0 leading-none">Genzite</h1>
              <span className="text-[10px] text-[var(--gz-text-secondary)] font-medium">NestJS + React Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[var(--gz-surface-sunken)] p-1 rounded-[var(--gz-radius-lg)] border border-[var(--gz-border)]">
              <NavLink
                to="/ai"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-[var(--gz-radius-md)] text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[var(--gz-shadow-xs)] border border-blue-500'
                      : 'text-[var(--gz-text-secondary)] hover:text-[var(--gz-text)]'
                  }`
                }
              >
                <LucideSparkles className="w-4 h-4" /> AI Site Generator
              </NavLink>
              <NavLink
                to="/cms"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-[var(--gz-radius-md)] text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--gz-surface-raised)] text-[var(--gz-text)] shadow-[var(--gz-shadow-xs)] border border-[var(--gz-border-strong)]'
                      : 'text-[var(--gz-text-secondary)] hover:text-[var(--gz-text)]'
                  }`
                }
              >
                CMS Dashboard
              </NavLink>
              <NavLink
                to="/builder"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-[var(--gz-radius-md)] text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--gz-surface-raised)] text-[var(--gz-text)] shadow-[var(--gz-shadow-xs)] border border-[var(--gz-border-strong)]'
                      : 'text-[var(--gz-text-secondary)] hover:text-[var(--gz-text)]'
                  }`
                }
              >
                App Builder Canvas
              </NavLink>
            </div>
            
            {/* Cozy Dropdown Notification Component */}
            <DropdownMenu
              align="end"
              trigger={
                <button 
                  className={`p-2 text-[var(--gz-text-muted)] hover:text-amber-500 hover:bg-zinc-800/40 rounded-full relative transition-colors cursor-pointer outline-none ${
                    location.pathname === '/admin/notifications' ? 'text-amber-500 bg-zinc-800/20' : ''
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-amber-600 text-[9px] font-bold text-white flex items-center justify-center rounded-full border border-black animate-pulse shadow-sm">
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
              }
            >
              <div className="w-80 sm:w-96 p-2 text-left space-y-2.5">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--gz-border)]">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-amber-500" /> Thông báo mới
                  </span>
                  {totalUnreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold cursor-pointer transition-colors"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                {/* Dropdown List */}
                <div className="max-h-72 overflow-y-auto space-y-2 py-1 pr-1">
                  {isLoading ? (
                    <div className="text-center py-8 text-xs text-[var(--gz-text-muted)]">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Đang tải thông báo...
                    </div>
                  ) : latestNotifications.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[var(--gz-text-muted)] flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-zinc-700" />
                      Không có thông báo mới
                    </div>
                  ) : (
                    latestNotifications.map((notif) => (
                      <DropdownItem
                        key={notif.id}
                        onSelect={() => handleItemClick(notif.id)}
                        className={`p-2.5 rounded-[var(--gz-radius-lg)] flex items-start gap-3 border transition-all duration-150 ${
                          notif.isRead
                            ? 'bg-transparent border-transparent text-[var(--gz-text-muted)]'
                            : 'bg-amber-950/5 border-amber-900/10 text-white shadow-sm hover:bg-zinc-800/20'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${getIconColorClass(notif.metadata?.event)}`}>
                          {getEventIcon(notif.metadata?.event)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className={`text-xs truncate ${notif.isRead ? 'text-zinc-400 font-medium' : 'text-white font-bold'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5 leading-relaxed">
                            {notif.body}
                          </p>
                        </div>
                      </DropdownItem>
                    ))
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="border-t border-[var(--gz-border)] pt-2 text-center">
                  <NavLink
                    to="/admin/notifications"
                    className="block text-xs font-semibold text-zinc-400 hover:text-white py-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors"
                  >
                    Xem tất cả thông báo
                  </NavLink>
                </div>
              </div>
            </DropdownMenu>

            <button
              onClick={logout}
              className="p-2 text-[var(--gz-text-muted)] hover:text-[var(--gz-danger-500)] transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    >
      <PageWrapper title={title} description={description}>
        <Outlet />
      </PageWrapper>
    </AppShell>
  );
};
