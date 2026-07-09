import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUsersApi,
  lockUserApi,
  unlockUserApi,
  adjustCreditsApi,
  updateRolesApi,
  deactivateUserApi,
  type User,
} from '../../api/users';
import { message, Drawer, Spin, Modal } from 'antd';
import { Search, Filter, Shield, ShieldAlert, Users, Lock, UserCheck, Plus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import '../NotificationsStyle.css';

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Drawer States
  const [localRoles, setLocalRoles] = useState<string[]>([]);
  const [creditsAmount, setCreditsAmount] = useState<string>('');

  useEffect(() => {
    document.title = 'User Management | Admin Console';
  }, []);

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersApi,
    retry: 1,
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const lockMutation = useMutation({
    mutationFn: lockUserApi,
    onSuccess: () => { 
      message.success('Account locked'); 
      setSelectedUser(prev => prev ? { ...prev, status: 'LOCKED' } : null);
      invalidate(); 
    },
    onError: () => message.error('Action failed'),
  });
  const unlockMutation = useMutation({
    mutationFn: unlockUserApi,
    onSuccess: () => { 
      message.success('Account unlocked'); 
      setSelectedUser(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
      invalidate(); 
    },
    onError: () => message.error('Action failed'),
  });
  const rolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) => updateRolesApi(id, roles),
    onSuccess: () => { message.success('Roles updated'); invalidate(); },
    onError: () => message.error('Failed to update roles'),
  });
  const deactivateMutation = useMutation({
    mutationFn: deactivateUserApi,
    onSuccess: () => { 
      message.success('Account deactivated/deleted'); 
      setIsDrawerOpen(false);
      invalidate(); 
    },
    onError: () => message.error('Cannot delete this account'),
  });
  const creditsMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => adjustCreditsApi(id, amount),
    onSuccess: (data) => {
      message.success(`Success! New balance: ${data.credits.toLocaleString()}`);
      setSelectedUser(prev => prev ? { ...prev, credits: data.credits } : null);
      invalidate();
    },
    onError: () => message.error('Failed to adjust credits'),
  });

  // KPI Stats
  const activeCount = useMemo(() => users.filter(u => u.status === 'ACTIVE').length, [users]);
  const lockedCount = useMemo(() => users.filter(u => u.status === 'LOCKED').length, [users]);

  const updateRolesMutation = useMutation({
    mutationFn: (data: { id: string; roles: string[] }) => updateRolesApi(data.id, data.roles),
    onSuccess: () => {
      message.success('Cập nhật quyền thành công.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Lỗi: Không thể cập nhật quyền.');
    }
  });

  // Filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.id.includes(q)) return false;
      if (roleFilter !== 'ALL' && !u.roles.includes(roleFilter)) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setLocalRoles([...user.roles]);
    setCreditsAmount('');
    setIsDrawerOpen(true);
  };

  const handleRoleToggle = (role: string) => {
    if (!selectedUser) return;
    let newRoles = [...localRoles];
    if (newRoles.includes(role)) {
      newRoles = newRoles.filter(r => r !== role);
    } else {
      newRoles.push(role);
    }
    setLocalRoles(newRoles);
    if (newRoles.length === 0) { message.warning('At least 1 role is required'); return; }
    rolesMutation.mutate({ id: selectedUser.id, roles: newRoles });
  };

  const handleSaveCredits = () => {
    if (!selectedUser) return;
    const val = parseInt(creditsAmount, 10);
    if (isNaN(val) || val === 0) return;
    creditsMutation.mutate({ id: selectedUser.id, amount: val });
    setCreditsAmount('');
  };

  const handleLockToggle = () => {
    if (!selectedUser) return;
    if (selectedUser.status === 'LOCKED') unlockMutation.mutate(selectedUser.id);
    else lockMutation.mutate(selectedUser.id);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    Modal.confirm({
      title: 'Danger Warning',
      content: `Are you sure you want to deactivate/delete account ${selectedUser.name}? This action might be irreversible.`,
      okText: 'Delete now',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deactivateMutation.mutate(selectedUser.id)
    });
  };

  if (isError) {
    return (
      <div className="hub-root flex flex-col items-center justify-center min-h-[calc(100vh-56px)]">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-white text-xl font-bold">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="hub-root select-none">
      <div className="hub-wrapper" style={{ maxWidth: '100%' }}>
        
        {/* Header */}
        <div className="hub-header">
          <h1 className="hub-header-title">User Management</h1>
          <p className="hub-header-desc">System for authorization, identity and account security.</p>
        </div>

        {/* KPI Stats */}
        <div className="hub-stats mb-8">
          <div className="hub-stat-card">
            <div className="hub-stat-icon cyan"><Users size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Total Accounts</span>
              <span className="hub-stat-value">{users.length}</span>
            </div>
          </div>
          <div className="hub-stat-card">
            <div className="hub-stat-icon green"><UserCheck size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Active</span>
              <span className="hub-stat-value">{activeCount}</span>
            </div>
          </div>
          <div className="hub-stat-card">
            <div className="hub-stat-icon amber"><Lock size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Locked</span>
              <span className="hub-stat-value">{lockedCount}</span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="hub-main" style={{ alignItems: 'start' }}>
          
          {/* Sidebar Filters */}
          <div className="hub-sidebar">
            <div className="hub-categories">
              <div className="hub-cat-title">Search</div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Email, name..."
                  style={{ paddingLeft: '40px' }}
                  className="w-full h-10 pr-4 bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl text-sm outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>

              <div className="hub-cat-title">Status</div>
              <button className={`hub-cat-btn ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>
                <div className="hub-cat-left"><Users className="hub-cat-icon" /> All</div>
              </button>
              <button className={`hub-cat-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setStatusFilter('ACTIVE')}>
                <div className="hub-cat-left"><UserCheck className="hub-cat-icon text-emerald-400" /> Active</div>
              </button>
              <button className={`hub-cat-btn ${statusFilter === 'LOCKED' ? 'active' : ''}`} onClick={() => setStatusFilter('LOCKED')}>
                <div className="hub-cat-left"><Lock className="hub-cat-icon text-rose-400" /> Locked</div>
              </button>

              <div className="hub-cat-title mt-6">Roles</div>
              <button className={`hub-cat-btn ${roleFilter === 'ALL' ? 'active' : ''}`} onClick={() => setRoleFilter('ALL')}>
                <div className="hub-cat-left"><Filter className="hub-cat-icon" /> All roles</div>
              </button>
              <button className={`hub-cat-btn ${roleFilter === 'ADMIN' ? 'active' : ''}`} onClick={() => setRoleFilter('ADMIN')}>
                <div className="hub-cat-left"><Shield className="hub-cat-icon text-amber-400" /> Admin</div>
              </button>
              <button className={`hub-cat-btn ${roleFilter === 'EDITOR' ? 'active' : ''}`} onClick={() => setRoleFilter('EDITOR')}>
                <div className="hub-cat-left"><Shield className="hub-cat-icon text-blue-400" /> Editor</div>
              </button>
              <button className={`hub-cat-btn ${roleFilter === 'VIEWER' ? 'active' : ''}`} onClick={() => setRoleFilter('VIEWER')}>
                <div className="hub-cat-left"><Shield className="hub-cat-icon text-slate-400" /> Viewer</div>
              </button>

              <button className="hub-mark-all-btn mt-6 w-full flex justify-center" onClick={() => message.info('Feature in development')}>
                <Plus size={16} /> Add new user
              </button>
            </div>
          </div>

          {/* Grid Feed */}
          <div className="hub-feed" style={{ flex: 1 }}>
            <div className="hub-feed-header mb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">List ({filtered.length})</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-12"><Spin size="large" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {paginatedUsers.map(user => {
                    const isLocked = user.status === 'LOCKED';
                    const mainRole = user.roles[0] || 'VIEWER';
                    return (
                      <div 
                        key={user.id} 
                        className={`hub-card cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${isLocked ? 'border-[rgba(248,81,73,0.3)]' : ''}`}
                        onClick={() => openUserDetail(user)}
                      >
                        <div className={`hub-card-icon ${isLocked ? 'slate' : 'cyan'} overflow-hidden p-0`}>
                          <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.metadata as any)?.displayName || user.name)}&background=1e293b&color=00e5ff`}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="hub-card-content flex-1">
                          <h3 className="hub-card-title group-hover:text-[#00e5ff] transition-colors">{(user.metadata as any)?.displayName || user.name}</h3>
                          <p className="hub-card-desc">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="hub-tag border border-[rgba(255,255,255,0.1)]">{mainRole}</span>
                            <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span className={`text-[11px] font-bold ${isLocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {isLocked ? 'Locked' : 'Active'}
                            </span>
                          </div>
                        </div>
                        <div className="hub-card-right justify-center">
                          <div style={{ padding: '8px 20px' }} className="text-[14px] font-black text-[#00e5ff] bg-[rgba(0,229,255,0.1)] rounded-full border-2 border-[rgba(0,229,255,0.3)] whitespace-nowrap flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                            {user.credits?.toLocaleString() || '0'} CR
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(15,23,42,0.6)] text-[#64748b] hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[#94a3b8] text-sm">Page <strong className="text-white">{currentPage}</strong> / {totalPages}</span>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(15,23,42,0.6)] text-[#64748b] hover:text-white disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={<div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Settings</div>}
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={420}
        closeIcon={<X style={{ color: '#64748b' }} />}
        styles={{
          header: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', background: '#0f172a' },
          body: { padding: 0, background: '#0f172a' },
        }}
      >
        {selectedUser && (
          <div className="h-full flex flex-col">
            <div style={{ padding: '24px 32px' }} className="flex-1 overflow-y-auto custom-scrollbar">
              <div style={{ padding: '24px', marginBottom: '32px' }} className="bg-[rgba(30,41,59,0.4)] rounded-2xl flex flex-col items-center text-center border border-[rgba(255,255,255,0.05)]">
                <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden mb-4 border border-[rgba(255,255,255,0.1)] relative">
                  <img src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedUser.metadata as any)?.displayName || selectedUser.name)}&background=1e293b&color=00e5ff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-bold text-[18px] mb-1">{(selectedUser.metadata as any)?.displayName || selectedUser.name}</h3>
                <p className="text-[13px] text-[#64748b]">{selectedUser.email}</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ gap: '8px', marginBottom: '16px' }} className="flex items-center">
                  <Shield size={16} className="text-[#00e5ff]" />
                  <h4 className="text-[12px] font-bold text-white uppercase tracking-widest">System Roles</h4>
                </div>
                <div style={{ gap: '12px' }} className="flex items-center">
                  {['ADMIN', 'EDITOR', 'VIEWER'].map(role => {
                    const active = localRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleToggle(role)}
                        disabled={rolesMutation.isPending}
                        className={`flex-1 h-[40px] rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          active 
                            ? 'bg-[rgba(0,229,255,0.1)] border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                            : 'bg-[rgba(30,41,59,0.4)] border-[rgba(255,255,255,0.1)] text-[#64748b] hover:border-[#00e5ff] hover:text-[#00e5ff] hover:bg-[rgba(0,229,255,0.05)]'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '32px', paddingTop: '32px' }} className="border-t border-[rgba(255,255,255,0.05)]">
                <div style={{ marginBottom: '16px' }} className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-white uppercase tracking-widest">Adjust Credits</span>
                  <div className="text-right">
                    <span className="text-[13px] font-bold text-[#00e5ff]">{selectedUser.credits?.toLocaleString() || '0'} CR</span>
                  </div>
                </div>
                <div style={{ gap: '12px' }} className="flex items-center h-[42px]">
                  <div className="flex-1 h-full relative">
                    <input
                      type="number"
                      value={creditsAmount}
                      onChange={e => setCreditsAmount(e.target.value)}
                      placeholder="Enter amount..."
                      style={{ paddingLeft: '16px', paddingRight: '40px' }}
                      className="w-full h-full bg-[rgba(30,41,59,0.4)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[14px] text-white font-bold outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <button
                    onClick={handleSaveCredits}
                    disabled={!creditsAmount || creditsMutation.isPending}
                    style={{ padding: '0 24px' }}
                    className="h-full bg-[#00e5ff] hover:bg-[#00cce6] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer text-[#0f172a] rounded-xl text-[13px] font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ADD
                  </button>
                </div>
              </div>

              <div style={{ paddingTop: '32px' }} className="border-t border-[rgba(255,255,255,0.05)]">
                <h4 style={{ marginBottom: '16px' }} className="text-[12px] font-bold text-white uppercase tracking-widest">Security</h4>
                <div style={{ padding: '0 20px', marginBottom: '12px' }} className="h-14 bg-[rgba(30,41,59,0.4)] border border-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-between">
                  <div style={{ gap: '12px' }} className="flex items-center">
                    <ShieldAlert size={18} className={selectedUser.status === 'LOCKED' ? 'text-rose-500' : 'text-emerald-500'} />
                    <span className="text-[14px] font-semibold text-white">Emergency Lock</span>
                  </div>
                  <button
                    onClick={handleLockToggle}
                    disabled={lockMutation.isPending || unlockMutation.isPending}
                    className={`w-12 h-7 rounded-full relative cursor-pointer hover:shadow-lg transition-colors ${selectedUser.status === 'LOCKED' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${selectedUser.status === 'LOCKED' ? 'left-1' : 'left-6'}`} />
                  </button>
                </div>

                <div style={{ padding: '0 16px' }} className="h-14 bg-[rgba(244,63,94,0.05)] border border-[rgba(244,63,94,0.2)] rounded-xl flex items-center justify-between">
                  <div style={{ gap: '12px' }} className="flex items-center">
                    <Trash2 size={18} className="text-rose-500" />
                    <span className="text-[14px] font-semibold text-rose-500">Delete Account</span>
                  </div>
                  <button
                    onClick={handleDeleteUser}
                    disabled={deactivateMutation.isPending}
                    style={{ padding: '6px 16px' }}
                    className="bg-rose-500 hover:bg-rose-600 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer text-white rounded-lg text-[12px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    DELETE
                  </button>
                </div>

                <p style={{ marginTop: '16px' }} className="text-[12px] text-[#64748b] leading-relaxed">
                  Lock status will disable access. Deleting the account will completely remove its data.
                </p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;
