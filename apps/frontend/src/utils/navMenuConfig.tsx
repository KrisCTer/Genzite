import React from 'react';
import {
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  PictureOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  BellOutlined,
  RobotOutlined,
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
  { label: 'Hồ sơ cá nhân', key: `${WORKSPACE_BASE}/profile`, icon: <UserOutlined />, roles: VIEWER_ROLES },
  { label: 'Notifications', key: `${WORKSPACE_BASE}/notifications`, icon: <BellOutlined />, roles: VIEWER_ROLES },
  {
    label: 'AI Services',
    key: 'workspace-ai',
    icon: <RobotOutlined />,
    roles: VIEWER_ROLES,
    children: [
      { label: 'Resume Builder', key: `${WORKSPACE_BASE}/ai/resume`, roles: VIEWER_ROLES },
      { label: 'AI Interview', key: `${WORKSPACE_BASE}/ai/interview`, roles: VIEWER_ROLES },
      { label: 'AI Canvas', key: `${WORKSPACE_BASE}/site/canvas`, roles: VIEWER_ROLES },
      { label: 'Agent Workspace', key: `${WORKSPACE_BASE}/ai/agent`, roles: VIEWER_ROLES },
    ],
  },
];

export const ADMIN_MENU: NavMenuConfig[] = [
  { label: 'Dashboard', key: ADMIN_BASE, icon: <PieChartOutlined />, roles: STAFF_ROLES },
  { label: 'Hồ sơ cá nhân', key: `${ADMIN_BASE}/profile`, icon: <UserOutlined />, roles: STAFF_ROLES },
  { label: 'Identity (Users/Roles)', key: `${ADMIN_BASE}/identity`, icon: <TeamOutlined />, roles: ['ADMIN'] },
  { label: 'Media Library', key: `${ADMIN_BASE}/media`, icon: <PictureOutlined />, roles: STAFF_ROLES },
  { label: 'Data CMS', key: `${ADMIN_BASE}/cms`, icon: <DatabaseOutlined />, roles: STAFF_ROLES },
  { label: 'Site Builder', key: `${ADMIN_BASE}/site`, icon: <GlobalOutlined />, roles: STAFF_ROLES },
  { label: 'Notifications', key: `${ADMIN_BASE}/notifications`, icon: <BellOutlined />, roles: STAFF_ROLES },
  {
    label: 'AI Services',
    key: 'admin-ai',
    icon: <RobotOutlined />,
    roles: STAFF_ROLES,
    children: [
      { label: 'Resume Builder', key: `${ADMIN_BASE}/ai/resume`, roles: STAFF_ROLES },
      { label: 'AI Interview', key: `${ADMIN_BASE}/ai/interview`, roles: STAFF_ROLES },
      { label: 'AI Canvas', key: `${ADMIN_BASE}/site/canvas`, roles: STAFF_ROLES },
      { label: 'Agent Workspace', key: `${ADMIN_BASE}/ai/agent`, roles: STAFF_ROLES },
      { label: 'Agent Logs', key: `${ADMIN_BASE}/ai/logs`, roles: STAFF_ROLES },
    ],
  },
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
