import React, { useState } from 'react';
import { Button, Avatar, Drawer, Form, Input, Select, Switch, message, Modal } from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  SearchOutlined, 
  TeamOutlined, 
  MailOutlined,
  CloseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsersApi, lockUserApi, unlockUserApi, deactivateUserApi, adjustCreditsApi, updateRolesApi } from '../../api/users';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

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

  const filteredUsers = displayUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'ACTIVE' && u.status === 'ACTIVE') || 
                          (statusFilter === 'INACTIVE' && u.status !== 'ACTIVE');
    return matchesSearch && matchesRole && matchesStatus;
  });

  const selectedUser = displayUsers.find(u => u.id === selectedUserId) || filteredUsers[0] || null;

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
  };

  const handleOpenDrawer = () => {
    form.resetFields();
    form.setFieldsValue({ isActive: true, roles: ['VIEWER'] });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const deactivateMutation = useMutation({
    mutationFn: deactivateUserApi,
    onSuccess: () => {
      message.success('Đã thu hồi quyền truy cập thành công.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserId(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Không thể thu hồi quyền truy cập.';
      message.error(msg);
    }
  });

  const lockMutation = useMutation({
    mutationFn: lockUserApi,
    onSuccess: () => {
      message.success('Đã khóa tài khoản thành công.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Không thể khóa tài khoản.';
      message.error(`Lỗi: ${msg}`);
    }
  });

  const unlockMutation = useMutation({
    mutationFn: unlockUserApi,
    onSuccess: () => {
      message.success('Đã mở khóa tài khoản thành công.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Không thể mở khóa tài khoản.';
      message.error(`Lỗi: ${msg}`);
    }
  });

  const adjustCreditsMutation = useMutation({
    mutationFn: (data: { id: string; amount: number }) => adjustCreditsApi(data.id, data.amount),
    onSuccess: () => {
      message.success('Cập nhật tín dụng thành công.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Lỗi: Không thể cập nhật tín dụng.');
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: (data: { id: string; roles: string[] }) => updateRolesApi(data.id, data.roles),
    onSuccess: (_, variables) => {
      message.success('Cập nhật quyền thành công.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Lỗi: Không thể cập nhật quyền.');
    }
  });

  const handleUpdateRoles = (roles: string[]) => {
    if (!selectedUser) return;
    updateRolesMutation.mutate({ id: selectedUser.id, roles });
  };

  const handleSaveUser = () => {
    message.info('Chức năng tạo tài khoản thủ công chưa được hỗ trợ. Vui lòng đăng ký qua cổng công khai.');
    handleCloseDrawer();
  };

  const handleDeleteUser = (id: string, name: string) => {
    Modal.confirm({
      title: 'Xác nhận thu hồi quyền',
      content: `Bạn có chắc chắn muốn thu hồi quyền truy cập của ${name} vĩnh viễn không? Hành động này không thể hoàn tác.`,
      okText: 'Thu hồi',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deactivateMutation.mutate(id);
      }
    });
  };

  const handleToggleUserActive = (checked: boolean) => {
    if (!selectedUser) return;
    if (checked) {
      unlockMutation.mutate(selectedUser.id);
    } else {
      Modal.confirm({
        title: 'Khóa tài khoản',
        content: `Bạn có chắc chắn muốn khóa tài khoản của ${selectedUser.name}? Người dùng sẽ bị đăng xuất và không thể đăng nhập lại.`,
        okText: 'Khóa tài khoản',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: () => {
          lockMutation.mutate(selectedUser.id);
        }
      });
    }
  };

  const handleDeductCredit = () => {
    if (!selectedUser) return;
    const amountStr = window.prompt('Nhập số credit muốn TRỪ:');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      message.error('Số tiền không hợp lệ');
      return;
    }
    adjustCreditsMutation.mutate({ id: selectedUser.id, amount: -amount });
  };

  const handleRefundCredit = () => {
    if (!selectedUser) return;
    const amountStr = window.prompt('Nhập số credit muốn HOÀN LẠI:');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      message.error('Số tiền không hợp lệ');
      return;
    }
    adjustCreditsMutation.mutate({ id: selectedUser.id, amount });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto flex flex-col w-full text-left font-sans text-sm text-[#94a3b8] px-4 md:px-6 py-4 select-none"
    >
      <style>{`
        .custom-input {
          background-color: #161a23 !important;
          border: 1px solid #2a3040 !important;
          border-radius: 8px !important;
          color: #fff !important;
        }
        .custom-input:hover, .custom-input:focus {
          border-color: #06b6d4 !important;
        }
        .custom-input:focus-visible {
          outline: 2px solid #06b6d4 !important;
          outline-offset: -1px;
        }
        .custom-select .ant-select-selector {
          background-color: #161a23 !important;
          border: 1px solid #2a3040 !important;
          border-radius: 8px !important;
          color: #fff !important;
        }
        .custom-switch.ant-switch-checked {
          background-color: #10B981 !important;
        }
      `}</style>

      {/* Header + stats */}
      <div className="pb-6 mb-6 border-b border-[#2a3040]/80">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-500 uppercase">Security Operation</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Identity Directory</h1>
            <p className="text-sm text-[#94a3b8] max-w-xl">Quản lý hồ sơ người dùng, phân quyền và tín dụng hệ thống.</p>
          </div>

          <div className="flex flex-wrap items-stretch gap-3">
            {[
              { label: 'Tổng tài khoản', value: displayUsers.length, icon: TeamOutlined, color: 'text-white' },
              { label: 'Đang hoạt động', value: displayUsers.filter(u => u.status === 'ACTIVE').length, icon: CheckCircleOutlined, color: 'text-emerald-400' },
              { label: 'Đã bị khóa', value: displayUsers.filter(u => u.status !== 'ACTIVE').length, icon: LockOutlined, color: 'text-rose-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-[#2a3040] bg-[#1c212c]/90 px-4 py-3 min-w-[130px]"
              >
                <span className="p-2 rounded-lg bg-[#161a23] border border-[#2a3040] text-[#64748b]">
                  <stat.icon />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold m-0">{stat.label}</p>
                  <p className={`text-xl font-extrabold tabular-nums m-0 mt-0.5 ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleOpenDrawer}
              className="bg-cyan-500 hover:bg-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none border-0 text-white font-semibold rounded-xl h-auto min-h-[56px] px-5 transition-all shadow-sm shadow-cyan-500/10 text-sm self-stretch"
            >
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-8 text-sm text-yellow-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>Identity services unreachable. Check your connection.</span>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })} 
            className="font-semibold text-cyan-400 hover:underline bg-transparent border-0 cursor-pointer p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main Grid: 5 / 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-[#2a3040] bg-[#1c212c]/90 p-4 flex flex-col gap-3">
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-[#64748b] mr-1" />}
              className="custom-input h-11"
              allowClear
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Tất cả', value: 'ALL' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Editor', value: 'EDITOR' },
                  { label: 'Viewer', value: 'VIEWER' },
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setRoleFilter(btn.value)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                      roleFilter === btn.value
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                        : 'bg-[#161a23] border-[#2a3040] text-[#94a3b8] hover:text-white hover:border-[#3d4659]'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="w-36 shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  className="custom-select w-full"
                  size="large"
                >
                  <Option value="ALL">Mọi trạng thái</Option>
                  <Option value="ACTIVE">Đang hoạt động</Option>
                  <Option value="INACTIVE">Đã bị khóa</Option>
                </Select>
              </div>
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto flex flex-col gap-2 pr-1">
            <AnimatePresence initial={false}>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-[#64748b] bg-[#1c212c]/60 border border-dashed border-[#2a3040] rounded-2xl">
                  <TeamOutlined className="text-2xl mb-2 opacity-40" />
                  <p className="m-0 text-sm">Không tìm thấy tài khoản phù hợp.</p>
                </div>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isSelected = selectedUserId === user.id;
                  const isAdmin = user.roles.includes('ADMIN');
                  const isEditor = user.roles.includes('EDITOR');

                  let indicatorBorder = 'border-l-4 border-[#94a3b8]';
                  let activeBadgeColor = 'text-[#94a3b8] border-[#94a3b8]/20 bg-[#94a3b8]/10';
                  if (isAdmin) {
                    indicatorBorder = 'border-l-4 border-amber-500';
                    activeBadgeColor = 'text-amber-500 border-amber-500/20 bg-amber-500/10';
                  } else if (isEditor) {
                    indicatorBorder = 'border-l-4 border-cyan-500';
                    activeBadgeColor = 'text-cyan-500 border-cyan-500/20 bg-cyan-500/10';
                  }

                  return (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectUser(user.id)}
                      className={`relative w-full text-left rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/5 border border-cyan-500/50 shadow-md shadow-cyan-500/5' 
                          : 'bg-[#1c212c]/80 border border-[#2a3040] hover:border-[#3d4659] hover:bg-[#1c212c]'
                      } p-3.5 flex items-center justify-between cursor-pointer ${indicatorBorder}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar 
                            src={user.avatarUrl || undefined} 
                            icon={!user.avatarUrl ? <UserOutlined /> : undefined}
                            className="bg-[#161a23] border border-[#2a3040] text-[#94a3b8]"
                            size="large"
                          />
                          {user.status === 'ACTIVE' ? (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-[#1c212c] rounded-full"></span>
                          ) : (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-rose-500 border-2 border-[#1c212c] rounded-full"></span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-base">{user.name}</span>
                          <span className="text-xs text-[#94a3b8] mt-0.5">{user.email}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${activeBadgeColor}`}>
                          {user.roles[0]}
                        </span>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!selectedUser ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-[#2a3040] bg-[#1c212c]/40 p-10 text-center text-[#64748b] flex flex-col items-center justify-center min-h-[360px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#161a23] border border-[#2a3040] flex items-center justify-center mb-4">
                  <TeamOutlined className="text-2xl text-[#475569]" />
                </div>
                <span className="uppercase tracking-[0.15em] font-semibold text-xs text-[#94a3b8]">Chưa chọn tài khoản</span>
                <p className="text-xs mt-2 max-w-xs leading-relaxed">Chọn một tài khoản bên trái để xem chi tiết và quản lý quyền.</p>
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
                <div className="rounded-2xl border border-[#2a3040] bg-[#1c212c]/90 p-5 md:p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar 
                        src={selectedUser.avatarUrl || undefined} 
                        icon={!selectedUser.avatarUrl ? <UserOutlined /> : undefined}
                        size={72}
                        className="bg-[#161a23] border-2 border-[#2a3040] text-[#94a3b8] shrink-0"
                      />
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white m-0 truncate">{selectedUser.name}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                            selectedUser.roles.includes('ADMIN')
                              ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
                              : selectedUser.roles.includes('EDITOR')
                              ? 'text-cyan-500 border-cyan-500/20 bg-cyan-500/10'
                              : 'text-[#94a3b8] border-[#94a3b8]/20 bg-[#94a3b8]/10'
                          }`}>
                            {selectedUser.roles.join(' · ')}
                          </span>
                        </div>
                        <span className="text-[#94a3b8] text-sm flex items-center gap-2 truncate">
                          <MailOutlined className="shrink-0" /> <span className="truncate">{selectedUser.email}</span>
                        </span>
                        <span className="text-[11px] text-[#64748b]">
                          Tham gia: {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-[#2a3040] bg-[#161a23]/80 px-4 py-3 shrink-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Trạng thái</span>
                        <span className={`text-[10px] font-bold uppercase ${selectedUser.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {selectedUser.status === 'ACTIVE' ? 'Hoạt động' : selectedUser.status}
                        </span>
                      </div>
                      <Switch 
                        size="small"
                        checked={selectedUser.status === 'ACTIVE'}
                        onChange={(checked) => {
                          setSelectedUserId(selectedUser.id);
                          setTimeout(() => handleToggleUserActive(checked), 50);
                        }}
                        className="custom-switch"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a3040] bg-[#1c212c]/90 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#94a3b8] mb-3">Phân quyền (Roles)</h3>
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      Chọn các quyền hạn cho tài khoản này. Quyền <span className="text-amber-400 font-semibold">ADMIN</span> có toàn quyền hệ thống.
                    </p>
                    <div className="flex gap-3 items-end">
                      <Select
                        mode="multiple"
                        defaultValue={selectedUser.roles}
                        key={selectedUser.id}
                        onChange={handleUpdateRoles}
                        loading={updateRolesMutation.isPending}
                        disabled={updateRolesMutation.isPending}
                        className="flex-1"
                        placeholder="Chọn quyền..."
                        style={{ minWidth: 200 }}
                        options={[
                          { value: 'ADMIN', label: 'ADMIN — Toàn quyền' },
                          { value: 'EDITOR', label: 'EDITOR — Biên tập' },
                          { value: 'VIEWER', label: 'VIEWER — Người xem' },
                        ]}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser.roles.map(role => (
                        <span key={role} className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                          role === 'ADMIN' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                          : role === 'EDITOR' ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10'
                          : 'text-[#94a3b8] border-[#94a3b8]/20 bg-[#94a3b8]/10'
                        }`}>{role}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2a3040] bg-[#1c212c]/90 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#94a3b8] mb-4">Quản lý tín dụng</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-semibold">Số dư hiện tại</span>
                      <span className="text-2xl font-extrabold text-cyan-400 tabular-nums">
                        {selectedUser.credits !== undefined ? selectedUser.credits : '0'} CR
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleRefundCredit}
                        loading={adjustCreditsMutation.isPending}
                        className="bg-[#161a23] border border-[#2a3040] text-[#10B981] hover:text-[#10B981] hover:border-[#10B981] rounded-lg h-10 px-4 text-xs uppercase font-bold tracking-wider"
                      >
                        + Hoàn Credit
                      </Button>
                      <Button
                        onClick={handleDeductCredit}
                        loading={adjustCreditsMutation.isPending}
                        className="bg-[#161a23] border border-[#2a3040] text-rose-500 hover:text-rose-500 hover:border-rose-500 rounded-lg h-10 px-4 text-xs uppercase font-bold tracking-wider"
                      >
                        - Trừ Credit
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <WarningOutlined className="text-rose-500 text-lg" />
                        <span className="uppercase tracking-wider font-bold text-rose-500 text-base">Vùng Nguy Hiểm</span>
                      </div>
                      <p className="text-rose-200/70 text-sm m-0 leading-relaxed">
                        Thu hồi quyền truy cập sẽ vô hiệu hóa hoàn toàn tài khoản này. Người dùng sẽ bị đăng xuất khỏi tất cả thiết bị ngay lập tức.
                      </p>
                    </div>
                    <Button 
                      danger 
                      onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name)}
                      loading={deactivateMutation.isPending}
                      className="bg-transparent border-2 border-rose-500 hover:bg-rose-500 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none text-rose-500 font-bold rounded-lg h-12 px-6 text-xs uppercase tracking-wider transition-all shrink-0"
                    >
                      Thu Hồi Quyền
                    </Button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <Drawer
        title={<span className="font-bold text-white uppercase tracking-wider text-sm">Đăng ký tài khoản mới</span>}
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerOpen}
        width={400}
        closeIcon={<CloseOutlined className="text-[#94a3b8] hover:text-white" />}
        styles={{
          header: { background: '#1c212c', borderBottom: '1px solid #2a3040', padding: '24px' },
          body: { background: '#161a23', padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveUser} requiredMark={false} className="flex flex-col gap-6">
          <Form.Item
            name="name"
            label={<span className="text-[#94a3b8] text-sm font-semibold">Họ và tên</span>}
            rules={[{ required: true, message: 'Thiếu tên người dùng' }]}
            className="mb-0"
          >
            <Input placeholder="Nhập họ và tên" className="custom-input h-11" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-[#94a3b8] text-sm font-semibold">Địa chỉ Email</span>}
            rules={[{ required: true, message: 'Thiếu email', type: 'email' }]}
            className="mb-0"
          >
            <Input placeholder="name@domain.com" className="custom-input h-11" />
          </Form.Item>

          <Form.Item
            name="roles"
            label={<span className="text-[#94a3b8] text-sm font-semibold">Quyền truy cập</span>}
            rules={[{ required: true, message: 'Thiếu quyền' }]}
            className="mb-0"
          >
            <Select mode="multiple" className="custom-select text-sm h-auto min-h-[44px]">
              <Option value="ADMIN">Quản trị viên (ADMIN)</Option>
              <Option value="EDITOR">Biên tập (EDITOR)</Option>
              <Option value="VIEWER">Thành viên (VIEWER)</Option>
            </Select>
          </Form.Item>

          <div className="flex gap-4 mt-8 pt-6 border-t border-[#2a3040]">
            <Button 
              onClick={handleCloseDrawer} 
              className="flex-1 bg-transparent border border-[#2a3040] text-[#94a3b8] hover:text-white hover:border-slate-500 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none rounded-lg h-11 transition-all uppercase tracking-wider text-xs font-bold"
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="flex-1 bg-cyan-500 border-0 text-white font-bold rounded-lg h-11 hover:bg-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none transition-all uppercase tracking-wider text-xs shadow-sm"
            >
              Tạo mới
            </Button>
          </div>
        </Form>
      </Drawer>
    </motion.div>
  );
};

export default UserManagement;
