import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Avatar, Dropdown, Badge, List, Popover, Button, Spin } from 'antd';
import {
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  PictureOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  BellOutlined,
  RobotOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationsApi, markNotificationAsReadApi } from '../api/notifications';
import { useAuthStore } from '../store/auth';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

import type { MenuProps } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Dashboard', '/admin', <PieChartOutlined />),
  getItem('Identity (Users/Roles)', '/admin/identity', <TeamOutlined />),
  getItem('Media Library', '/admin/media', <PictureOutlined />),
  getItem('Data CMS', '/admin/cms', <DatabaseOutlined />),
  getItem('Site Builder', '/admin/site', <GlobalOutlined />),
  getItem('Notifications', '/admin/notifications', <BellOutlined />),
  getItem('AI Services', 'sub1', <RobotOutlined />, [
    getItem('Resume Builder', '/admin/ai/resume'),
    getItem('AI Interview', '/admin/ai/interview'),
    getItem('Generate Site', '/admin/ai/generate'),
    getItem('Agent Workspace', '/admin/ai/agent'),
    getItem('Agent Logs', '/admin/ai/logs'),
  ]),
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const queryClient = useQueryClient();
  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotificationsApi,
    retry: 1,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const notificationContent = (
    <div style={{ width: 300 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong>Notifications</strong>
        <Button type="link" size="small" onClick={() => { setNotifOpen(false); navigate('/admin/notifications'); }}>View All</Button>
      </div>
      {notifLoading ? <Spin size="small" /> : (
        <List
          itemLayout="horizontal"
          dataSource={notifications?.slice(0, 5) || []}
          renderItem={(item) => (
            <List.Item
              actions={[
                !item.isRead && (
                  <Button 
                    key="read" 
                    type="text" 
                    size="small" 
                    icon={<CheckOutlined />} 
                    onClick={() => markReadMutation.mutate(item.id)} 
                  />
                )
              ]}
              style={{ background: item.isRead ? 'transparent' : '#f0f5ff', padding: '8px', cursor: 'pointer' }}
            >
              <List.Item.Meta
                title={<span style={{ fontSize: '13px' }}>{item.title}</span>}
                description={<span style={{ fontSize: '12px' }}>{item.content}</span>}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No notifications' }}
        />
      )}
    </div>
  );

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }} hasSider>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)} 
        theme="light"
        width={280}
        collapsedWidth={72}
        style={{
          borderRight: '1px solid #E5E7EB',
          background: '#FAFAFB',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          zIndex: 100
        }}
      >
        <div style={{ height: 64, margin: '0 20px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <strong style={{ color: '#111827', fontSize: collapsed ? '16px' : '20px', fontWeight: 700 }}>
            {collapsed ? 'GZ' : 'Genzite'}
          </strong>
        </div>
        <Menu 
          theme="light" 
          defaultSelectedKeys={['/admin']} 
          mode="inline" 
          items={items}
          onClick={(e) => navigate(e.key)}
          style={{ borderRight: 'none', padding: '16px 12px', background: 'transparent' }}
        />
      </Sider>
      <Layout style={{ background: 'transparent', minWidth: 0 }}>
        <Header 
          style={{ 
            padding: '0 32px', 
            background: '#FAFAFB', 
            borderBottom: '1px solid #E5E7EB',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            height: 64,
            lineHeight: '64px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <Title level={4} style={{ margin: 0, color: '#111827', fontWeight: 600 }}>Workspace</Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Popover placement="bottomRight" content={notificationContent} trigger="click" open={notifOpen} onOpenChange={setNotifOpen}>
              <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: '20px', color: '#475569' }} />} style={{ width: 40, height: 40 }} />
              </Badge>
            </Popover>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
              <Avatar size={36} style={{ backgroundColor: '#2563EB', cursor: 'pointer', fontWeight: 600 }} icon={!user?.name && <UserOutlined />}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ padding: '32px', overflow: 'hidden' }}>
          <div
            style={{
              padding: 0,
              minHeight: 360,
              maxWidth: 1280,
              margin: '0 auto',
              width: '100%',
              background: 'transparent',
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
