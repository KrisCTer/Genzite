import React, { useState } from 'react';
import { Layout, Menu, Typography, Badge, List, Popover, Button, Spin, FloatButton } from 'antd';
import {
  DatabaseOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi } from '../api/notifications';
import { useAuthStore } from '../store/auth';
import { getNotificationsPath, getProfilePath, ADMIN_BASE, WORKSPACE_BASE } from '../utils/userNav';
import { resolveUserRoles } from '../utils/jwt';
import UserAccountMenu from '../components/UserAccountMenu';
import { ADMIN_MENU, WORKSPACE_MENU, filterNavConfig } from '../utils/navMenuConfig';
import { 
  Bell,
  Sparkles, 
  Info, 
  Shield, 
  DollarSign
} from 'lucide-react';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

import type { MenuProps } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];

function toMenuItem(item: import('../utils/navMenuConfig').NavMenuConfig): MenuItem {
  return {
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children?.map(toMenuItem),
  } as MenuItem;
}

const getNotificationIcon = (metadata?: { event?: string }) => {
  const event = metadata?.event;
  switch (event) {
    case 'user.registered':
      return <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0"><Info size={14} /></span>;
    case 'site.generated':
    case 'site.created':
      return <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0"><Sparkles size={14} /></span>;
    case 'cms.generated':
      return <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0"><DatabaseOutlined style={{ fontSize: 14 }} /></span>;
    case 'security.alert':
    case 'auth.failed':
      return <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0"><Shield size={14} /></span>;
    case 'commerce.payment':
    case 'payment.succeeded':
      return <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center shrink-0"><DollarSign size={14} /></span>;
    default:
      return <span className="p-2 rounded-lg bg-zinc-700/30 text-zinc-400 border border-zinc-700/55 flex items-center justify-center shrink-0"><Bell size={14} /></span>;
  }
};

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuthStore();
  const isAdminArea = location.pathname.startsWith(ADMIN_BASE);
  const effectiveRoles = resolveUserRoles(user?.roles, token);
  const menuConfig = isAdminArea ? ADMIN_MENU : WORKSPACE_MENU;
  const menuItems = filterNavConfig(menuConfig, effectiveRoles).map(toMenuItem);
  const notificationsPath = getNotificationsPath(effectiveRoles);

  const isFullWidthPage = location.pathname.includes('/notifications') ||
    location.pathname.includes('/identity') ||
    location.pathname.includes('/profile') ||
    location.pathname === ADMIN_BASE;

  let pageTitle = isAdminArea ? 'Admin Console' : 'My workspace';
  const path = location.pathname;
  if (path.includes('/dashboard') || path === '/workspace') pageTitle = 'Dashboard';
  else if (path.includes('/projects') || path.includes('/sites')) pageTitle = 'Projects';
  else if (path.includes('/profile') || path.includes('/identity') || path.includes('/user-management')) pageTitle = path.includes('/user-management') ? 'User Management' : 'Personal Profile';
  else if (path.includes('/notifications')) pageTitle = 'Notifications';
  else if (path.includes('/trash')) pageTitle = 'Trash';
  else if (path.includes('/canvas')) pageTitle = 'AI Canvas';
  else if (path.includes('/media')) pageTitle = 'Media Library';
  else if (path.includes('/cms')) pageTitle = 'CMS Collections';

  const queryClient = useQueryClient();
  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
    retry: 1,
  });

  const displayNotifications = notifications || [];

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  const notificationContent = (
    <div style={{ width: 340, padding: '4px' }} className="gz-notif-popover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--gz-border, rgba(255,255,255,0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: '#fff', fontSize: '15px' }}>Notifications</strong>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: 'var(--color-accent, #3b82f6)' }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              onClick={() => markAllReadMutation.mutate()}
              style={{ fontSize: '11px', color: 'var(--gz-text-secondary, #a1a1aa)', padding: '0 4px' }}
            >
              Mark all as read
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => { setNotifOpen(false); navigate(notificationsPath); }}
            style={{ fontSize: '11px', padding: 0, fontWeight: 'bold' }}
          >
            View all
          </Button>
        </div>
      </div>
      {notifLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spin size="small" /></div>
      ) : !displayNotifications || displayNotifications.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gz-text-muted, #71717a)' }}>
          <Bell size={24} style={{ marginBottom: '8px', opacity: 0.5, display: 'inline-block' }} />
          <div>No new notifications</div>
        </div>
      ) : (
        <div style={{ maxHeight: '320px', overflowY: 'auto' }} className="gz-scrollbar">
          <List
            itemLayout="horizontal"
            dataSource={displayNotifications.slice(0, 5)}
            renderItem={(item) => (
              <div
                style={{
                  background: item.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                  border: item.isRead ? '1px solid transparent' : '1px solid rgba(59, 130, 246, 0.15)'
                }}
                className="hover:bg-zinc-800/40"
                onClick={() => {
                  if (!item.isRead) markReadMutation.mutate(item.id);
                  setNotifOpen(false);
                  navigate(notificationsPath);
                }}
              >
                {getNotificationIcon(item.metadata)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: item.isRead ? 500 : 700, color: item.isRead ? 'var(--gz-text-secondary, #d4d4d8)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--gz-text-muted, #71717a)', whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gz-text-muted, #a1a1aa)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.body}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );

  return (
    <Layout 
      className="admin-layout-wrapper"
      style={{ 
        minHeight: '100vh', 
        position: 'relative',
        backgroundColor: '#07090f',
        backgroundImage: `
          radial-gradient(circle at 50% 34%, rgba(255, 255, 255, 0.1), transparent 25%),
          radial-gradient(circle at 25% 25%, rgba(0, 229, 255, 0.25), transparent 40%),
          radial-gradient(circle at 75% 25%, rgba(139, 92, 246, 0.25), transparent 40%),
          radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.2), transparent 45%)
        `
      }} 
      hasSider
      onMouseMove={(e) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
      }}
    >
      {/* Aurora Background Effect (matching CanvasBuilder) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.15), transparent 25%),
          radial-gradient(circle at 30% 25%, rgba(0, 229, 255, 0.35), transparent 35%),
          radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.3), transparent 35%)
        `,
        filter: 'blur(60px)',
        opacity: 1
      }} />

      {/* Dot Grid Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)',
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0',
        opacity: 0.7
      }} />

      {/* Glowing Dot Grid Overlay (Mouse Hover) */}
      <div 
        className="admin-spotlight"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 0)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0',
          WebkitMaskImage: 'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent 40%)',
          maskImage: 'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent 40%)',
        }} 
      />

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={260}
        collapsedWidth={72}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)), rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          position: 'sticky',
          top: 16,
          height: 'calc(100vh - 32px)',
          margin: '16px',
          borderRadius: '24px',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -18px 36px rgba(255, 255, 255, 0.018),
            0 24px 80px rgba(0, 0, 0, 0.42),
            0 0 60px rgba(59, 130, 246, 0.14)
          `
        }}
      >
        {/* Inner Glow matching ai-prompt-bar */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          background: `
            radial-gradient(circle at 14% 0%, rgba(0, 229, 255, 0.16), transparent 34%),
            radial-gradient(circle at 86% 100%, rgba(139, 92, 246, 0.13), transparent 36%)
          `,
          opacity: 0.84,
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          height: 64,
          margin: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            title="Go to Homepage"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--color-accent)',
              fontSize: collapsed ? '16px' : '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <RocketOutlined style={{ color: '#60A5FA', fontSize: '20px' }} />
            {!collapsed && 'Genzite'}
          </button>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          defaultSelectedKeys={[isAdminArea ? ADMIN_BASE : WORKSPACE_BASE]}
          mode="inline"
          items={menuItems}
          onClick={(e) => navigate(e.key)}
          style={{ borderRight: 'none', padding: '8px 10px', background: 'transparent' }}
        />
        </div>
      </Sider>
      <Layout style={{ background: 'transparent', minWidth: 0 }}>
        <Header
          style={{
            padding: '0 24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)), rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            borderRadius: '24px',
            margin: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 16,
            zIndex: 90,
            height: 64,
            lineHeight: '64px',
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.08),
              inset 0 -18px 36px rgba(255, 255, 255, 0.018),
              0 24px 80px rgba(0, 0, 0, 0.42),
              0 0 60px rgba(59, 130, 246, 0.14)
            `
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={4} style={{ 
              margin: 0, 
              fontWeight: 800,
              background: 'linear-gradient(92deg, rgba(255,255,255,.99) 0%, rgba(184,247,255,.96) 46%, rgba(193,173,255,.94) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              {pageTitle}
            </Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Popover placement="bottomRight" content={notificationContent} trigger="click" open={notifOpen} onOpenChange={setNotifOpen}>
              <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<Bell size={20} color="var(--color-text-secondary)" />}
                  style={{ width: 36, height: 36 }}
                />
              </Badge>
            </Popover>
            <UserAccountMenu avatarSize={34} />
          </div>
        </Header>
        <Content id="admin-content-scroll" style={{ padding: isFullWidthPage ? 0 : '24px 28px', overflow: 'auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              padding: 0,
              minHeight: 360,
              width: '100%',
              background: 'transparent',
              height: isFullWidthPage ? '100%' : 'auto',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
      <FloatButton.BackTop style={{ right: 24, bottom: 24 }} />
    </Layout>
  );
};

export default AdminLayout;
