import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { WORKSPACE_BASE } from '../../utils/userNav';
import { useAuthStore } from '../../store/auth';
import { fetchNotificationsApi } from '../../api/notifications';

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [timeStr, setTimeStr] = useState(new Date().toISOString());

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotificationsApi,
    retry: 1,
  });

  useEffect(() => {
    const clockTimer = setInterval(() => setTimeStr(new Date().toISOString()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formattedTime = useMemo(
    () => new Date(timeStr).toLocaleTimeString('vi-VN', { hour12: false }),
    [timeStr],
  );
  const formattedDate = useMemo(
    () =>
      new Date(timeStr).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [timeStr],
  );
  const welcomeGreeting = useMemo(() => {
    const hour = new Date(timeStr).getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, [timeStr]);

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length;
  const displayName = user?.name || 'bạn';

  const quickActions = [
    {
      label: 'Hồ sơ cá nhân',
      desc: 'Cập nhật tên, email và mật khẩu',
      path: `${WORKSPACE_BASE}/profile`,
      color: 'text-emerald-400',
    },
    {
      label: 'Resume Builder',
      desc: 'Tạo CV với AI',
      path: `${WORKSPACE_BASE}/ai/resume`,
      color: 'text-cyan-400',
    },
    {
      label: 'AI Interview',
      desc: 'Luyện phỏng vấn thông minh',
      path: `${WORKSPACE_BASE}/ai/interview`,
      color: 'text-violet-400',
    },
    {
      label: 'AI Canvas',
      desc: 'Thiết kế trang web bằng AI',
      path: `${WORKSPACE_BASE}/site/canvas`,
      color: 'text-amber-400',
    },
    {
      label: 'Thông báo',
      desc: unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Xem tất cả thông báo',
      path: `${WORKSPACE_BASE}/notifications`,
      color: 'text-indigo-400',
    },
    {
      label: 'Agent Workspace',
      desc: 'Trợ lý AI cá nhân',
      path: `${WORKSPACE_BASE}/ai/agent`,
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto text-left font-sans text-sm min-h-screen bg-[#161a23] px-4 md:px-8 py-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-widest text-cyan-500 uppercase">Không gian của tôi</span>
            <h1 className="text-3xl font-extrabold text-white">
              {welcomeGreeting}, {displayName}!
            </h1>
            <p className="text-[#94a3b8] text-sm">
              Quản lý hồ sơ, dùng công cụ AI và theo dõi thông báo tại đây.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#94a3b8] text-xs px-3 py-1.5 rounded-lg bg-[#1c212c] border border-[#2a3040]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono">Đang hoạt động</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1c212c] border border-[#2a3040] p-6 rounded-xl">
            <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider">Tài khoản</span>
            <p className="text-xl font-bold text-white mt-2 truncate">{user?.email}</p>
            <p className="text-xs text-[#94a3b8] mt-1">{(user?.roles ?? ['VIEWER']).join(' · ')}</p>
          </div>
          <div className="bg-[#1c212c] border border-[#2a3040] p-6 rounded-xl">
            <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider">Thông báo</span>
            <p className="text-4xl font-extrabold text-white mt-2 tabular-nums">{unreadCount}</p>
            <p className="text-xs text-[#94a3b8] mt-1">chưa đọc</p>
          </div>
          <div className="bg-[#1c212c] border border-[#2a3040] p-6 rounded-xl flex flex-col justify-center items-center text-center">
            <span className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Thời gian</span>
            <p className="text-3xl font-extrabold tabular-nums">{formattedTime}</p>
            <p className="text-xs text-[#94a3b8] mt-1 capitalize">{formattedDate}</p>
          </div>
        </div>

        <div className="bg-[#1c212c] border border-[#2a3040] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Truy cập nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start p-4 bg-[#161a23] border border-[#2a3040] hover:border-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none transition-all duration-300 text-left cursor-pointer rounded-xl group"
              >
                <span className={`text-sm font-semibold ${action.color}`}>{action.label}</span>
                <span className="text-xs text-[#94a3b8] mt-1">{action.desc}</span>
                <span className="text-xs text-cyan-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Mở →
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberDashboard;
