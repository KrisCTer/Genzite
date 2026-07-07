import React, { useState } from 'react';
import { Dropdown, Spin, Popover } from 'antd';
import {
  Menu, Sparkles, Plus, LayoutGrid, 
  GalleryHorizontalEnd,
  Search, Key, Settings, Bell,
  ChevronDown, ChevronRight, History, FileEdit, Gauge
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi } from '../api/notifications';
import { useAuthStore } from '../store/auth';
import { logoutApi } from '../api/auth';
import { getNotificationsPath, getProfilePath, ADMIN_BASE } from '../utils/userNav';
import { resolveUserRoles } from '../utils/jwt';

const getNotificationIcon = (metadata?: { event?: string }) => {
  const event = metadata?.event || '';
  if (event.includes('user')) return <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20"><UserAvatar size={14} /></span>;
  if (event.includes('site')) return <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20"><Sparkles size={14} /></span>;
  return <span className="p-1.5 rounded-md bg-zinc-700/30 text-zinc-400 border border-zinc-700/50"><Bell size={14} /></span>;
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
    try { await logoutApi(); } catch {}
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
  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsReadApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsReadApi(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const NavItem = ({ icon: Icon, label, path, activeMatch, rightIcon: RightIcon }: { icon: any, label: string, path: string, activeMatch: string, rightIcon?: any }) => {
    const isActive = location.pathname === activeMatch || location.pathname.startsWith(activeMatch + '/');
    return (
      <button 
        onClick={() => navigate(path)}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
          isActive 
            ? 'bg-cyan-500/10 text-cyan-400 rounded-r-xl rounded-l-sm' 
            : 'text-[#9aa0a6] hover:bg-white/5 rounded-xl hover:text-[#e3e3e3]'
        }`}
      >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[3px] bg-cyan-500 rounded-r-full" />}
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-cyan-400' : 'text-[#9aa0a6]'} />
        {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
        {!collapsed && RightIcon && <RightIcon size={16} className={isActive ? 'text-cyan-400/70' : 'text-[#9aa0a6]'} ml-auto />}
      </button>
    );
  };

  const notificationContent = (
    <div style={{ width: 480 }} className="gz-notif-popover bg-[#080E1E] text-zinc-300 rounded-lg overflow-hidden flex flex-col font-sans">
      <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <strong className="text-white text-base font-medium">Notifications</strong>
          {unreadCount > 0 && <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={() => markAllReadMutation.mutate()} className="text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={() => { setNotifOpen(false); navigate(notificationsPath); }} className="text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
            View all
          </button>
        </div>
      </div>
      {notifLoading ? (
        <div className="flex justify-center p-8"><Spin size="small" /></div>
      ) : displayNotifications.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">
          <Bell size={28} className="mx-auto mb-3 opacity-40" />
          <div className="text-sm">No new notifications</div>
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto gz-scrollbar p-2 space-y-1">
          {displayNotifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl cursor-pointer flex gap-4 transition-all ${
                item.isRead ? 'hover:bg-zinc-800/40 border border-transparent' : 'bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10'
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
                <div className={`text-[14px] leading-tight mb-1 ${item.isRead ? 'font-medium text-zinc-300' : 'font-semibold text-blue-50'}`}>
                  {item.title}
                </div>
                <div className="text-[13px] text-zinc-400 leading-snug mb-3">
                  {item.body}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700/50">
                    View details <span className="text-zinc-500">→</span>
                  </button>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020409] text-zinc-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`flex flex-col border-r border-[#1A2235] bg-[#0A1124] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-full flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        {/* Top: Logo & Menu Toggle */}
        <div className="p-4 flex items-center justify-between shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-xl font-medium tracking-tight text-[#e3e3e3]">Genzite Hub</span>
              <ChevronDown size={16} className="text-[#9aa0a6]" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-lg hover:bg-white/5 text-[#9aa0a6] hover:text-white transition-all duration-200 cursor-pointer ${collapsed ? 'mx-auto' : ''}`}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Scrollable Container */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar flex flex-col">
          {/* EXPLORE */}
          <section className="flex flex-col gap-1">
            {!collapsed && <h3 className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">Explore</h3>}
            <NavItem icon={FileEdit} label="Dashboard" path={ADMIN_BASE} activeMatch={ADMIN_BASE} />
            <NavItem icon={History} label="Notifications" path={notificationsPath} activeMatch={notificationsPath} />
          </section>

          {/* BUILD */}
          <section className="flex flex-col gap-1">
            {!collapsed && <h3 className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">Build</h3>}
            <button 
              onClick={() => navigate(`${ADMIN_BASE}/identity`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
                collapsed ? 'justify-center bg-white/5 hover:bg-white/10 rounded-xl' : 'bg-white/5 hover:bg-white/10 rounded-xl'
              } text-[#e3e3e3] border border-white/5`}
            >
              <Plus size={18} strokeWidth={2} className="text-[#9aa0a6]" />
              {!collapsed && <span className="flex-1 text-left truncate">Identity</span>}
            </button>
            <NavItem icon={LayoutGrid} label="Data CMS" path={`${ADMIN_BASE}/cms`} activeMatch={`${ADMIN_BASE}/cms`} />
            <NavItem icon={GalleryHorizontalEnd} label="Site Builder" path={`${ADMIN_BASE}/site`} activeMatch={`${ADMIN_BASE}/site`} />
          </section>

          {/* MANAGE */}
          <section className="flex flex-col gap-1 mt-auto">
            {!collapsed && <h3 className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">Manage</h3>}
            <NavItem icon={Gauge} label="Media Library" path={`${ADMIN_BASE}/media`} activeMatch={`${ADMIN_BASE}/media`} rightIcon={ChevronRight} />
          </section>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#333537] shrink-0">
          {/* Quick Action Icons Row */}
          <div className={`flex items-center justify-between mb-8 text-[#9aa0a6] ${collapsed ? 'flex-col justify-center gap-4' : 'px-1'}`}>
            <Popover 
              content={notificationContent} 
              placement="topRight" 
              trigger="click" 
              open={notifOpen}                
              onOpenChange={setNotifOpen}
              arrow={false}
              styles={{ body: { padding: 0, background: '#080E1E', border: '1px solid #1A2235', borderRadius: '8px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' } }}
            >
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#1A2235] hover:bg-white/5 hover:text-white transition-all cursor-pointer relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </Popover>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#1A2235] hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              <Settings size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#1A2235] hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              <Search size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#1A2235] hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              <Key size={18} />
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center justify-between border border-[#1A2235] bg-[#050816]/50 rounded-[20px] p-1.5 hover:bg-white/[0.02] hover:border-[#333537] transition-all duration-200">
            <Dropdown 
              menu={{ items: [
                { key: 'profile', label: 'Profile', onClick: () => navigate(profilePath) },
                { type: 'divider' },
                { key: 'logout', label: 'Logout', danger: true, onClick: handleLogout }
              ]}} 
              placement="topRight" trigger={['click']}
            >
              <div className="flex items-center gap-2 cursor-pointer w-full">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 p-[2px]"
                  style={{ background: 'conic-gradient(#ea4335 0deg 90deg, #4285f4 90deg 180deg, #34a853 180deg 270deg, #fbbc04 270deg 360deg)' }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#080E1E] flex items-center justify-center border border-[#080E1E]">
                    <UserAvatar size={28} />
                  </div>
                </div>
                {!collapsed && (
                  <div className="text-xs flex-1 min-w-0">
                    <div className="font-medium truncate max-w-[130px] text-[#e3e3e3]" title={user?.email || 'user@genzite.com'}>
                      {(user?.email || 'user@genzite.com').replace(/(.{13}).+/, '$1...')}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#020409]">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
