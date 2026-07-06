import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchUsersApi } from '../../api/users';
import { fetchCollectionsApi } from '../../api/cms';
import { fetchSitesApi } from '../../api/sites';
import { motion } from 'framer-motion';
import { Users, Database, Globe, Sparkles, Shield, Bell, UserCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const metricCards = [
  {
    key: 'users',
    label: 'Người dùng hệ thống',
    sub: 'tài khoản đăng ký',
    path: '/admin/identity',
    icon: Users,
    accent: 'cyan',
    getValue: (users: unknown[]) => users.length,
  },
  {
    key: 'cms',
    label: 'Mô hình dữ liệu CMS',
    sub: 'bộ sưu tập',
    path: '/admin/cms',
    icon: Database,
    accent: 'amber',
    getValue: (collections: unknown[]) => collections.length,
  },
  {
    key: 'sites',
    label: 'Site AI Live',
    sub: 'trang web',
    path: '/admin/site',
    icon: Globe,
    accent: 'emerald',
    getValue: (sites: unknown[]) => sites.length,
  },
] as const;

const quickActions = [
  { label: 'AI Canvas', desc: 'Thiết kế trang bằng AI', path: '/admin/site/canvas', icon: Sparkles, color: 'text-cyan-400' },
  { label: 'Quản lý truy cập', desc: 'Users & roles', path: '/admin/identity', icon: Shield, color: 'text-amber-400' },
  { label: 'Thông báo', desc: 'Hệ thống & sự kiện', path: '/admin/notifications', icon: Bell, color: 'text-indigo-400' },
  { label: 'Hồ sơ cá nhân', desc: 'Tài khoản admin', path: '/admin/profile', icon: UserCircle, color: 'text-emerald-400' },
];

const accentMap = {
  cyan: {
    icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    hover: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    bar: 'bg-cyan-500',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hover: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    bar: 'bg-amber-500',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    bar: 'bg-emerald-500',
  },
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const adminName = useAuthStore((s) => s.user?.name?.split(' ')[0]);
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsersApi });
  const { data: collections } = useQuery({ queryKey: ['cms-collections'], queryFn: () => fetchCollectionsApi('') });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSitesApi });

  const [timeStr, setTimeStr] = useState(new Date().toISOString());

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

  const dataMap: Record<string, unknown[]> = {
    users: Array.isArray(users) ? users : [],
    cms: Array.isArray(collections) ? collections : [],
    sites: Array.isArray(sites) ? sites : [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 text-white select-none">
      <motion.div initial="initial" animate="animate" className="space-y-6">
        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#2a3040]/80">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-500 uppercase">Admin Console</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {welcomeGreeting}
              {adminName ? `, ${adminName}` : ''}!
            </h1>
            <p className="text-[#94a3b8] text-sm max-w-lg">
              Tổng quan hệ thống — dữ liệu đồng bộ thời gian thực.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-[#94a3b8] px-3 py-2 rounded-full bg-[#1c212c]/80 border border-[#2a3040] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-emerald-400/90">Hệ thống ổn định</span>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricCards.map((card, i) => {
            const Icon = card.icon;
            const accent = accentMap[card.accent];
            const count = card.getValue(dataMap[card.key]);
            return (
              <motion.button
                key={card.key}
                type="button"
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => navigate(card.path)}
                className={`group relative text-left overflow-hidden rounded-2xl border border-[#2a3040] bg-[#1c212c]/90 p-5 transition-all duration-300 hover:shadow-lg ${accent.hover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50`}
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent.bar} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-xl border ${accent.icon}`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem →
                  </span>
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">{card.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tabular-nums">{count.toString().padStart(2, '0')}</span>
                  <span className="text-xs text-[#64748b]">{card.sub}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick actions + clock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border border-[#2a3040] bg-[#1c212c]/90 p-5 md:p-6"
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#94a3b8] mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-[#2a3040] bg-[#161a23]/80 hover:border-[#3d4659] hover:bg-[#161a23] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                  >
                    <span className={`p-2 rounded-lg bg-[#1c212c] border border-[#2a3040] ${action.color}`}>
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-white group-hover:text-cyan-50 transition-colors">
                        {action.label}
                      </span>
                      <span className="block text-[11px] text-[#64748b] mt-0.5">{action.desc}</span>
                    </span>
                    <span className="text-[#475569] group-hover:text-cyan-400 transition-colors text-sm">→</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="rounded-2xl border border-[#2a3040] bg-gradient-to-br from-[#1c212c] to-[#161a23] p-6 flex flex-col items-center justify-center text-center min-h-[220px]"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748b] mb-5">
              <Clock size={14} />
              Thời gian hệ thống
            </div>
            <p className="text-4xl font-extrabold tabular-nums tracking-tight bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
              {formattedTime}
            </p>
            <p className="text-xs text-[#64748b] mt-3 capitalize leading-relaxed max-w-[200px]">{formattedDate}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
