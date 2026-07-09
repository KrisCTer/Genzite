import React, { useState } from 'react';
import { Layout, Menu, Typography, Dropdown, Badge, List, Popover, Button, Spin, FloatButton } from 'antd';
import {
  UserOutlined,
  DatabaseOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import UserAvatar from '../components/UserAvatar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi, type AppNotification } from '../api/notifications';
import { useAuthStore } from '../store/auth';
import { logoutApi } from '../api/auth';
import { hasMemberAccess, getNotificationsPath, getProfilePath, ADMIN_BASE, WORKSPACE_BASE } from '../utils/userNav';
import { resolveUserRoles } from '../utils/jwt';
import UserAccountMenu from '../components/UserAccountMenu';
import { ADMIN_MENU, WORKSPACE_MENU, filterNavConfig } from '../utils/navMenuConfig';
import { Shield, Sparkles, Info, DollarSign } from 'lucide-react';

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
      return <span className="p-2 rounded-lg bg-zinc-700/30 text-zinc-400 border border-zinc-700/55 flex items-center justify-center shrink-0"><BellOutlined style={{ fontSize: 14 }} /></span>;
  }
};

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuthStore();
  const isAdminArea = location.pathname.startsWith(ADMIN_BASE);
  const effectiveRoles = resolveUserRoles(user?.roles, token);
  const menuConfig = isAdminArea ? ADMIN_MENU : WORKSPACE_MENU;
  const menuItems = filterNavConfig(menuConfig, effectiveRoles).map(toMenuItem);
  const notificationsPath = getNotificationsPath(effectiveRoles);
  const profilePath = getProfilePath(effectiveRoles);

  const isFullWidthPage = location.pathname.includes('/notifications') ||
    location.pathname.includes('/identity') ||
    location.pathname.includes('/profile') ||
    location.pathname === ADMIN_BASE;

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
            style={{ fontSize: '11px', padding: 0 }}
          >
            View all
          </Button>
        </div>
      </div>
      {notifLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spin size="small" /></div>
      ) : !displayNotifications || displayNotifications.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gz-text-muted, #71717a)' }}>
          <BellOutlined style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }} />
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
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg-app)' }} hasSider>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={260}
        collapsedWidth={72}
        style={{
          borderRight: '1px solid var(--color-border)',
          background: 'var(--gz-dark-2)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          zIndex: 100
        }}
      >
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
            title="Về trang chủ"
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
      </Sider>
      <Layout style={{ background: 'transparent', minWidth: 0 }}>
        <Header
          style={{
            padding: '0 32px',
            background: 'var(--gz-dark-2)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            height: 56,
            lineHeight: '56px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={5} style={{ margin: 0, color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {isAdminArea ? 'Admin Console' : 'My workspace'}
            </Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Popover placement="bottomRight" content={notificationContent} trigger="click" open={notifOpen} onOpenChange={setNotifOpen}>
              <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }} />}
                  style={{ width: 36, height: 36 }}
                />
              </Badge>
            </Popover>
            <UserAccountMenu avatarSize={34} />
          </div>
        </Header>
        <Content id="admin-content-scroll" style={{ padding: isFullWidthPage ? 0 : '24px 28px', overflow: 'auto' }}>
          <div
            style={{
              padding: 0,
              minHeight: 360,
              maxWidth: isFullWidthPage ? '100%' : 1280,
              margin: '0 auto',
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
