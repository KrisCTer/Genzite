import React, { useState } from 'react';
import { Button, Avatar, Drawer, Form, Input, Select, Switch, message, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  SearchOutlined, 
  TeamOutlined, 
  MailOutlined,
  SafetyOutlined,
  SettingOutlined,
  SaveOutlined,
  UndoOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUsersApi, type User } from '../../api/users';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

// Remove MOCK_USERS

const getLastActiveString = (userId: string) => {
  return 'Recently';
};

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface ModulePermissions {
  cms: Permission;
  siteBuilder: Permission;
  aiServices: Permission;
  identity: Permission;
}

interface FormValues {
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

const DEFAULT_PERMISSIONS = {
  read: false,
  write: false,
  delete: false
};

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: serverUsers, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersApi,
    retry: false,
  });

  const displayUsers = serverUsers || [];

  // Granular Permissions Matrix State
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, ModulePermissions>>({});

  // Sync matrix when users load
  React.useEffect(() => {
    if (displayUsers.length > 0 && Object.keys(permissionsMatrix).length === 0) {
      const initial: Record<string, ModulePermissions> = {};
      displayUsers.forEach(user => {
        const isAdmin = user.roles.includes('ADMIN');
        const isEditor = user.roles.includes('EDITOR');
        initial[user.id] = {
          cms: { read: true, write: isAdmin || isEditor, delete: isAdmin },
          siteBuilder: { read: true, write: isAdmin || isEditor, delete: isAdmin },
          aiServices: { read: true, write: isAdmin || isEditor, delete: isAdmin },
          identity: { read: isAdmin, write: isAdmin, delete: isAdmin }
        };
      });
      setPermissionsMatrix(initial);
      if (!selectedUserId) setSelectedUserId(displayUsers[0].id);
    }
  }, [displayUsers, permissionsMatrix, selectedUserId]);

  // Filter list based on search and status filters
  const filteredUsers = displayUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'ACTIVE' && u.isActive) || 
                          (statusFilter === 'INACTIVE' && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const selectedUser = displayUsers.find(u => u.id === selectedUserId) || filteredUsers[0] || null;

  // Matrix Temporary Edit State
  const [tempPermissions, setTempPermissions] = useState<ModulePermissions | null>(null);

  React.useEffect(() => {
    if (selectedUser && !tempPermissions) {
      const isAdmin = selectedUser.roles.includes('ADMIN');
      const isEditor = selectedUser.roles.includes('EDITOR');
      setTempPermissions({
        cms: { read: true, write: isAdmin || isEditor, delete: isAdmin },
        siteBuilder: { read: true, write: isAdmin || isEditor, delete: isAdmin },
        aiServices: { read: true, write: isAdmin || isEditor, delete: isAdmin },
        identity: { read: isAdmin, write: isAdmin, delete: isAdmin }
      });
    }
  }, [selectedUser]);

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    const user = displayUsers.find(u => u.id === id);
    if (user) {
      const userPerms = permissionsMatrix[id] || {
        cms: { ...DEFAULT_PERMISSIONS },
        siteBuilder: { ...DEFAULT_PERMISSIONS },
        aiServices: { ...DEFAULT_PERMISSIONS },
        identity: { ...DEFAULT_PERMISSIONS }
      };
      setTempPermissions(JSON.parse(JSON.stringify(userPerms)));
    } else {
      setTempPermissions(null);
    }
  };

  const handleOpenDrawer = () => {
    form.resetFields();
    form.setFieldsValue({ isActive: true, roles: ['MEMBER'] });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleSaveUser = (values: FormValues) => {
    message.info('Backend API for user mutation is not implemented yet.');
    handleCloseDrawer();
  };

  const handleDeleteUser = (id: string, name: string) => {
    message.info(`Backend API for deleting user is not implemented yet. Cannot delete ${name}.`);
  };

  const handleToggleUserActive = (checked: boolean) => {
    if (!selectedUser) return;
    message.info(`Backend API for updating status is not implemented yet.`);
  };

  const handlePermissionChange = (module: keyof ModulePermissions, action: keyof Permission, value: boolean) => {
    if (!tempPermissions) return;
    setTempPermissions(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [module]: {
          ...prev[module],
          [action]: value
        }
      };
    });
  };

  const handleSavePermissions = () => {
    if (!selectedUser || !tempPermissions) return;
    setPermissionsMatrix(prev => ({
      ...prev,
      [selectedUser.id]: JSON.parse(JSON.stringify(tempPermissions))
    }));
    message.success(`Saved granular permissions for ${selectedUser.name}`);
  };

  const handleResetPermissions = () => {
    if (!selectedUser) return;
    const original = permissionsMatrix[selectedUser.id] || {
      cms: { ...DEFAULT_PERMISSIONS },
      siteBuilder: { ...DEFAULT_PERMISSIONS },
      aiServices: { ...DEFAULT_PERMISSIONS },
      identity: { ...DEFAULT_PERMISSIONS }
    };
    setTempPermissions(JSON.parse(JSON.stringify(original)));
    message.info('Reverted to last saved permissions');
  };

  const isPermissionsDirty = () => {
    if (!selectedUser || !tempPermissions) return false;
    const original = permissionsMatrix[selectedUser.id];
    if (!original) return true;
    return JSON.stringify(original) !== JSON.stringify(tempPermissions);
  };

  const getUserAccessSummary = (userId: string) => {
    const perms = permissionsMatrix[userId];
    if (!perms) return { r: 0, w: 0, d: 0 };
    let r = 0, w = 0, d = 0;
    Object.values(perms).forEach(p => {
      if (p.read) r++;
      if (p.write) w++;
      if (p.delete) d++;
    });
    return { r, w, d };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full text-left font-mono text-xs text-slate-300 min-h-screen bg-[#070B12] relative overflow-hidden"
    >
      {/* Tactical grid background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Dynamic overrides for custom tactical elements */}
      <style>{`
        .tactical-input {
          background-color: #0E1422 !important;
          border: 1px solid #1E293B !important;
          border-radius: 4px !important;
          color: #F8FAF8 !important;
          font-family: monospace !important;
        }
        .tactical-input:hover, .tactical-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1) !important;
        }
        .tactical-select .ant-select-selector {
          background-color: #0E1422 !important;
          border: 1px solid #1E293B !important;
          border-radius: 4px !important;
          color: #F8FAF8 !important;
        }
        .tactical-select.ant-select-focused .ant-select-selector {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1) !important;
        }
        .tactical-select .ant-select-selection-item {
          color: #F8FAF8 !important;
        }
        .tactical-switch.ant-switch-checked {
          background-color: #10B981 !important;
        }
        .tactical-checkbox {
          cursor: pointer;
          position: relative;
          display: inline-block;
          width: 14px;
          height: 14px;
        }
        .tactical-checkbox input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .tactical-checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 14px;
          width: 14px;
          background-color: #0E1422;
          border: 1px solid #1E293B;
          border-radius: 2px;
          transition: all 0.2s;
        }
        .tactical-checkbox:hover input ~ .tactical-checkmark {
          border-color: #06b6d4;
        }
        .tactical-checkbox input:checked ~ .tactical-checkmark {
          background-color: #06b6d4;
          border-color: #06b6d4;
        }
        .tactical-checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }
        .tactical-checkbox input:checked ~ .tactical-checkmark:after {
          display: block;
        }
        .tactical-checkbox .tactical-checkmark:after {
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid #070B12;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        /* Custom Admin checkmark color */
        .admin-matrix .tactical-checkbox input:checked ~ .tactical-checkmark {
          background-color: #F59E0B;
          border-color: #F59E0B;
        }
      `}</style>

      {/* Top Banner: Stats & Header Info */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between border-b border-[#1E293B] pb-6 mb-6 gap-6 z-10 relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#06B6D4] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#06B6D4]">Security Operation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 font-mono uppercase">Identity Directory</h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">Manage system user profiles, granular access permissions, and account credentials.</p>
        </div>

        {/* Tactical Overview Statistics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B] px-4 py-2 flex flex-col min-w-[100px] relative overflow-hidden">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Accounts</span>
            <span className="text-lg font-bold text-white mt-0.5">{displayUsers.length}</span>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#06B6D4]"></div>
          </div>
          <div className="bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B] px-4 py-2 flex flex-col min-w-[100px] relative overflow-hidden">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Status</span>
            <span className="text-lg font-bold text-[#10B981] mt-0.5">{displayUsers.filter(u => u.isActive).length}</span>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#10B981]"></div>
          </div>
          <div className="bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B] px-4 py-2 flex flex-col min-w-[100px] relative overflow-hidden">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Revoked Access</span>
            <span className="text-lg font-bold text-rose-500 mt-0.5">{displayUsers.filter(u => !u.isActive).length}</span>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenDrawer}
            className="bg-transparent border border-[#06b6d4] hover:bg-[#06b6d4]/10 hover:border-[#06b6d4] text-[#06b6d4] font-bold rounded-none h-10 px-4 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            Create Credentials
          </Button>
        </div>
      </div>

      {/* Connection Offline Bar */}
      {isError && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-none mb-6 text-xs text-yellow-300 z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span>Identity services unreachable. Initializing cached memory parameters.</span>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })} 
            className="text-xs font-bold text-[#06b6d4] hover:underline cursor-pointer bg-transparent border-0 outline-none"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Master-Detail Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start z-10 relative">
        
        {/* ==========================================
            LEFT PANEL: Users Directory List (45%)
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B] p-4 flex flex-col gap-4">
            
            {/* Search Input */}
            <Input
              placeholder="Search by identity parameter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-slate-400 mr-2" />}
              className="tactical-input h-10"
            />

            {/* Quick Status / Role Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E293B]">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Admins', value: 'ADMIN' },
                  { label: 'Editors', value: 'EDITOR' },
                  { label: 'Members', value: 'MEMBER' },
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setRoleFilter(btn.value)}
                    className={`px-2.5 py-1.5 transition-all border text-[10px] ${
                      roleFilter === btn.value
                        ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]'
                        : 'bg-[#070B12] border-[#1E293B] text-slate-400 hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="w-28 shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  className="tactical-select w-full text-[10px]"
                  size="small"
                >
                  <Option value="ALL">All Status</Option>
                  <Option value="ACTIVE">Active Only</Option>
                  <Option value="INACTIVE">Inactive Only</Option>
                </Select>
              </div>
            </div>

          </div>

          {/* Scrollable User Directory */}
          <div className="max-h-[600px] overflow-y-auto pr-1 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B]">
                  No identities match specified filters.
                </div>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isSelected = selectedUserId === user.id;
                  const isAdmin = user.roles.includes('ADMIN');
                  const isEditor = user.roles.includes('EDITOR');

                  let indicatorBorder = 'border-l-2 border-slate-500';
                  let activeBadgeColor = 'text-slate-400 border-slate-500/20 bg-slate-500/5';
                  if (isAdmin) {
                    indicatorBorder = 'border-l-2 border-[#F59E0B]';
                    activeBadgeColor = 'text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/5';
                  } else if (isEditor) {
                    indicatorBorder = 'border-l-2 border-[#06B6D4]';
                    activeBadgeColor = 'text-[#06B6D4] border-[#06B6D4]/20 bg-[#06B6D4]/5';
                  }

                  const summary = getUserAccessSummary(user.id);

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectUser(user.id)}
                      className={`relative bg-[#0E1422]/90 backdrop-blur-sm border ${
                        isSelected 
                          ? 'border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.1)] translate-x-1' 
                          : 'border-[#1E293B] hover:border-slate-600 hover:translate-x-0.5'
                      } p-4 flex items-center justify-between cursor-pointer transition-all ${indicatorBorder}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar 
                            src={user.avatarUrl || undefined} 
                            icon={!user.avatarUrl ? <UserOutlined /> : undefined}
                            className="bg-[#070B12] border border-[#1E293B]"
                          />
                          {user.isActive ? (
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#10B981] border-2 border-[#0E1422] rounded-full animate-pulse"></span>
                          ) : (
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-rose-500 border-2 border-[#0E1422] rounded-full"></span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white tracking-wide">{user.name}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{user.email}</span>
                          
                          {/* Mini Permission Clearance LED Dots */}
                          <div className="flex gap-1 mt-1.5 items-center">
                            <span className="text-[8px] text-slate-600 mr-1 uppercase tracking-wider font-semibold">Clearance:</span>
                            <Tooltip title={`Read access enabled in ${summary.r} modules`}>
                              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${summary.r > 0 ? 'bg-[#10B981] shadow-[0_0_4px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></span>
                            </Tooltip>
                            <Tooltip title={`Write access enabled in ${summary.w} modules`}>
                              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${summary.w > 0 ? 'bg-[#06B6D4] shadow-[0_0_4px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`}></span>
                            </Tooltip>
                            <Tooltip title={`Delete access enabled in ${summary.d} modules`}>
                              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${summary.d > 0 ? 'bg-[#F59E0B] shadow-[0_0_4px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`}></span>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${activeBadgeColor} border`}>
                          {user.roles[0]}
                        </span>
                        <span className="text-[9px] text-slate-600 font-medium">
                          {getLastActiveString(user.id)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: Identity Details Dashboard (55%)
            ========================================== */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!selectedUser ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B] p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[480px]"
              >
                <TeamOutlined className="text-3xl text-slate-700 mb-3" />
                <span className="uppercase tracking-widest font-semibold text-xs">No active terminal selected</span>
                <p className="text-[11px] text-slate-600 mt-2 max-w-xs">Select an identity from the sidebar to inspect credentials and access permissions.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedUser.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Details Card */}
                <div className="bg-[#0E1422]/90 backdrop-blur-sm border border-[#1E293B] p-6 relative">
                  
                  {/* Status Toggle & Details Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1E293B] pb-5 mb-5 gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar 
                        src={selectedUser.avatarUrl || undefined} 
                        icon={!selectedUser.avatarUrl ? <UserOutlined /> : undefined}
                        size={64}
                        className="bg-[#070B12] border border-[#1E293B] rounded-none shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white tracking-wide">{selectedUser.name}</h3>
                          <span className={`px-2 py-0.2 text-[9px] font-bold border uppercase tracking-wider ${
                            selectedUser.roles.includes('ADMIN')
                              ? 'text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/5'
                              : selectedUser.roles.includes('EDITOR')
                              ? 'text-[#06B6D4] border-[#06B6D4]/20 bg-[#06B6D4]/5'
                              : 'text-slate-400 border-slate-500/20 bg-slate-500/5'
                          }`}>
                            {selectedUser.roles.join(' / ')}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                          <MailOutlined className="text-[10px]" /> {selectedUser.email}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          Joined on: {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#070B12] border border-[#1E293B] px-3.5 py-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Network Access</span>
                        <span className={`text-[10px] font-bold ${selectedUser.isActive ? 'text-[#10B981]' : 'text-rose-500'}`}>
                          {selectedUser.isActive ? 'AUTHORIZED' : 'ACCESS REVOKED'}
                        </span>
                      </div>
                      <Switch 
                        checked={selectedUser.isActive}
                        onChange={handleToggleUserActive}
                        className="tactical-switch shrink-0"
                        size="small"
                      />
                    </div>
                  </div>

                  {/* Granular Permissions Matrix */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <SafetyOutlined className="text-[#06b6d4]" />
                      <span className="uppercase tracking-wider font-bold text-white">Granular Permissions Matrix</span>
                    </div>

                    {tempPermissions && (
                      <div className={`border border-[#1E293B] overflow-hidden ${selectedUser.roles.includes('ADMIN') ? 'admin-matrix' : ''}`}>
                        <div className="grid grid-cols-12 bg-[#070B12] border-b border-[#1E293B] p-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                          <div className="col-span-5">System Module</div>
                          <div className="col-span-1.5 text-center">Read</div>
                          <div className="col-span-1.5 text-center">Write</div>
                          <div className="col-span-1.5 text-center">Delete</div>
                          <div className="col-span-2.5 text-right pr-2">Access Indicator</div>
                        </div>

                        {[
                          { key: 'cms', label: 'Data CMS & Collections' },
                          { key: 'siteBuilder', label: 'Canvas Site Builder' },
                          { key: 'aiServices', label: 'AI Services (Gemini Client)' },
                          { key: 'identity', label: 'Identity / Access Control' },
                        ].map((row, rIdx) => {
                          const moduleKey = row.key as keyof ModulePermissions;
                          const perms = tempPermissions[moduleKey] || { ...DEFAULT_PERMISSIONS };

                          return (
                            <div 
                              key={row.key} 
                              className={`grid grid-cols-12 items-center p-3 text-[11px] ${
                                rIdx % 2 === 0 ? 'bg-[#0E1422]' : 'bg-[#090D16]/40'
                              } border-b border-[#1E293B]/60`}
                            >
                              <div className="col-span-5 font-bold text-slate-300">{row.label}</div>
                              
                              <div className="col-span-1.5 flex justify-center">
                                <label className="tactical-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={perms.read} 
                                    onChange={(e) => handlePermissionChange(moduleKey, 'read', e.target.checked)}
                                  />
                                  <span className="tactical-checkmark"></span>
                                </label>
                              </div>
                              
                              <div className="col-span-1.5 flex justify-center">
                                <label className="tactical-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={perms.write} 
                                    onChange={(e) => handlePermissionChange(moduleKey, 'write', e.target.checked)}
                                  />
                                  <span className="tactical-checkmark"></span>
                                </label>
                              </div>
                              
                              <div className="col-span-1.5 flex justify-center">
                                <label className="tactical-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={perms.delete} 
                                    onChange={(e) => handlePermissionChange(moduleKey, 'delete', e.target.checked)}
                                  />
                                  <span className="tactical-checkmark"></span>
                                </label>
                              </div>

                              {/* Glowing LED Status Matrix Progress Bar */}
                              <div className="col-span-2.5 flex gap-1 justify-end pr-1">
                                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold border transition-all ${
                                  perms.read 
                                    ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.15)] font-semibold' 
                                    : 'bg-[#070B12] border-slate-900 text-slate-700'
                                }`}>R</span>
                                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold border transition-all ${
                                  perms.write 
                                    ? 'bg-[#06B6D4]/15 border-[#06B6D4]/30 text-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.15)] font-semibold' 
                                    : 'bg-[#070B12] border-slate-900 text-slate-700'
                                }`}>W</span>
                                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold border transition-all ${
                                  perms.delete 
                                    ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.15)] font-semibold' 
                                    : 'bg-[#070B12] border-slate-900 text-slate-700'
                                }`}>D</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Admin Warning info */}
                    {selectedUser.roles.includes('ADMIN') && (
                      <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/10 text-yellow-300 text-[10px] flex items-start gap-2">
                        <SettingOutlined className="mt-0.5 shrink-0" />
                        <span>Administrator accounts automatically bypass granular matrix limitations to ensure full recovery access.</span>
                      </div>
                    )}
                  </div>

                  {/* Permissions Action Buttons */}
                  <div className="flex gap-3 justify-end border-t border-[#1E293B] pt-4">
                    <Button 
                      icon={<UndoOutlined />} 
                      onClick={handleResetPermissions}
                      disabled={!isPermissionsDirty()}
                      className="bg-transparent border border-slate-600 hover:border-slate-500 text-slate-400 font-bold rounded-none h-9 px-4 text-[11px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      Reset Changes
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      onClick={handleSavePermissions}
                      disabled={!isPermissionsDirty()}
                      className="bg-transparent border border-[#06b6d4] hover:bg-[#06b6d4]/10 hover:border-[#06b6d4] text-[#06b6d4] font-bold rounded-none h-9 px-4 text-[11px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    >
                      Save Permissions
                    </Button>
                  </div>

                </div>

                {/* Danger Zone */}
                <div className="bg-[#0E1422]/90 backdrop-blur-sm border border-rose-950 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-rose-500 animate-pulse"></span>
                    <span className="uppercase tracking-wider font-bold text-rose-400 font-mono">Terminal Danger Zone</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-slate-400 text-[11px] max-w-md font-sans">
                      Revoking access tokens or deleting credentials will immediately terminate all active workspace integrations and session logging capability for this operator.
                    </p>
                    <Button 
                      danger 
                      type="primary" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name)}
                      className="bg-transparent border border-rose-500 hover:bg-rose-500/10 hover:border-rose-500 text-rose-500 font-bold rounded-none h-9 px-4 text-[11px] uppercase tracking-wider transition-all shrink-0 flex items-center justify-center gap-1.5"
                    >
                      Revoke Identity
                    </Button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Slide-out Drawer for Add User */}
      <Drawer
        title={
          <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
            Register New Access Credentials
          </span>
        }
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerOpen}
        width={400}
        closeIcon={<CloseOutlined className="text-slate-400 hover:text-white" />}
        styles={{
          header: {
            background: '#0E1422',
            borderBottom: '1px solid #1E293B',
            padding: '20px 24px',
          },
          body: {
            background: '#070b12',
            padding: '24px',
            color: '#cbd5e1',
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
            label={<span className="text-xs text-slate-400 font-bold uppercase font-mono">Operator Full Name</span>}
            rules={[{ required: true, message: 'Please input full name!' }]}
            className="mb-5"
          >
            <Input placeholder="e.g. John Doe" className="tactical-input h-10" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-xs text-slate-400 font-bold uppercase font-mono">Secure Email Address</span>}
            rules={[{ required: true, message: 'Please input email!' }, { type: 'email', message: 'Invalid email format!' }]}
            className="mb-5"
          >
            <Input placeholder="e.g. john.doe@genzite.com" className="tactical-input h-10" />
          </Form.Item>

          <Form.Item
            name="roles"
            label={<span className="text-xs text-slate-400 font-bold uppercase font-mono">Access Role Definition</span>}
            rules={[{ required: true, message: 'Please select permissions' }]}
            className="mb-5"
          >
            <Select mode="multiple" placeholder="Select roles" className="tactical-select">
              <Option value="ADMIN">ADMIN</Option>
              <Option value="EDITOR">EDITOR</Option>
              <Option value="MEMBER">MEMBER</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label={<span className="text-xs text-slate-400 font-bold uppercase font-mono">Default Status</span>}
            valuePropName="checked"
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <Switch className="tactical-switch" />
              <span className="text-[10px] text-slate-500 font-mono">Authorize credentials immediately upon save</span>
            </div>
          </Form.Item>

          <div className="flex gap-3 justify-end mt-8 border-t border-[#1E293B] pt-6">
            <Button onClick={handleCloseDrawer} className="bg-transparent border border-slate-600 hover:border-slate-500 text-slate-400 font-bold rounded-none h-10 px-5 transition-all text-xs uppercase font-mono">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="bg-transparent border border-[#06b6d4] hover:bg-[#06b6d4]/10 hover:border-[#06b6d4] text-[#06b6d4] font-bold rounded-none h-10 px-5 transition-all cursor-pointer text-xs uppercase font-mono"
            >
              Generate
            </Button>
          </div>
        </Form>
      </Drawer>
    </motion.div>
  );
};

export default UserManagement;
