import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WORKSPACE_BASE } from '../../utils/userNav';
import { useAuthStore } from '../../store/auth';
import { fetchNotificationsApi } from '../../api/notifications';
import {
  User as UserIcon,
  Bell,
  Layout,
  ChevronRight
} from 'lucide-react';
import '../NotificationsStyle.css'; // Inherit Dark Space / Glassmorphism style

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [timeStr, setTimeStr] = useState(new Date().toISOString());

  // Fetch real notification data (NO MOCK)
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
    retry: 1,
  });

  // Optimize setInterval to prevent memory leaks
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = Date.now();

    const tick = () => {
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        setTimeStr(new Date().toISOString());
        lastUpdate = now;
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    // SEO / Meta Title
    document.title = 'My Workspace | Genzite';

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const formattedTime = useMemo(
    () => new Date(timeStr).toLocaleTimeString('en-US', { hour12: false }),
    [timeStr],
  );
  const formattedDate = useMemo(
    () =>
      new Date(timeStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [timeStr],
  );

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter((n) => !n.isRead).length;
  const displayEmail = user?.email || 'N/A';
  const displayRoles = (user?.roles ?? ['VIEWER']).join(' · ');

  const quickActions = [
    {
      label: 'Profile',
      desc: 'Manage your identity and security',
      path: `${WORKSPACE_BASE}/profile`,
      icon: <UserIcon size={24} />,
      colorClass: 'green'
    },
    {
      label: 'AI Canvas',
      desc: 'Drag and drop to build websites seamlessly',
      path: '/project',
      icon: <Layout size={24} />,
      colorClass: 'green'
    },
  ];

  return (
    <div className="hub-root">
      <div className="hub-wrapper" style={{ maxWidth: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
          </div>

          {/* Date & Time Display without background/icon */}
          <div className="text-right shrink-0 flex flex-col justify-center">
            <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {formattedDate}
            </div>
            <div className="text-2xl font-bold text-white tabular-nums tracking-tight leading-none">
              {formattedTime}
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="hub-stats">
          <div className="hub-stat-card">
            <div className="hub-stat-icon cyan" style={{ padding: user?.avatarUrl ? 0 : undefined, overflow: 'hidden' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={28} />
              )}
            </div>
            <div className="hub-stat-info overflow-hidden">
              <span className="hub-stat-label truncate w-full">{displayEmail}</span>
              <span className="text-[15px] font-bold text-white uppercase tracking-wider truncate w-full mt-1">
                {displayRoles}
              </span>
            </div>
          </div>

          <div className="hub-stat-card">
            <div className="hub-stat-icon amber">
              <Bell size={28} className={unreadCount > 0 ? "animate-pulse" : ""} />
            </div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Unread</span>
              <span className="hub-stat-value">{unreadCount}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="w-full mt-8">
          <div className="hub-feed w-full">

            <div className="hub-feed-header mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Quick Access</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="hub-card text-left cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,229,255,0.15)]"
                >
                  <div className={`hub-card-icon ${action.colorClass}`}>
                    {action.icon}
                  </div>

                  <div className="hub-card-content flex-1">
                    <h3 className="hub-card-title group-hover:text-white transition-colors">
                      {action.label}
                    </h3>
                    <p className="hub-card-desc">{action.desc}</p>
                  </div>

                  <div className="hub-card-right opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <div className="hub-card-mark-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <ChevronRight size={18} className="text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;

