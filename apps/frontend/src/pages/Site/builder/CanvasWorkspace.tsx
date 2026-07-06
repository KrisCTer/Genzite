import React, { useState, useRef, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchWidgetsApi } from '../../../api/sites';
import { uploadMediaFileApi } from '../../../api/media';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  FullscreenOutlined,
  ArrowUpOutlined,
  BorderOutlined,
  EditOutlined,
  DragOutlined,
  PictureOutlined,
  BgColorsOutlined,
  StarOutlined,
  SearchOutlined,
  HomeOutlined,
  UserOutlined,
  ToolOutlined,
  AppstoreOutlined,
  TagOutlined,
  BookOutlined,
  UndoOutlined,
  RedoOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Sparkles } from 'lucide-react';
import CanvasPageFrame from './CanvasPageFrame';
import AIPromptBar from './AIPromptBar';
import CanvasToolbar from './CanvasToolbar';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAGE_SPACING = 1640;

const DraggableBoard = ({ initialX, initialY, zoom, activeTool, children, style, requestTopZ }: any) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [localZ, setLocalZ] = useState(1);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool && activeTool !== 'select') return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, [data-nodrag]')) return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    if (requestTopZ) {
      setLocalZ(requestTopZ());
    }

    dragStart.current = { x: e.clientX, y: e.clientY, startX: pos.x, startY: pos.y };
  }, [pos.x, pos.y, requestTopZ, activeTool]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const dx = (e.clientX - dragStart.current.x) / zoom;
    const dy = (e.clientY - dragStart.current.y) / zoom;
    setPos({ x: dragStart.current.startX + dx, y: dragStart.current.startY + dy });
  }, [isDragging, zoom]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
  }, [isDragging]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          zIndex: localZ,
          cursor: (activeTool && activeTool !== 'select') ? 'inherit' : (isDragging ? 'grabbing' : 'grab'),
          ...style
        }}
        onPointerDown={onPointerDown}
      >
        <div style={{ pointerEvents: isDragging ? 'none' : 'auto', width: '100%', height: '100%' }}>
          {children}
        </div>
      </div>
      {isDragging && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9999999, cursor: 'grabbing' }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      )}
    </>
  );
};

interface CanvasWorkspaceProps {
  pages: any[];
  siteId: string;
  site?: any;
  onAIGenerated?: (jobId: string) => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ pages, siteId, site, onAIGenerated }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasCenterRef = useRef<HTMLDivElement>(null);
  const workspaceRootRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.4);
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'frame' | 'draw' | 'pan' | 'image' | 'palette' | 'star'>('pan');

  useEffect(() => {
    const handleHistoryState = (e: any) => {
      if (e.detail?.pageId && pages.some(p => p.id === e.detail.pageId)) {
        setCanUndo(e.detail.canUndo);
        setCanRedo(e.detail.canRedo);
      }
    };
    window.addEventListener('genzite:history:state', handleHistoryState);
    return () => window.removeEventListener('genzite:history:state', handleHistoryState);
  }, [pages]);

  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMediaFileApi(file),
    onSuccess: () => {
      message.success('Tải ảnh lên thành công!');
      queryClient.invalidateQueries({ queryKey: ['site-media'] });
    },
    onError: () => {
      message.error('Tải ảnh lên thất bại!');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (e.target) {
      e.target.value = ''; // Reset input to allow uploading same file again
    }
  };
  
  const topZCounter = useRef(10);
  const requestTopZ = useCallback(() => {
    topZCounter.current += 1;
    return topZCounter.current;
  }, []);
  const [isGrapesSelected, setIsGrapesSelected] = useState(false);

  // Fetch widgets across all pages to dynamically extract actual project colors
  const { data: allPagesWidgets } = useQuery({
    queryKey: ['site-all-widgets', siteId, pages],
    queryFn: async () => {
      if (!pages || pages.length === 0) return [];
      const results = await Promise.all(
        pages.map((page: any) => fetchWidgetsApi(page.id).catch(() => []))
      );
      return results.flat();
    },
    enabled: !!pages && pages.length > 0 && !!siteId,
  });

  // Helper to dynamically extract real hex colors from live project widgets and settings
  const extractRealProjectColors = () => {
    const colorCounts: Record<string, number> = {};
    const addColor = (col?: string) => {
      if (!col || typeof col !== 'string') return;
      // Match 3, 6, or 8 digit hex colors or rgb/hsl
      const matches = col.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)/g);
      if (matches) {
        matches.forEach(c => {
          let clean = c.toUpperCase();
          if (clean === '#FFF' || clean === '#FFFFFF' || clean === '#000' || clean === '#000000' || clean === '#00000000' || clean === 'TRANSPARENT') return;
          if (clean.length === 4 && clean.startsWith('#')) {
            clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
          }
          colorCounts[clean] = (colorCounts[clean] || 0) + 1;
        });
      }
    };

    // Scan site settings
    if (site?.settings) {
      JSON.stringify(site.settings, (_key, value) => {
        if (typeof value === 'string') addColor(value);
        return value;
      });
    }

    // Scan all widgets (html, css, contentConfig)
    if (allPagesWidgets && Array.isArray(allPagesWidgets)) {
      allPagesWidgets.forEach(w => {
        if (w.contentConfig) {
          JSON.stringify(w.contentConfig, (_key, value) => {
            if (typeof value === 'string') addColor(value);
            return value;
          });
        }
      });
    }

    // Sort unique colors by frequency
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Determine Primary, Secondary, Tertiary, Neutral with fallbacks if project has very few colors
    const primary = sortedColors[0] || (site?.settings?.primaryColor as string) || '#0F172A';
    const secondary = sortedColors[1] || (site?.settings?.secondaryColor as string) || '#334155';
    const tertiary = sortedColors[2] || '#2563EB';
    const neutral = sortedColors[3] || '#F8FAFC';
    
    // Generate real shades/swatches based on hex color (blending with white/black or opacity steps)
    const generateShades = (baseHex: string) => {
      if (!baseHex.startsWith('#') || baseHex.length < 7) {
        return [baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex];
      }
      const r = parseInt(baseHex.slice(1, 3), 16);
      const g = parseInt(baseHex.slice(3, 5), 16);
      const b = parseInt(baseHex.slice(5, 7), 16);
      const shades: string[] = [];
      for (let i = 0; i < 10; i++) {
        const factor = (i - 4) * 0.15;
        let nr = r, ng = g, nb = b;
        if (factor < 0) {
          const darkFactor = 1 + factor;
          nr = Math.round(r * darkFactor);
          ng = Math.round(g * darkFactor);
          nb = Math.round(b * darkFactor);
        } else {
          nr = Math.round(r + (255 - r) * factor);
          ng = Math.round(g + (255 - g) * factor);
          nb = Math.round(b + (255 - b) * factor);
        }
        nr = Math.min(255, Math.max(0, nr));
        ng = Math.min(255, Math.max(0, ng));
        nb = Math.min(255, Math.max(0, nb));
        const hex = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`.toUpperCase();
        shades.push(hex);
      }
      return shades;
    };

    return {
      primary,
      secondary,
      tertiary,
      neutral,
      primaryShades: generateShades(primary),
      secondaryShades: generateShades(secondary),
      tertiaryShades: generateShades(tertiary),
      neutralShades: generateShades(neutral),
      allExtracted: sortedColors
    };
  };

  const projectColors = extractRealProjectColors();

  const getToolBtnStyle = (toolName: string): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 15,
    position: 'relative',
    background: 'transparent',
    color: activeTool === toolName ? '#0F172A' : '#CBD5E1',
    transition: 'color 0.2s',
    zIndex: 1
  });

  useEffect(() => {
    const handler = (e: any) => setIsGrapesSelected(e.detail);
    window.addEventListener('grapes:selected', handler);
    return () => window.removeEventListener('grapes:selected', handler);
  }, []);

  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  const resetZoom = () => { setZoom(0.4); setPan({ x: 100, y: 100 }); };

  useEffect(() => {
    const el = canvasCenterRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Prevents default browser zoom
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((z + delta).toFixed(2)))));
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      switch(e.key.toLowerCase()) {
        case 'v': setActiveTool('select'); break;
        case 'f': setActiveTool('frame'); break;
        case 'p': setActiveTool('draw'); break;
        case 'h': setActiveTool('pan'); break;
        case 'i': 
          setActiveTool('image'); 
          fileInputRef.current?.click();
          break;
        case 'c': 
          setActiveTool('palette'); 
          setPan({ x: 100, y: 100 }); 
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Deselect if clicking on empty canvas
    if ((e.target as HTMLElement).classList.contains('canvas-center') ||
        (e.target as HTMLElement).classList.contains('canvas-viewport')) {
      if (e.button === 0) {
        setSelectedId(null);
      }
    }

    if (e.button === 1 || e.altKey || e.button === 2 || (activeTool === 'pan' && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    }
  }, [pan.x, pan.y, activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && panStart.current) {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.mx),
        y: panStart.current.py + (e.clientY - panStart.current.my),
      });
    }
    // Track mouse position for CSS spotlight (scoped to workspace root to cover toolbar)
    if (workspaceRootRef.current) {
      const rect = workspaceRootRef.current.getBoundingClientRect();
      workspaceRootRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      workspaceRootRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handlePreview = () => {
    const homePage = pages?.find((p: any) => p.slug === 'home' || p.slug === '/') || pages?.[0];
    if (homePage) {
      window.open(`/live/${homePage.id}`, '_blank');
    }
  };

  const handlePublish = () => {
    window.open(`https://${siteId}.genzite.com`, '_blank');
  };

  return (
    <div 
      className="canvas-workspace-root" 
      ref={workspaceRootRef} 
      onMouseMove={handleMouseMove}
      style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
      
      <CanvasToolbar 
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onPreview={handlePreview}
        onPublish={handlePublish}
        siteTitle={site?.name || siteId}
        siteId={siteId}
        site={site}
        selectedId={selectedId}
      />
      
      <div className="canvas-body" style={{ display: 'flex', position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Left: AI Agent Task Logs & Structure (Floating) */}
        <div className="canvas-sidebar-left" style={{ 
          position: 'absolute', 
          left: 24, 
          top: 80, 
          bottom: isSidebarExpanded ? 24 : 'auto', 
          width: isSidebarExpanded ? 310 : 56, 
          height: isSidebarExpanded ? 'auto' : 56,
          zIndex: 10,
          background: isSidebarExpanded 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(17, 24, 39, 0.6)' 
            : 'rgba(17, 24, 39, 0.6)', // Solid dark square when collapsed
          borderRadius: 16, 
          boxShadow: isSidebarExpanded ? '0 20px 50px rgba(0,0,0,0.6)' : '0 8px 30px rgba(56, 189, 248, 0.15)', 
          display: 'flex', flexDirection: 'column', overflow: 'hidden', 
          border: isSidebarExpanded ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(56, 189, 248, 0.3)', 
          backdropFilter: 'blur(24px)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, border 0.3s, box-shadow 0.3s'
        }}>
          {/* Merged Header */}
          <div style={{ 
            display: 'flex', alignItems: 'center', 
            justifyContent: isSidebarExpanded ? 'space-between' : 'center', 
            padding: isSidebarExpanded ? '14px 16px' : '0', 
            height: isSidebarExpanded ? 'auto' : '100%',
            width: isSidebarExpanded ? 'auto' : '100%',
            background: isSidebarExpanded ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
            backgroundImage: isSidebarExpanded ? 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)' : 'none',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0',
            borderBottom: isSidebarExpanded ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: isSidebarExpanded ? 'auto' : '100%', height: isSidebarExpanded ? 'auto' : '100%', justifyContent: isSidebarExpanded ? 'flex-start' : 'center' }}>
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  width: isSidebarExpanded ? 'auto' : '100%',
                  height: isSidebarExpanded ? 'auto' : '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: 0.9,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
                title={isSidebarExpanded ? "Thu gọn (Collapse)" : "Mở rộng (Expand)"}
              >
                <Sparkles size={isSidebarExpanded ? 18 : 24} color="#38bdf8" />
              </button>

              {isSidebarExpanded && (
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
                  Gemini
                </span>
              )}
            </div>

            {/* Right Controls: New Thread */}
            {isSidebarExpanded && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16
                  }}
                  title="Cuộc trò chuyện mới"
                >
                  <PlusOutlined />
                </button>
              </div>
            )}
          </div>
          
          <div style={{ 
            flex: 1, 
            opacity: isSidebarExpanded ? 1 : 0, 
            visibility: isSidebarExpanded ? 'visible' : 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            overflow: 'hidden' 
          }}>
            <div id="portal-left-sidebar" style={{ width: 310, height: '100%', overflowY: 'auto' }}>
              {/* Portaled from GrapesEditor */}
            </div>
          </div>
        </div>

        <div
          className="canvas-center"
          ref={canvasCenterRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => { e.preventDefault(); handleMouseDown(e); }} // Right click pan
          style={{ 
            width: '100%',
            height: '100%',
            cursor: isPanning ? 'grabbing' : 
                    activeTool === 'pan' ? 'grab' : 
                    (activeTool === 'frame' || activeTool === 'draw') ? 'crosshair' : 'default', 
            background: 'transparent' 
          }}
        >
          {/* Viewport with zoom + pan transform */}
          <div
            className="canvas-viewport"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              pointerEvents: (activeTool === 'pan' || isPanning) ? 'none' : 'auto',
              width: 10000, height: 10000 // Very large logical space
            }}
          >
            {/* Board 1: Real Project Design System Board */}
            <DraggableBoard
              initialX={0}
              initialY={100}
              zoom={zoom}
              activeTool={activeTool}
              requestTopZ={requestTopZ}
              style={{
                width: 1360,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif'
              }}
            >
              {/* Board Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                  <BgColorsOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                  {site?.name || 'Design System'}
                </span>
                <span style={{ fontSize: 12, background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '4px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.3)', marginLeft: 8 }}>
                  Design System
                </span>
              </div>

              {/* Board Outer Glowing Frame */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: `3px solid ${projectColors.primary}`,
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: `0 30px 100px ${projectColors.primary}40, 0 10px 40px rgba(0, 0, 0, 0.5)`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 16
                }}
              >
                {/* Column 1: Real Project Color Palettes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Primary Color Card */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Primary</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.primary}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.primaryShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Secondary Color Card */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Secondary</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.secondary}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.secondaryShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tertiary Color Card */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Tertiary</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.tertiary}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.tertiaryShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Neutral Color Card */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Neutral</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.neutral}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.neutralShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Extracted Palette Card */}
                  {projectColors.allExtracted.length > 0 && (
                    <div style={{ background: '#0F172A', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live Project Palette</span>
                        <span style={{ fontSize: 11, background: '#1E293B', color: '#94A3B8', padding: '2px 8px', borderRadius: 999 }}>{projectColors.allExtracted.length} colors</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 80, overflowY: 'auto' }}>
                        {projectColors.allExtracted.map((col, idx) => (
                          <div
                            key={idx}
                            style={{ width: 24, height: 24, borderRadius: 6, background: col, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', flexShrink: 0 }}
                            title={`Click to copy ${col}`}
                            onClick={() => {
                              navigator.clipboard.writeText(col);
                              message.success(`Copied ${col} to clipboard!`);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Typography Scale */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Headline */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Headline</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'capitalize' }}>{site?.settings?.fontFamily?.split(',')[0] || 'Inter'}</span>
                    </div>
                    <div style={{ fontSize: 72, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1, margin: '16px 0', fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif' }}>
                      Aa
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>48px • Bold • 1.2 line height</div>
                  </div>

                  {/* Body */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Body</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'capitalize' }}>{site?.settings?.fontFamily?.split(',')[0] || 'Inter'}</span>
                    </div>
                    <div style={{ fontSize: 56, fontWeight: 500, color: '#334155', letterSpacing: '-0.02em', lineHeight: 1, margin: '16px 0', fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif' }}>
                      Aa
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>16px • Medium • 1.5 line height</div>
                  </div>

                  {/* Label */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Label</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'capitalize' }}>{site?.settings?.fontFamily?.split(',')[0] || 'Inter'}</span>
                    </div>
                    <div style={{ fontSize: 44, fontWeight: 400, color: '#64748B', letterSpacing: '-0.01em', lineHeight: 1, margin: '16px 0', fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif' }}>
                      Aa
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>14px • Regular • 1.4 line height</div>
                  </div>
                </div>

                {/* Column 3: Buttons & Progress Lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Buttons Grid */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button style={{ background: projectColors.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Primary
                    </button>
                    <button style={{ background: projectColors.secondary, color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Secondary
                    </button>
                    <button style={{ background: projectColors.tertiary, color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Tertiary
                    </button>
                    <button style={{ background: '#fff', color: projectColors.primary, border: `1px solid ${projectColors.primary}`, padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Outlined
                    </button>
                  </div>

                  {/* Progress Bars / Lines */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, flex: 1 }}>
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: '75%', height: '100%', background: projectColors.primary, borderRadius: 999 }} />
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: '45%', height: '100%', background: projectColors.secondary, borderRadius: 999 }} />
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: '90%', height: '100%', background: projectColors.tertiary, borderRadius: 999 }} />
                    </div>
                  </div>

                  {/* Small Square & Label Buttons */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA' }}>
                      <EditOutlined style={{ fontSize: 18 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E293B', color: '#fff', padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                      <EditOutlined style={{ color: '#60A5FA' }} />
                      <span>Label</span>
                    </div>
                  </div>
                </div>

                {/* Column 4: Search, Navigation Bar & Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Search Input Preview */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', color: '#64748B', fontSize: 14 }}>
                      <SearchOutlined />
                      <span>Search</span>
                    </div>
                  </div>

                  {/* Floating Nav Bar Preview */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 999, padding: '10px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HomeOutlined style={{ fontSize: 16 }} />
                      </div>
                      <SearchOutlined style={{ fontSize: 18, color: '#64748B', cursor: 'pointer' }} />
                      <UserOutlined style={{ fontSize: 18, color: '#64748B', cursor: 'pointer' }} />
                    </div>
                  </div>

                  {/* Square Tag Badges */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <ToolOutlined />
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <AppstoreOutlined />
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <TagOutlined />
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#DC2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <BookOutlined />
                    </div>
                  </div>
                </div>
              </div>
            </DraggableBoard>

            {/* Boards 2+: Project Pages */}
            {(pages || []).map((page: any, index: number) => (
              <DraggableBoard
                key={page.id}
                initialX={(index + 1) * PAGE_SPACING}
                initialY={100}
                zoom={zoom}
                activeTool={activeTool}
                requestTopZ={requestTopZ}
              >
                <CanvasPageFrame
                  pageId={page.id}
                  pageTitle={page.title || 'Home'}
                  siteName={site?.name || 'My Site'}
                  globalSelectedId={selectedId}
                  onSelectWidget={setSelectedId}
                  activeTool={activeTool}
                />
              </DraggableBoard>
            ))}
          </div>
        </div>

        {/* Hidden Portal for GrapesJS Properties so it never breaks */}
        <div id="portal-right-sidebar" style={{ display: 'none' }} />

        {/* Right: Floating Canvas Tool Pill (Figma / Excalidraw style) */}
        <div
          className="canvas-tools-right-pill"
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 5px',
            gap: 8,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)), rgba(17, 24, 39, 0.6)',
            borderRadius: 30,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)'
          }}
        >
          {[
            { id: 'select', title: 'Select / Pointer (V)', icon: <ArrowUpOutlined style={{ transform: 'rotate(-45deg)' }} /> },
            { id: 'frame', title: 'Frame / Marquee Tool (F)', icon: <BorderOutlined /> },
            { id: 'draw', title: 'Draw / Pencil Tool (P)', icon: <EditOutlined /> },
            { id: 'pan', title: 'Hand / Pan Tool (H)', icon: <DragOutlined /> },
            { id: 'image', title: 'Image / Media Tool (I)', icon: <PictureOutlined /> },
            { id: 'divider', title: '', icon: null },
            { id: 'palette', title: 'Color Palette / Styles (C)', icon: <BgColorsOutlined /> },
            { id: 'star', title: 'Favorites / Assets (S)', icon: <StarOutlined /> }
          ].map(tool => {
            if (tool.id === 'divider') {
              return <div key="divider" style={{ width: 18, height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '2px 0' }} />;
            }
            return (
              <button
                key={tool.id}
                type="button"
                className="canvas-right-tool-btn"
                onClick={() => {
                  if (tool.id === 'image') fileInputRef.current?.click();
                  if (tool.id === 'palette') {
                    setZoom(0.4);
                    setPan({ x: 100, y: 100 });
                  }
                  setActiveTool(tool.id as any);
                }}
                style={getToolBtnStyle(tool.id)}
                title={tool.title}
              >
                {activeTool === tool.id && (
                  <motion.div
                    layoutId="activeToolBg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{ position: 'absolute', inset: 0, background: '#F8FAFC', borderRadius: '50%', zIndex: -1, boxShadow: '0 4px 12px rgba(255, 255, 255, 0.25)' }}
                  />
                )}
                {tool.icon && React.cloneElement(tool.icon as React.ReactElement<any>, { style: { ...(tool.icon as React.ReactElement<any>).props.style, position: 'relative', zIndex: 2 } })}
              </button>
            );
          })}
        </div>

        <div className="canvas-prompt-wrapper">
          <AIPromptBar compact onGenerated={onAIGenerated} siteId={siteId} />
        </div>

        {/* Floating Controls at Bottom Right (Undo/Redo + Zoom) */}
        <div 
          className="canvas-zoom-floating" 
          style={{ 
            position: 'absolute', 
            bottom: 24, 
            right: 20, 
            zIndex: 50, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(17, 24, 39, 0.6)', 
            padding: '6px 14px', 
            borderRadius: 24, 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)'
          }}
        >
          {/* Global Undo/Redo for Canvas Workspace */}
          <button 
            className="canvas-tool-btn" 
            style={{ color: '#fff', opacity: canUndo ? 1 : 0.35, pointerEvents: canUndo ? 'auto' : 'none' }} 
            onClick={() => window.dispatchEvent(new CustomEvent('genzite:undo', { detail: { pageId: pages[0]?.id } }))} 
            title="Undo Canvas Action"
          >
            <UndoOutlined />
          </button>
          <button 
            className="canvas-tool-btn" 
            style={{ color: '#fff', opacity: canRedo ? 1 : 0.35, pointerEvents: canRedo ? 'auto' : 'none' }} 
            onClick={() => window.dispatchEvent(new CustomEvent('genzite:redo', { detail: { pageId: pages[0]?.id } }))} 
            title="Redo Canvas Action"
          >
            <RedoOutlined />
          </button>
          <div className="canvas-divider" style={{ background: 'rgba(255, 255, 255, 0.15)', height: 16, width: 1, margin: '0 4px' }} />
          <button className="canvas-tool-btn" onClick={zoomOut} title="Zoom Out"><ZoomOutOutlined /></button>
          <span className="canvas-zoom-display" style={{ color: '#fff', fontSize: 13, minWidth: 48, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
          <button className="canvas-tool-btn" onClick={zoomIn} title="Zoom In"><ZoomInOutlined /></button>
          <div className="canvas-divider" style={{ background: 'rgba(255, 255, 255, 0.15)', height: 16, width: 1, margin: '0 4px' }} />
          <button className="canvas-tool-btn" onClick={resetZoom} title="Fit to Screen"><FullscreenOutlined /></button>
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;
