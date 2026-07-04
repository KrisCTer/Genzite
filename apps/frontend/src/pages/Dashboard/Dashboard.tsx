import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchUsersApi } from '../../api/users';
import { fetchCollectionsApi } from '../../api/cms';
import { fetchSitesApi } from '../../api/sites';
import { useNotificationStore } from '../../store/notifications';
import { 
  ArrowRight, 
  Terminal, 
  Users, 
  Database, 
  Globe, 
  Activity, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  Bell,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Sparkline Chart Helpers
const getSparklinePath = (data: number[], width: number, height: number, max: number = 100) => {
  if (!data || data.length === 0) return '';
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
};

const getSparklineAreaPath = (data: number[], width: number, height: number, max: number = 100) => {
  if (!data || data.length === 0) return '';
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  });
  return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
};

// AI Simulation Phases
const AI_PHASES = [
  { label: 'Phân tích yêu cầu', detail: 'Agent đang phân tích mô tả của người dùng và thiết lập schema dữ liệu...' },
  { label: 'Phác thảo giao diện', detail: 'Đang bố cục các khối widget trên lưới Canvas và định hình phong cách cozy...' },
  { label: 'Tạo mã nguồn & CMS', detail: 'Trình biên dịch Stitch đang tạo các component React và API collections...' },
  { label: 'Đồng bộ & Triển khai', detail: 'Đang đẩy tài nguyên tĩnh lên S3 CDN và kích hoạt môi trường live...' }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsersApi });
  const { data: collections } = useQuery({ queryKey: ['cms-collections'], queryFn: fetchCollectionsApi });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSitesApi });
  const { simulatedNotifications } = useNotificationStore();

  // Simulated metrics and streams state
  const [isSimulating, setIsSimulating] = useState(true);
  const [timeStr, setTimeStr] = useState(new Date().toISOString());

  // Real-time metric history (for charts)
  const [cpuHistory, setCpuHistory] = useState<number[]>([24, 28, 35, 42, 38, 45, 52, 48, 40, 44, 48, 55, 62, 58, 50]);
  const [kafkaHistory, setKafkaHistory] = useState<number[]>([1200, 1280, 1340, 1390, 1420, 1380, 1450, 1510, 1470, 1530, 1590, 1640, 1580, 1610, 1650]);

  // Current simulated stats
  const [sysMetrics, setSysMetrics] = useState({
    identityCpu: 8,
    identityRps: 12,
    aiCpu: 18,
    aiRps: 4,
    builderCpu: 24,
    builderRps: 8,
    dbConnections: 42
  });

  // AI Builder Simulator State
  const [aiPhaseIdx, setAiPhaseIdx] = useState(0);
  const [aiProgress, setAiProgress] = useState(25);
  const [aiLogs, setAiLogs] = useState<string[]>([
    '[Hệ thống] Khởi tạo Stitch Engine tại nút xử lý AI-09 thành công.',
    '[Agent] Gemini Agent đã tạo lập mô hình cấu trúc layout trang web.',
    '[Thiết kế] Đã áp dụng bảng màu ấm cúng: Cương dương (Teal) & Hổ phách (Amber).'
  ]);
  const [simulatedSitesCount, setSimulatedSitesCount] = useState<number | null>(null);

  // Sync real backend sites count
  const baseSiteCount = Array.isArray(sites) ? sites.length : 0;
  const activeSitesCount = simulatedSitesCount !== null ? simulatedSitesCount : baseSiteCount;

  // Timers for clock and simulation
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setTimeStr(new Date().toISOString());
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!isSimulating) return;

    const dataTimer = setInterval(() => {
      // 1. Update system metrics
      setSysMetrics(prev => ({
        identityCpu: Math.floor(Math.random() * 6) + 5,
        identityRps: Math.floor(Math.random() * 5) + 10,
        aiCpu: Math.floor(Math.random() * 15) + 12,
        aiRps: Math.floor(Math.random() * 4) + 2,
        builderCpu: Math.floor(Math.random() * 20) + 18,
        builderRps: Math.floor(Math.random() * 6) + 4,
        dbConnections: prev.dbConnections + (Math.random() > 0.5 ? 1 : -1)
      }));

      // 2. Push new values to graph history
      setCpuHistory(prev => {
        const nextVal = Math.floor(Math.random() * 30) + 30; // 30-60%
        return [...prev.slice(1), nextVal];
      });

      setKafkaHistory(prev => {
        const nextVal = prev[prev.length - 1] + Math.floor(Math.random() * 80) - 40;
        const boundedVal = Math.max(1000, Math.min(2200, nextVal));
        return [...prev.slice(1), boundedVal];
      });
    }, 2000);

    return () => clearInterval(dataTimer);
  }, [isSimulating]);

  // AI Stitch Engine pipeline simulator
  useEffect(() => {
    if (!isSimulating) return;

    const pipelineTimer = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          // Move to next phase
          const nextIdx = (aiPhaseIdx + 1) % AI_PHASES.length;
          setAiPhaseIdx(nextIdx);
          
          // Add log message
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          let logMsg = '';
          if (nextIdx === 0) {
            logMsg = `[${time}] System: Đã triển khai xong trang mới. Bắt đầu phiên sinh tiếp theo...`;
            // Increment sites count simulation
            setSimulatedSitesCount(curr => (curr !== null ? curr + 1 : baseSiteCount + 1));
          } else if (nextIdx === 1) {
            logMsg = `[${time}] PM Agent: Đã tổng hợp yêu cầu, đang thiết kế layout...`;
          } else if (nextIdx === 2) {
            logMsg = `[${time}] Stitch: Bắt đầu sinh các React components và tệp tin Tailwind...`;
          } else if (nextIdx === 3) {
            logMsg = `[${time}] QA Agent: Kiểm tra bảo mật và tối ưu SEO thành công. Triển khai CDN...`;
          }

          setAiLogs(logs => [logMsg, ...logs.slice(0, 7)]);
          return 0;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 1200);

    return () => clearInterval(pipelineTimer);
  }, [isSimulating, aiPhaseIdx, baseSiteCount]);

  // Format dates nicely
  const formattedTime = useMemo(() => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('vi-VN', { hour12: false });
  }, [timeStr]);

  const formattedDate = useMemo(() => {
    const d = new Date(timeStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [timeStr]);

  const welcomeGreeting = useMemo(() => {
    const hour = new Date(timeStr).getHours();
    if (hour < 12) return 'Chào buổi sáng, Admin! 🌅';
    if (hour < 18) return 'Chào buổi chiều, Admin! ☀️';
    return 'Chào buổi tối, Admin! 🌙';
  }, [timeStr]);

  const recentLogs = useMemo(() => {
    return simulatedNotifications.slice(0, 5);
  }, [simulatedNotifications]);

  const userCount = Array.isArray(users) ? users.length : 0;
  const collectionCount = Array.isArray(collections) ? collections.length : 0;

  // SVGs sizes
  const chartW = 350;
  const chartH = 90;

  return (
    <div className="max-w-7xl mx-auto text-left font-sans text-sm text-slate-100 min-h-screen bg-slate-950/20 p-2 md:p-6 select-none">
      
      {/* Dynamic entry container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        
        {/* Top Cozy Greeting & Simulation Control */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 to-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-lg">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              {welcomeGreeting}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Hệ thống của bạn đang vận hành ổn định. Các dịch vụ lõi đều ở trạng thái <span className="text-emerald-400 font-semibold">Tốt nhất (Nominal)</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border cursor-pointer transition-all duration-300 ${
                isSimulating 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause size={14} className="animate-pulse" />
                  <span>Dừng Giả Lập</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Bắt Đầu Giả Lập</span>
                </>
              )}
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono">Uptime: 02d 14h</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards with Interactive Hover & SVG Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Users */}
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(6, 182, 212, 0.15)' }}
            onClick={() => navigate('/admin/identity')}
            className="group relative bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800/80 cursor-pointer transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Users size={72} className="text-cyan-400" />
            </div>
            <div className="flex items-center gap-3 mb-4 pl-1">
              <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Users size={18} />
              </span>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Người Dùng Hệ Thống</span>
            </div>
            <div className="flex items-baseline gap-3 pl-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {userCount.toString().padStart(2, '0')}
              </span>
              <span className="text-slate-500 text-xs font-medium">tài khoản</span>
            </div>
            <div className="mt-4 text-xs text-slate-400 pl-1">
              <span>Đang hoạt động: 100%</span>
              <span className="absolute bottom-6 right-6 text-cyan-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                Chi tiết <ArrowRight size={12} />
              </span>
            </div>
          </motion.div>

          {/* Card 2: CMS Collections */}
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(245, 158, 11, 0.15)' }}
            onClick={() => navigate('/admin/cms')}
            className="group relative bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800/80 cursor-pointer transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Database size={72} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-3 mb-4 pl-1">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Database size={18} />
              </span>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mô Hình Dữ Liệu CMS</span>
            </div>
            <div className="flex items-baseline gap-3 pl-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {collectionCount.toString().padStart(2, '0')}
              </span>
              <span className="text-slate-500 text-xs font-medium">bộ sưu tập</span>
            </div>
            <div className="mt-4 text-xs text-slate-400 pl-1">
              <span>Dynamic JSONB enabled</span>
              <span className="absolute bottom-6 right-6 text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                Chi tiết <ArrowRight size={12} />
              </span>
            </div>
          </motion.div>

          {/* Card 3: AI Sites */}
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(16, 185, 129, 0.15)' }}
            onClick={() => navigate('/admin/site')}
            className="group relative bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800/80 cursor-pointer transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Globe size={72} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-3 mb-4 pl-1">
              <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Globe size={18} />
              </span>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tên Miền AI Live</span>
            </div>
            <div className="flex items-baseline gap-3 pl-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {activeSitesCount.toString().padStart(2, '0')}
              </span>
              <span className="text-slate-500 text-xs font-medium">trang web</span>
            </div>
            <div className="mt-4 text-xs text-slate-400 pl-1">
              <span>Compiler: Stitch Node v2</span>
              <span className="absolute bottom-6 right-6 text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                Chi tiết <ArrowRight size={12} />
              </span>
            </div>
          </motion.div>

        </div>

        {/* Asymmetrical 70/30 Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[7.2fr_2.8fr] gap-6">
          
          {/* LEFT 70% PANEL: Charts & Data Monitoring */}
          <div className="space-y-6">
            
            {/* Real-time System Analytics */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/60 p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Activity size={16} />
                  </span>
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">Hiệu Suất & Luồng Dữ Liệu</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> CPU Load
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Kafka Flow (msg/s)
                  </span>
                </div>
              </div>

              {/* Charts Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CPU Chart */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-xs">Node Engine CPU Usage</span>
                      <h4 className="text-xl font-bold text-white">{cpuHistory[cpuHistory.length - 1]}%</h4>
                    </div>
                    <TrendingUp size={14} className="text-teal-400 mt-1" />
                  </div>
                  
                  {/* SVG Chart Area */}
                  <div className="relative pt-2">
                    <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1={chartH * 0.25} x2={chartW} y2={chartH * 0.25} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
                      <line x1="0" y1={chartH * 0.50} x2={chartW} y2={chartH * 0.50} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
                      <line x1="0" y1={chartH * 0.75} x2={chartW} y2={chartH * 0.75} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
                      {/* Gradient Fill */}
                      <path
                        d={getSparklineAreaPath(cpuHistory, chartW, chartH, 100)}
                        fill="url(#cpuGradient)"
                        className="transition-all duration-500 ease-out"
                      />
                      {/* Stroke Line */}
                      <path
                        d={getSparklinePath(cpuHistory, chartW, chartH, 100)}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                  </div>
                </div>

                {/* Kafka Flow Chart */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-xs">Kafka Event Broker Flow</span>
                      <h4 className="text-xl font-bold text-white">{kafkaHistory[kafkaHistory.length - 1]} <span className="text-xs text-slate-400 font-normal">msg/sec</span></h4>
                    </div>
                    <Zap size={14} className="text-emerald-400 mt-1 animate-pulse" />
                  </div>
                  
                  {/* SVG Chart Area */}
                  <div className="relative pt-2">
                    <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="kafkaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1={chartH * 0.25} x2={chartW} y2={chartH * 0.25} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
                      <line x1="0" y1={chartH * 0.50} x2={chartW} y2={chartH * 0.50} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
                      <line x1="0" y1={chartH * 0.75} x2={chartW} y2={chartH * 0.75} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
                      {/* Gradient Fill */}
                      <path
                        d={getSparklineAreaPath(kafkaHistory, chartW, chartH, 2200)}
                        fill="url(#kafkaGradient)"
                        className="transition-all duration-500 ease-out"
                      />
                      {/* Stroke Line */}
                      <path
                        d={getSparklinePath(kafkaHistory, chartW, chartH, 2200)}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Node Service Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { label: '01_ID_GW', cpu: sysMetrics.identityCpu, details: `${sysMetrics.identityRps} rps` },
                  { label: '02_AI_ORCH', cpu: sysMetrics.aiCpu, details: `${sysMetrics.aiRps}/s queue` },
                  { label: '03_STITCH', cpu: sysMetrics.builderCpu, details: `${sysMetrics.builderRps}/min` },
                  { label: 'DB_CONNS', cpu: sysMetrics.dbConnections, details: 'Active threads' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-sm font-semibold text-white">
                        {item.label === 'DB_CONNS' ? item.cpu : `${item.cpu}%`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Notification Feed */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/60 p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Terminal size={16} />
                </span>
                <h3 className="text-md font-bold text-white uppercase tracking-wider">Thông báo & Sự kiện Gần Đây</h3>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[260px] overflow-y-auto pr-2 scrollbar-thin">
                {recentLogs.map((log) => {
                  const getEventDotColor = (event?: string) => {
                    switch (event) {
                      case 'user.registered': return 'bg-cyan-400';
                      case 'site.generated':
                      case 'site.created': return 'bg-amber-400';
                      case 'cms.generated': return 'bg-emerald-400';
                      case 'security.alert':
                      case 'auth.failed': return 'bg-rose-500';
                      case 'commerce.payment':
                      case 'payment.succeeded': return 'bg-yellow-400';
                      default: return 'bg-slate-500';
                    }
                  };
                  return (
                    <div key={log.id} className="py-3.5 flex items-start justify-between gap-4 group hover:bg-slate-800/20 px-2 rounded-xl transition-colors">
                      <div className="flex gap-3">
                        <span className={`h-2 w-2 rounded-full mt-2 shrink-0 group-hover:scale-125 transition-transform ${getEventDotColor(log.metadata?.event)}`} />
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-200">{log.title}</p>
                          <p className="text-[11px] text-slate-400 leading-normal">{log.body}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap pt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT 30% PANEL: AI Stitch Tracker, Clock & Quick Launch */}
          <div className="space-y-6">
            
            {/* Calendar & Clock Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-800/60 p-6 shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl" />
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock size={14} className="text-cyan-400" />
                <span className="font-semibold uppercase tracking-wider">Bảng điều hành</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                  {formattedTime}
                </h2>
                <p className="text-xs text-slate-400 capitalize">
                  {formattedDate}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/50">
                <p className="text-[11px] text-slate-400 italic font-medium leading-relaxed">
                  "Thiết lập giao diện ấm cúng, trực quan và đặt người dùng làm trung tâm."
                </p>
              </div>
            </div>

            {/* AI Builder Pipeline Simulator */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/60 p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sparkles size={16} />
                  </span>
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">AI Stitch Builder</h3>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Stitch Active
                </span>
              </div>

              {/* Progress & Current Step */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-200 font-bold">{AI_PHASES[aiPhaseIdx].label}</span>
                  <span className="text-amber-400 font-mono font-bold">{aiProgress}%</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 rounded-full"
                    animate={{ width: `${aiProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.5 }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-normal min-h-[32px]">
                  {AI_PHASES[aiPhaseIdx].detail}
                </p>
              </div>

              {/* Agent Logs terminal */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Orchestration Log</span>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/60 font-mono text-[10px] text-emerald-400/90 h-[110px] overflow-y-auto space-y-2 leading-relaxed scrollbar-thin">
                  <AnimatePresence>
                    {aiLogs.map((log, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        key={idx} 
                        className="truncate"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Quick action deck */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/60 p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Zap size={16} />
                </span>
                <h3 className="text-md font-bold text-white uppercase tracking-wider">Thao Tác Nhanh</h3>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/admin/site/canvas')}
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-teal-500 hover:text-slate-950 hover:border-transparent transition-all duration-300 font-bold text-xs text-left cursor-pointer rounded-2xl group shadow-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400 group-hover:text-slate-950 transition-colors" />
                    Bảng Vẽ Canvas AI
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-950 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/admin/identity')}
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 hover:text-slate-950 hover:border-transparent transition-all duration-300 font-bold text-xs text-left cursor-pointer rounded-2xl group shadow-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Users size={14} className="text-amber-400 group-hover:text-slate-950 transition-colors" />
                    Cấp Quyền Truy Cập
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-950 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/admin/notifications')}
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-sky-500 hover:text-slate-950 hover:border-transparent transition-all duration-300 font-bold text-xs text-left cursor-pointer rounded-2xl group shadow-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Bell size={14} className="text-indigo-400 group-hover:text-slate-950 transition-colors" />
                    Trung tâm Thông báo
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-950 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/admin/profile')}
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-lime-500 hover:text-slate-950 hover:border-transparent transition-all duration-300 font-bold text-xs text-left cursor-pointer rounded-2xl group shadow-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-emerald-400 group-hover:text-slate-950 transition-colors" />
                    Hồ sơ Cá nhân
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-950 transition-colors" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default Dashboard;
