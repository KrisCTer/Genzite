import React, { useState } from 'react';
import { Dropdown, Spin, Popover } from 'antd';
import {
  Menu,
  Sparkles,
  Plus,
  LayoutGrid,
  GalleryHorizontalEnd,
  Search,
  Key,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  History,
  LayoutDashboard,
  Images,
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../api/notifications';
import { useAuthStore } from '../store/auth';
import { logoutApi } from '../api/auth';
import { getNotificationsPath, getProfilePath, ADMIN_BASE } from '../utils/userNav';
import { resolveUserRoles } from '../utils/jwt';

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

const getNotificationIcon = (metadata?: { event?: string }) => {
  const event = metadata?.event || '';
  if (event.includes('user'))
    return (
      <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <UserAvatar size={14} />
      </span>
    );
  if (event.includes('site'))
    return (
      <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Sparkles size={14} />
      </span>
    );
  return (
    <span className="p-1.5 rounded-md bg-zinc-700/30 text-zinc-400 border border-zinc-700/50">
      <Bell size={14} />
    </span>
  );
};

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuthStore();
  const effectiveRoles = resolveUserRoles(user?.roles, token);

  const notificationsPath = getNotificationsPath(effectiveRoles);
  const profilePath = getProfilePath(effectiveRoles);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      /* ignore */
    }
    logout();
    navigate('/login');
  };

  const queryClient = useQueryClient();
  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
    retry: 1,
  });

  const displayNotifications = notifications || [];
  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsReadApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsReadApi(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const isPathActive = (activeMatch: string) =>
    location.pathname === activeMatch || location.pathname.startsWith(`${activeMatch}/`);

  const NavItem = ({
    icon: Icon,
    label,
    path,
    activeMatch,
    rightIcon: RightIcon,
  }: {
    icon: LucideIcon;
    label: string;
    path: string;
    activeMatch: string;
    rightIcon?: LucideIcon;
  }) => {
    const isActive = isPathActive(activeMatch);

    return (
      <button
        type="button"
        onClick={() => navigate(path)}
        title={collapsed ? label : undefined}
        className={`group relative w-full flex items-center transition-colors duration-200 cursor-pointer ${
          collapsed ? 'justify-center px-0 py-3' : 'gap-2.5 px-3 py-2.5 min-h-[40px]'
        } rounded-full text-[13px] font-medium ${
          isActive
            ? 'bg-white/[0.08] text-[#e8eaed]'
            : 'text-[#9aa0a6] hover:bg-white/[0.05] hover:text-[#e3e3e3]'
        }`}
      >
        <Icon
          size={18}
          strokeWidth={isActive ? 2.25 : 1.75}
          className={`shrink-0 ${isActive ? 'text-[#a8c7fa]' : 'text-[#9aa0a6] group-hover:text-[#c4c7c5]'}`}
        />
        {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
        {!collapsed && RightIcon && (
          <RightIcon size={15} className="shrink-0 text-[#5f6368] group-hover:text-[#9aa0a6]" />
        )}
      </button>
    );
  };

  const notificationContent = (
    <div
      style={{ width: 480 }}
      className="gz-notif-popover bg-[#080E1E] text-zinc-300 rounded-lg overflow-hidden flex flex-col font-sans"
    >
      <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <strong className="text-white text-base font-medium">Notifications</strong>
          {unreadCount > 0 && (
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              className="text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setNotifOpen(false);
              navigate(notificationsPath);
            }}
            className="text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            View all
          </button>
        </div>
      </div>
      {notifLoading ? (
        <div className="flex justify-center p-8">
          <Spin size="small" />
        </div>
      ) : displayNotifications.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">
          <Bell size={28} className="mx-auto mb-3 opacity-40" />
          <div className="text-sm">No new notifications</div>
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {displayNotifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl cursor-pointer flex gap-4 transition-all ${
                item.isRead
                  ? 'hover:bg-zinc-800/40 border border-transparent'
                  : 'bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10'
              }`}
              onClick={() => {
                if (!item.isRead) markReadMutation.mutate(item.id);
                setNotifOpen(false);
                navigate(notificationsPath);
              }}
            >
              <div className="shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] border border-zinc-800 flex items-center justify-center">
                  {getNotificationIcon(item.metadata)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[14px] leading-tight mb-1 ${item.isRead ? 'font-medium text-zinc-300' : 'font-semibold text-blue-50'}`}
                >
                  {item.title}
                </div>
                <div className="text-[13px] text-zinc-400 leading-snug mb-3">{item.body}</div>
                <div className="flex items-center justify-between mt-auto">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700/50"
                  >
                    View details <span className="text-zinc-500">→</span>
                  </button>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const utilityBtnClass =
    'relative flex items-center justify-center rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-white/[0.06] transition-colors cursor-pointer';

  return (
    <div className="flex h-screen bg-[var(--color-bg-app)] text-zinc-300 font-sans overflow-hidden">
      <aside
        className={`flex flex-col border-r border-white/[0.06] bg-[var(--color-bg-app)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-full shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center shrink-0 ${collapsed ? 'justify-center px-3 pt-5 pb-3' : 'justify-between px-4 pt-5 pb-3'}`}
        >
          {!collapsed && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 min-w-0 text-left rounded-full px-2 py-2 -ml-1 hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <span className="text-[15px] font-medium tracking-tight text-[#e8eaed] truncate">
                Genzite Hub
              </span>
              <ChevronDown size={14} className="text-[#5f6368] shrink-0" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`${utilityBtnClass} w-9 h-9 ${collapsed ? '' : 'shrink-0'}`}
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-2 pb-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          <section className="flex flex-col gap-1">
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[11px] font-medium text-[#5f6368] uppercase tracking-[0.08em]">
                Explore
              </h3>
            )}
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              path={ADMIN_BASE}
              activeMatch={ADMIN_BASE}
            />
            <NavItem
              icon={History}
              label="Notifications"
              path={notificationsPath}
              activeMatch={notificationsPath}
            />
          </section>

          <section className="flex flex-col gap-1">
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[11px] font-medium text-[#5f6368] uppercase tracking-[0.08em]">
                Build
              </h3>
            )}
            <button
              type="button"
              onClick={() => navigate(`${ADMIN_BASE}/identity`)}
              title={collapsed ? 'Identity' : undefined}
              className={`w-full flex items-center transition-colors duration-200 cursor-pointer rounded-full text-[13px] font-medium ${
                collapsed ? 'justify-center px-0 py-3' : 'gap-2.5 px-3 py-2.5 min-h-[40px]'
              } ${
                isPathActive(`${ADMIN_BASE}/identity`)
                  ? 'bg-white/[0.08] text-[#e8eaed]'
                  : 'text-[#9aa0a6] hover:bg-white/[0.05] hover:text-[#e3e3e3]'
              }`}
            >
              <Plus size={18} strokeWidth={1.75} className="shrink-0 text-[#9aa0a6]" />
              {!collapsed && <span className="flex-1 text-left truncate">Identity</span>}
            </button>
            <NavItem
              icon={LayoutGrid}
              label="Data CMS"
              path={`${ADMIN_BASE}/cms`}
              activeMatch={`${ADMIN_BASE}/cms`}
            />
            <NavItem
              icon={GalleryHorizontalEnd}
              label="Site Builder"
              path={`${ADMIN_BASE}/site`}
              activeMatch={`${ADMIN_BASE}/site`}
            />
          </section>

          <section className="flex flex-col gap-1 mt-auto">
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[11px] font-medium text-[#5f6368] uppercase tracking-[0.08em]">
                Manage
              </h3>
            )}
            <NavItem
              icon={Images}
              label="Media Library"
              path={`${ADMIN_BASE}/media`}
              activeMatch={`${ADMIN_BASE}/media`}
              rightIcon={ChevronRight}
            />
          </section>
        </nav>

        {/* Footer */}
        <div className={`shrink-0 border-t border-white/[0.06] ${collapsed ? 'px-3 pt-4 pb-4' : 'px-4 pt-4 pb-5'}`}>
          <div
            className={`flex items-center mb-5 ${collapsed ? 'flex-col gap-2' : 'justify-between gap-1 px-0.5'}`}
          >
            <Popover
              content={notificationContent}
              placement="topRight"
              trigger="click"
              open={notifOpen}
              onOpenChange={setNotifOpen}
              arrow={false}
              styles={{
                body: {
                  padding: 0,
                  background: '#080E1E',
                  border: '1px solid #1A2235',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                },
              }}
            >
              <button type="button" className={`${utilityBtnClass} w-9 h-9`}>
                <Bell size={18} strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#8ab4f8] rounded-full" />
                )}
              </button>
            </Popover>
            <button type="button" className={`${utilityBtnClass} w-9 h-9`}>
              <Settings size={18} strokeWidth={1.75} />
            </button>
            <button type="button" className={`${utilityBtnClass} w-9 h-9`}>
              <Search size={18} strokeWidth={1.75} />
            </button>
            <button type="button" className={`${utilityBtnClass} w-9 h-9`}>
              <Key size={18} strokeWidth={1.75} />
            </button>
          </div>

          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: 'Profile', onClick: () => navigate(profilePath) },
                { type: 'divider' },
                { key: 'logout', label: 'Logout', danger: true, onClick: handleLogout },
              ],
            }}
            placement="topRight"
            trigger={['click']}
          >
            <button
              type="button"
              className={`w-full flex items-center rounded-full hover:bg-white/[0.05] transition-colors cursor-pointer ${
                collapsed ? 'justify-center p-2' : 'gap-3 px-2.5 py-2'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 p-[2px]"
                style={{
                  background:
                    'conic-gradient(#ea4335 0deg 90deg, #4285f4 90deg 180deg, #34a853 180deg 270deg, #fbbc04 270deg 360deg)',
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-bg-app)] flex items-center justify-center">
                  <UserAvatar size={28} />
                </div>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <div
                    className="text-[13px] font-medium truncate text-[#e8eaed]"
                    title={user?.email || 'user@genzite.com'}
                  >
                    {(user?.email || 'user@genzite.com').replace(/(.{16}).+/, '$1...')}
                  </div>
                </div>
              )}
              {!collapsed && <ChevronDown size={14} className="text-[#5f6368] shrink-0" />}
            </button>
          </Dropdown>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--color-bg-app)]">
        <div className="flex-1 overflow-auto h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
