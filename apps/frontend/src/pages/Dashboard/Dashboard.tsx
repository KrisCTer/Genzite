import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchUsersApi } from '../../api/users';
import { fetchCollectionsApi } from '../../api/cms';
import { fetchSitesApi } from '../../api/sites';
import { Users, Database, Globe, Sparkles, Shield, UserCircle, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import '../NotificationsStyle.css'; // Inherit Dark Space / Glassmorphism style

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const adminName = ((user?.metadata as any)?.displayName || user?.name)?.split(' ')[0];

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsersApi });
  const { data: collections } = useQuery({ queryKey: ['cms-collections'], queryFn: () => fetchCollectionsApi('') });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSitesApi });


  const [timeStr, setTimeStr] = useState(new Date().toISOString());

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
    document.title = 'Admin Console | Genzite';

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

  const welcomeGreeting = useMemo(() => {
    const hour = new Date(timeStr).getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [timeStr]);

  const dataMap: Record<string, unknown[]> = {
    users: Array.isArray(users) ? users : [],
    cms: Array.isArray(collections) ? collections : [],
    sites: Array.isArray(sites) ? sites : [],
  };

  const metricCards = [
    {
      key: 'users',
      label: 'Users',
      sub: 'accounts',
      path: '/admin/identity',
      icon: <Users size={28} />,
      colorClass: 'cyan',
      getValue: (users: unknown[]) => users.length,
    },
    {
      key: 'cms',
      label: 'CMS',
      sub: 'collections',
      path: '/admin/cms',
      icon: <Database size={28} />,
      colorClass: 'amber',
      getValue: (collections: unknown[]) => collections.length,
    },
    {
      key: 'sites',
      label: 'Site Builder',
      sub: 'websites',
      path: '/admin/site',
      icon: <Globe size={28} />,
      colorClass: 'emerald',
      getValue: (sites: unknown[]) => sites.length,
    },
  ];

  const quickActions = [
    { label: 'AI Canvas', desc: 'Design pages with AI', path: '/project', icon: <Sparkles size={24} />, colorClass: 'cyan' },
    { label: 'Access Management', desc: 'Manage Users & Roles', path: '/admin/identity', icon: <Shield size={24} />, colorClass: 'amber' },
    { label: 'Profile', desc: 'Admin account', path: '/admin/profile', icon: <UserCircle size={24} />, colorClass: 'green' },
  ];

  return (
    <div className="hub-root">
      <div className="hub-wrapper" style={{ maxWidth: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="hub-header-title truncate" title={`${welcomeGreeting}${adminName ? `, ${adminName}` : ''}!`}>
              {welcomeGreeting}{adminName ? `, ${adminName}` : ''}!
            </h1>
            <p className="hub-header-desc">
              System overview — real-time synchronized data.
            </p>
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
        <div className="hub-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {metricCards.map(card => {
            const count = card.getValue(dataMap[card.key]);
            return (
              <div key={card.key} className="hub-stat-card cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => navigate(card.path)}>
                <div className={`hub-stat-icon ${card.colorClass}`}>
                  {card.icon}
                </div>
                <div className="hub-stat-info">
                  <span className="hub-stat-label">{card.label}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                      {count.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-[#64748b]">{card.sub}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="w-full mt-8">
          <div className="hub-feed w-full">
            
            <div className="hub-feed-header mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Quick Actions</h2>
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

export default Dashboard;
