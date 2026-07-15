import React from 'react';
import {
  PieChartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  RobotOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  ADMIN_BASE,
  WORKSPACE_BASE,
  STAFF_ROLES,
  VIEWER_ROLES,
  hasRole,
} from './userNav';

export type NavMenuConfig = {
  label: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  roles: readonly string[];
  children?: NavMenuConfig[];
};

export const WORKSPACE_MENU: NavMenuConfig[] = [
  { label: 'Dashboard', key: WORKSPACE_BASE, icon: <PieChartOutlined />, roles: VIEWER_ROLES },
  { label: 'Projects', key: `${WORKSPACE_BASE}/projects`, icon: <AppstoreOutlined />, roles: VIEWER_ROLES },
  { label: 'Profile', key: `${WORKSPACE_BASE}/profile`, icon: <UserOutlined />, roles: VIEWER_ROLES },
  { label: 'Notifications', key: `${WORKSPACE_BASE}/notifications`, icon: <BellOutlined />, roles: VIEWER_ROLES },
  { label: 'Trash', key: `${WORKSPACE_BASE}/trash`, icon: <DeleteOutlined />, roles: VIEWER_ROLES },
  {
    label: 'AI Services',
    key: 'workspace-ai',
    icon: <RobotOutlined />,
    roles: VIEWER_ROLES,
    children: [
      { label: 'AI Canvas', key: '/project', roles: VIEWER_ROLES },
    ],
  },
];

export const ADMIN_MENU: NavMenuConfig[] = [
  { label: 'Dashboard', key: ADMIN_BASE, icon: <PieChartOutlined />, roles: STAFF_ROLES },
  { label: 'Profile', key: `${ADMIN_BASE}/profile`, icon: <UserOutlined />, roles: STAFF_ROLES },
  { label: 'Notifications', key: `${ADMIN_BASE}/notifications`, icon: <BellOutlined />, roles: STAFF_ROLES },
  { label: 'Trash', key: `${ADMIN_BASE}/trash`, icon: <DeleteOutlined />, roles: STAFF_ROLES },
  { label: 'Identity (Users/Roles)', key: `${ADMIN_BASE}/identity`, icon: <TeamOutlined />, roles: ['ADMIN'] },
];

export function filterNavConfig(config: NavMenuConfig[], roles: string[]): NavMenuConfig[] {
  return config
    .filter((item) => hasRole(roles, item.roles))
    .map((item) => ({
      ...item,
      children: item.children ? filterNavConfig(item.children, roles) : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}
