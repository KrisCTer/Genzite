import React, { useState } from 'react';
import { Table, Space, Button, Avatar, Drawer, Form, Input, Select, Switch, message, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined, MoreOutlined, TeamOutlined, ThunderboltOutlined, MailOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUsersApi, type User } from '../../api/users';
import { motion } from 'framer-motion';

const { Option } = Select;

// Premium Stitch-Style Mock Data for frontend-only preview matching Genzite schema
const MOCK_USERS: User[] = [
  {
    id: 'mock-1',
    name: 'Stitch Designer',
    email: 'admin@genzite.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    roles: ['ADMIN'],
    isActive: true,
    createdAt: new Date(2026, 0, 15).toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Sarah Connor',
    email: 'sarah.c@genzite.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    roles: ['EDITOR'],
    isActive: true,
    createdAt: new Date(2026, 2, 8).toISOString(),
  },
  {
    id: 'mock-3',
    name: 'James Carter',
    email: 'james.carter@genzite.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    roles: ['MEMBER'],
    isActive: false,
    createdAt: new Date(2026, 4, 20).toISOString(),
  },
  {
    id: 'mock-4',
    name: 'Elena Rostova',
    email: 'elena.r@genzite.com',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    roles: ['MEMBER', 'EDITOR'],
    isActive: true,
    createdAt: new Date(2026, 5, 12).toISOString(),
  }
];

// Deterministic mock active times based on user ID
const getLastActiveString = (userId: string) => {
  if (userId === 'mock-1') return 'Just now';
  if (userId === 'mock-2') return '2 hours ago';
  if (userId === 'mock-3') return '3 days ago';
  if (userId === 'mock-4') return '1 day ago';
  
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hours = (hash % 24) + 1;
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
};

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [localUsers, setLocalUsers] = useState<User[]>(MOCK_USERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data: serverUsers, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersApi,
    retry: false,
  });

  // Sync server data or use local mock state
  const displayUsers = (serverUsers && serverUsers.length > 0) ? serverUsers : localUsers;

  // Filter list based on Search and Dropdown filters
  const filteredUsers = displayUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'ACTIVE' && u.isActive) || 
                          (statusFilter === 'INACTIVE' && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenDrawer = (user: User | null = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        roles: user.roles,
        isActive: user.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, roles: ['MEMBER'] });
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (values: any) => {
    if (editingUser) {
      setLocalUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
      message.success(`Updated user ${values.name} successfully!`);
    } else {
      const newUser: User = {
        id: `mock-${Date.now()}`,
        name: values.name,
        email: values.email,
        roles: values.roles,
        isActive: values.isActive,
        createdAt: new Date().toISOString(),
        avatarUrl: null,
      };
      setLocalUsers(prev => [...prev, newUser]);
      message.success(`Created user ${values.name} successfully!`);
    }
    handleCloseDrawer();
  };

  const handleDeleteUser = (id: string, name: string) => {
    setLocalUsers(prev => prev.filter(u => u.id !== id));
    message.success(`Removed user ${name}`);
  };

  // Action Menu items helper for Card view mode
  const getCardMenuItems = (user: User) => [
    {
      key: 'edit',
      label: 'Edit Profile',
      icon: <EditOutlined />,
      onClick: () => handleOpenDrawer(user),
    },
    {
      key: 'status',
      label: user.isActive ? 'Deactivate Account' : 'Activate Account',
      onClick: () => {
        setLocalUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        message.success(`${user.isActive ? 'Deactivated' : 'Activated'} ${user.name} successfully!`);
      }
    },
    {
      key: 'delete',
      label: 'Delete User',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteUser(user.id, user.name),
    }
  ];

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Avatar 
            src={record.avatarUrl || undefined} 
            icon={!record.avatarUrl ? <UserOutlined /> : undefined}
            className="border border-[#06b6d4]/20 bg-[#0e1422]"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-wide text-sm">{record.name}</span>
            <span className="text-xs text-slate-400">{record.email}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Permissions Role',
      key: 'roles',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <div className="flex gap-1.5">
          {roles.map((role) => {
            const isAdmin = role === 'ADMIN';
            const isEditor = role === 'EDITOR';
            return (
              <span 
                key={role}
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  isAdmin 
                    ? 'bg-yellow-500/15 border-yellow-500/10 text-yellow-300' 
                    : isEditor
                    ? 'bg-[#06b6d4]/15 border-[#06b6d4]/10 text-[#06b6d4]'
                    : 'bg-slate-500/15 border-slate-500/10 text-slate-300'
                }`}
              >
                {role.toUpperCase()}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Access Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <span 
          className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
            isActive 
              ? 'bg-emerald-500/15 border-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/15 border-rose-500/10 text-rose-400'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-slate-300 text-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small" className="row-actions">
          <Button 
            icon={<EditOutlined className="text-[#06b6d4]" />} 
            type="text" 
            onClick={() => handleOpenDrawer(record)}
            className="hover:bg-[#06b6d4]/10 rounded-lg flex items-center justify-center w-8 h-8"
          />
          <Button 
            icon={<DeleteOutlined className="text-rose-400" />} 
            type="text" 
            danger 
            onClick={() => handleDeleteUser(record.id, record.name)}
            className="hover:bg-rose-500/10 rounded-lg flex items-center justify-center w-8 h-8"
          />
        </Space>
      ),
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col w-full px-1 text-left"
    >
      {/* Dynamic styling block to override Ant Design table styles for Genzite's dark theme */}
      <style>{`
        /* custom table overrides */
        .antd-custom-table .ant-table {
          background: transparent !important;
        }
        .antd-custom-table .ant-table-thead > tr > th {
          background: rgba(14, 20, 34, 0.4) !important;
          color: #94a3b8 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-weight: 600 !important;
        }
        .antd-custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          background: transparent !important;
          color: #cbd5e1 !important;
        }
        .antd-custom-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.04) !important;
          transition: background 0.2s ease;
        }
        
        /* Action column hover logic */
        .antd-custom-table .ant-table-tbody > tr .row-actions {
          opacity: 0.25;
          transition: opacity 0.2s ease;
        }
        .antd-custom-table .ant-table-tbody > tr:hover .row-actions {
          opacity: 1;
        }

        /* custom pagination overrides */
        .antd-custom-table .ant-pagination-item {
          background: #0f1422 !important;
          border-color: rgba(255, 255, 255, 0.05) !important;
        }
        .antd-custom-table .ant-pagination-item a {
          color: #94a3b8 !important;
        }
        .antd-custom-table .ant-pagination-item-active {
          border-color: #06b6d4 !important;
          background: rgba(6, 182, 212, 0.1) !important;
        }
        .antd-custom-table .ant-pagination-item-active a {
          color: #06b6d4 !important;
        }
        .antd-custom-table .ant-pagination-prev .ant-pagination-item-link,
        .antd-custom-table .ant-pagination-next .ant-pagination-item-link {
          background: #0f1422 !important;
          border-color: rgba(255, 255, 255, 0.05) !important;
          color: #94a3b8 !important;
        }

        /* custom input prefixes and search selectors */
        .gz-search-input {
          background-color: #0e1422 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 8px !important;
          color: #ffffff !important;
          height: 40px !important;
        }
        .gz-search-input:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .gz-search-input-focused, .gz-search-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2) !important;
        }
        .gz-search-input input {
          background-color: transparent !important;
          color: #ffffff !important;
        }

        /* select option classes */
        .gz-select-filter .ant-select-selector {
          background-color: #0e1422 !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 8px !important;
          color: #ffffff !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }
        .gz-select-filter .ant-select-selector:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .gz-select-filter.ant-select-focused .ant-select-selector {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2) !important;
        }
        .gz-select-filter .ant-select-selection-item {
          color: #ffffff !important;
        }
        .gz-select-filter .ant-select-arrow {
          color: #94a3b8 !important;
        }

        /* global select dropdown customization */
        .ant-select-dropdown {
          background-color: #0f1422 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
        }
        .ant-select-item {
          color: #cbd5e1 !important;
        }
        .ant-select-item-option-selected {
          background-color: rgba(6, 182, 212, 0.15) !important;
          color: #06b6d4 !important;
          font-weight: 600 !important;
          margin: 2px 4px !important;
          border-radius: 4px !important;
        }
        .ant-select-item-option-active {
          background-color: rgba(255, 255, 255, 0.04) !important;
          color: #ffffff !important;
          margin: 2px 4px !important;
          border-radius: 4px !important;
        }

        /* dropdown menu overrides */
        .ant-dropdown-menu {
          background-color: #0f1422 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          padding: 6px !important;
          border-radius: 8px !important;
        }
        .ant-dropdown-menu-item {
          color: #cbd5e1 !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          transition: all 0.15s ease !important;
        }
        .ant-dropdown-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
          color: #ffffff !important;
        }
        .ant-dropdown-menu-item-danger {
          color: #f87171 !important;
        }
        .ant-dropdown-menu-item-danger:hover {
          background-color: rgba(239, 68, 68, 0.1) !important;
          color: #f87171 !important;
        }

        /* drawer custom select tags */
        .stitch-drawer .ant-input {
          background-color: #0f1422 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          border-radius: 8px !important;
          height: 40px !important;
        }
        .stitch-drawer .ant-input:focus,
        .stitch-drawer .ant-input:hover {
          border-color: #06b6d4 !important;
        }
        .stitch-drawer .ant-select-selector {
          background-color: #0f1422 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          border-radius: 8px !important;
        }
        .stitch-drawer .ant-select-selector:hover {
          border-color: #06b6d4 !important;
        }
        .stitch-drawer .ant-select-selection-item {
          background-color: rgba(6, 182, 212, 0.1) !important;
          border: 1px solid rgba(6, 182, 212, 0.2) !important;
          color: #06b6d4 !important;
        }
        .stitch-drawer .ant-select-selection-item-remove {
          color: #06b6d4 !important;
        }
        
        /* switch color overrides */
        .ant-switch-checked {
          background-color: #06b6d4 !important;
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Identity Directory</h2>
          <p className="text-slate-400 text-xs mt-1">Manage system user profiles, permissions, and security roles.</p>
        </div>

        {/* View Mode Switcher + Add Member Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0f1422] p-1 rounded-lg border border-white/5 h-9 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`w-7 h-7 rounded-md transition-all cursor-pointer flex items-center justify-center border-0 ${viewMode === 'cards' ? 'bg-[#06b6d4] text-[#090D16]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <AppstoreOutlined className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`w-7 h-7 rounded-md transition-all cursor-pointer flex items-center justify-center border-0 ${viewMode === 'table' ? 'bg-[#06b6d4] text-[#090D16]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <UnorderedListOutlined className="text-sm" />
            </button>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => handleOpenDrawer(null)}
            className="bg-gradient-to-r from-[#06b6d4] to-[#10b981] border-0 text-[#090D16] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_16px_rgba(6,182,212,0.15)] h-9 px-4 text-xs uppercase tracking-wider"
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Backend Offline Elegant Notification Banner */}
      {isError && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6 text-xs text-yellow-300 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span>Backend offline. Running with Genzite mock fallback profiles.</span>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })} 
            className="text-xs font-bold text-[#06b6d4] hover:underline cursor-pointer bg-transparent border-0 outline-none"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 w-full">
        {[
          { label: 'Total Users', value: displayUsers.length, color: 'text-[#06b6d4]', desc: 'Total accounts', icon: <TeamOutlined />, iconColor: 'text-[#06b6d4]/20' },
          { label: 'Active Users', value: displayUsers.filter(u => u.isActive).length, color: 'text-emerald-400', desc: 'Active sessions', icon: <ThunderboltOutlined />, iconColor: 'text-emerald-400/20' },
          { label: 'Pending Invites', value: displayUsers.filter(u => !u.isActive).length, color: 'text-yellow-300', desc: 'Awaiting setup', icon: <MailOutlined />, iconColor: 'text-yellow-300/20' }
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden bg-[#0e1422] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-colors shadow-sm">
            <div className="flex flex-col z-10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl font-bold ${stat.color} tracking-tight`}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 font-normal">{stat.desc}</span>
              </div>
            </div>
            {/* Ambient translucent icon in the right corner */}
            <div className={`absolute right-3 bottom-3 text-4xl ${stat.iconColor} select-none pointer-events-none z-0`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Inline Filters Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 w-full">
        {/* Left side: Search input + Role Quick Badges */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
          {/* Search bar */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              className="gz-search-input"
            />
          </div>

          {/* Quick Role Filters */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Role:</span>
            {[
              { label: 'All', value: 'ALL', count: displayUsers.length },
              { label: 'Admins', value: 'ADMIN', count: displayUsers.filter(u => u.roles.includes('ADMIN')).length },
              { label: 'Editors', value: 'EDITOR', count: displayUsers.filter(u => u.roles.includes('EDITOR')).length },
              { label: 'Members', value: 'MEMBER', count: displayUsers.filter(u => u.roles.includes('MEMBER')).length },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setRoleFilter(btn.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                  roleFilter === btn.value
                    ? 'bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#06b6d4]'
                    : 'bg-[#0e1422] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <span>{btn.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  roleFilter === btn.value
                    ? 'bg-[#06b6d4]/20 text-[#06b6d4]'
                    : 'bg-white/5 text-slate-500'
                }`}>
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side: Status Dropdown */}
        <div className="w-full sm:w-[150px] shrink-0">
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="gz-select-filter w-full text-xs"
          >
            <Option value="ALL">All Status</Option>
            <Option value="ACTIVE">Active Only</Option>
            <Option value="INACTIVE">Inactive Only</Option>
          </Select>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          CARDS VIEW: Unified Grid Layout
          ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'cards' ? (
        filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No users match the selected filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredUsers.map((user) => {
              const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              // Primary role logic for custom hover styles
              const isUserAdmin = user.roles.includes('ADMIN');
              const isUserEditor = user.roles.includes('EDITOR');
              const primaryRoleClass = isUserAdmin 
                ? 'hover:border-yellow-500/30 hover:shadow-[0_8px_24px_rgba(251,191,36,0.05)]' 
                : isUserEditor
                ? 'hover:border-[#06b6d4]/30 hover:shadow-[0_8px_24px_rgba(6,182,212,0.05)]'
                : 'hover:border-slate-500/30 hover:shadow-[0_8px_24px_rgba(148,163,184,0.05)]';

              return (
                <div 
                  key={user.id} 
                  className={`group relative rounded-xl border border-white/5 bg-[#0e1422] p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between min-h-[140px] ${primaryRoleClass}`}
                >
                  {/* Action Dropdown Menu */}
                  <div className="absolute top-4 right-4">
                    <Dropdown 
                      menu={{ items: getCardMenuItems(user) }} 
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button 
                        icon={<MoreOutlined className="text-slate-400 hover:text-white" />} 
                        type="text" 
                        className="hover:bg-white/5 rounded-md w-8 h-8 flex items-center justify-center cursor-pointer border-0"
                      />
                    </Dropdown>
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={user.avatarUrl || undefined} 
                      icon={!user.avatarUrl ? <UserOutlined /> : undefined}
                      size={48}
                      className="border border-[#06b6d4]/20 bg-[#0e1422] shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-sm tracking-wide truncate">{user.name}</span>
                      <span className="text-slate-400 text-xs truncate mt-0.5">{user.email}</span>
                      
                      {/* Role tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {user.roles.map((r) => (
                          <span 
                            key={r}
                            className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
                              r === 'ADMIN' 
                                ? 'bg-yellow-500/15 border-yellow-500/10 text-yellow-300' 
                                : r === 'EDITOR'
                                ? 'bg-[#06b6d4]/15 border-[#06b6d4]/10 text-[#06b6d4]'
                                : 'bg-slate-500/15 border-slate-500/10 text-slate-300'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom details */}
                  <div className="flex flex-col gap-1 mt-6 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                    <div className="flex justify-between items-center w-full">
                      <span>Joined {joinedDate}</span>
                      <span 
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          user.isActive 
                            ? 'bg-emerald-500/15 border-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/15 border-rose-500/10 text-rose-400'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Last active: {getLastActiveString(user.id)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* TABLE VIEW (Standard Genzite table with dark overrides) */
        <div className="rounded-2xl border border-white/5 bg-[#090D16]/40 backdrop-blur-md overflow-hidden shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)]">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="antd-custom-table"
          />
        </div>
      )}

      {/* Slide-out Drawer for Add/Edit User */}
      <Drawer
        title={
          <span className="text-lg font-bold text-white tracking-wide">
            {editingUser ? 'Edit User Permissions' : 'Register New User'}
          </span>
        }
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerOpen}
        width={400}
        closeIcon={<span className="text-slate-400 hover:text-white">&times;</span>}
        className="stitch-drawer"
        styles={{
          header: {
            background: '#090d16',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '20px 24px',
          },
          body: {
            background: '#070b12',
            padding: '24px',
            color: '#f8faf8',
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUser}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={<span className="text-sm text-slate-300 font-medium">Full Name</span>}
            rules={[{ required: true, message: 'Please input full name!' }]}
            className="mb-5"
          >
            <Input placeholder="e.g. Sarah Connor" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-sm text-slate-300 font-medium">Email address</span>}
            rules={[{ required: true, message: 'Please input email!' }, { type: 'email', message: 'Invalid email format!' }]}
            className="mb-5"
          >
            <Input placeholder="e.g. sarah.c@genzite.com" disabled={editingUser !== null} />
          </Form.Item>

          <Form.Item
            name="roles"
            label={<span className="text-sm text-slate-300 font-medium">Access Roles</span>}
            rules={[{ required: true, message: 'Please select permissions' }]}
            className="mb-5"
          >
            <Select mode="multiple" placeholder="Select roles">
              <Option value="ADMIN">ADMIN</Option>
              <Option value="EDITOR">EDITOR</Option>
              <Option value="MEMBER">MEMBER</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label={<span className="text-sm text-slate-300 font-medium">Account Access Status</span>}
            valuePropName="checked"
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <Switch />
              <span className="text-xs text-slate-400 font-medium font-sans">Enable Genzite workspace logging access</span>
            </div>
          </Form.Item>

          <div className="flex gap-3 justify-end mt-8 border-t border-white/5 pt-6">
            <Button onClick={handleCloseDrawer} className="bg-slate-800/85 hover:bg-slate-800 border-white/10 text-slate-300 rounded-lg h-10 px-5 transition-all">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="bg-gradient-to-r from-[#06b6d4] to-[#10b981] border-0 text-[#090D16] font-bold rounded-lg h-10 px-5 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_0_16px_rgba(6,182,212,0.15)]"
            >
              {editingUser ? 'Save Changes' : 'Register User'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </motion.div>
  );
};

export default UserManagement;
