import React, { useState, useRef, useEffect, useCallback } from 'react';
import { message, Modal, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchWidgetsApi, deletePageApi } from '../../../api/sites';
import { uploadMediaFileApi } from '../../../api/media';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

  CopyOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { X, Monitor, Trash2 } from 'lucide-react';
import CanvasPageFrame from './CanvasPageFrame';
import AIPromptBar from './AIPromptBar';
import CanvasToolbar from './CanvasToolbar';

import { useAiLogStore } from '../../../store/aiLogs';
import { ThemeEditorPanel } from './workspace-components/ThemeEditorPanel';
import { LeftSidebar } from './workspace-components/LeftSidebar';

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
  onViewDetails?: () => void;
  onViewCode?: () => void;
  onDownload?: () => void;
  onReloadPage?: () => void;
  onDeletePage?: () => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ 
  pages, 
  siteId, 
  site, 
  onAIGenerated,
  onViewDetails,
  onViewCode,
  onDownload,
  onReloadPage,
  onDeletePage,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<any>(null);

  const submitSiteGeneration = useAiLogStore(state => state.submitSiteGeneration);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);

  const handleApplyThemeToSelection = () => {
    if (!selectedId) {
      message.warning('Please select a page first');
      return;
    }
    
    const themeOverrides = {
      themeId: detailThemeId,
      mode: themeMode,
      radius: themeRadius,
      colors: themeColorOverrides,
      fonts: themeFonts,
    };
    
    setIsApplyingTheme(true);
    message.info('Applying design system to selected page...');
    
    submitSiteGeneration(
      `[TARGET_PAGE:${selectedId}] Update the current page UI to perfectly match the provided Design System and color palette.`,
      'gemini-2.5-flash',
      siteId || `gen-${Date.now()}`,
      JSON.stringify(themeOverrides),
      // @ts-ignore
      (jobId, subdomain) => {
        setIsApplyingTheme(false);
        message.success('Design applied successfully! Loading...');
        if (onAIGenerated) {
          onAIGenerated(jobId);
        }
      },
      (error) => {
        setIsApplyingTheme(false);
        message.error(error || 'Failed to apply design');
      }
    );
  };

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [detailThemeId, setDetailThemeId] = useState<string | null>(null);
  const [detailThemeTab, setDetailThemeTab] = useState<'Theme' | 'DESIGN.md'>('Theme');
  const [themeColorOverrides, setThemeColorOverrides] = useState<Record<string, string>>({});
  const [themeFonts, setThemeFonts] = useState<Record<string, string>>({});
  const [expandedFontRole, setExpandedFontRole] = useState<string | null>(null);
  const [fontSearch, setFontSearch] = useState('');
  const [themeScheme, setThemeScheme] = useState('Fidelity');
  const [themeMode, setThemeMode] = useState<'light'|'dark'>('light');
  const [themeRadius, setThemeRadius] = useState<number>(4);
  const [isThemeSchemeOpen, setIsThemeSchemeOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [canvasDevice, setCanvasDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('full');
  const isGenerating = useAiLogStore(state => state.isGenerating);
  
  useEffect(() => {
    if (isGenerating) {
      setIsSidebarExpanded(true);
    }
  }, [isGenerating]);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMediaFileApi(file),
    onSuccess: () => {
      message.success('Image uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['site-media'] });
    },
    onError: () => {
      message.error('Failed to upload image!');
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

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => deletePageApi(id),
    onSuccess: () => {
      message.success('Page deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['site-pages', siteId] });
      setSelectedId(null);
    },
    onError: () => {
      message.error('Failed to delete page!');
    }
  });

  const handleDeletePage = () => {
    const activePage = pages?.find((p: any) => selectedId?.includes(p.id)) || pages?.[0];
    if (!activePage) return;
    setPageToDelete(activePage);
  };

  const handleReloadPage = () => {
    queryClient.invalidateQueries({ queryKey: ['site-all-widgets', siteId] });
    message.success('Page reloaded successfully!');
  };

  const handleDownload = async () => {
    const activePage = pages?.find((p: any) => selectedId?.includes(p.id)) || pages?.[0];
    if (!activePage) return;
    
    const hideMessage = message.loading('Preparing download data...', 0);
    try {
      const zip = new JSZip();
      
      const htmlString = getActivePageCode();
      zip.file(`${activePage.slug || 'index'}.html`, htmlString);
      
      const designPrompt = activePage?.settings?.designPrompt || site?.settings?.systemPrompt || 'No design prompt specified.';
      zip.file('DESIGN.md', designPrompt);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${activePage.slug || 'export'}.zip`);
      hideMessage();
      message.success('Downloaded successfully!');
    } catch (err) {
      console.error(err);
      hideMessage();
      message.error('Failed to download!');
    }
  };

  const { data: allPagesWidgets, isFetching: isFetchingWidgets } = useQuery({
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

  const getActivePageCode = useCallback(() => {
    const activePage = pages?.find((p: any) => selectedId?.includes(p.id)) || pages?.[0];
    if (!activePage || !allPagesWidgets) return '';
    
    const pageWidgets = allPagesWidgets.filter((w: any) => w._id?.includes(activePage.id) || w.pageId === activePage.id);
    const grapesWidget = pageWidgets.find((w: any) => w.type === 'GRAPESJS');
    
    let htmlContent = '';
    let cssContent = '';
    
    if (grapesWidget) {
      htmlContent = grapesWidget.contentConfig?.html || '';
      cssContent = grapesWidget.contentConfig?.css || '';
    } else {
      htmlContent = pageWidgets.map((w: any) => w.contentConfig?.html || '').join('\n');
    }
    
    return `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${activePage.title} | ${site?.name || 'Project'}</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {}
    }
  }
</script>
<style>
${cssContent}
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }, [pages, selectedId, allPagesWidgets, site]);

  const extractRealProjectColors = () => {
    const colorCounts: Record<string, number> = {};
    const addColor = (col?: string) => {
      if (!col || typeof col !== 'string') return;
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

    if (site?.settings) {
      JSON.stringify(site.settings, (_key, value) => {
        if (typeof value === 'string') addColor(value);
        return value;
      });
    }

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

    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const primary = sortedColors[0] || (site?.settings?.primaryColor as string) || '#0F172A';
    const secondary = sortedColors[1] || (site?.settings?.secondaryColor as string) || '#334155';
    const tertiary = sortedColors[2] || '#2563EB';
    const neutral = sortedColors[3] || '#F8FAFC';
    
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

  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  const resetZoom = () => { setZoom(0.4); setPan({ x: 100, y: 100 }); };

  useEffect(() => {
    const el = canvasCenterRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); 
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
        siteTitle={site?.name || pages?.[0]?.title || 'My App'}
        siteId={siteId}
        site={site}
        selectedId={selectedId}
        canvasDevice={canvasDevice}
        onDeviceChange={setCanvasDevice}
        onViewDetails={onViewDetails || (() => { setIsDetailsOpen(true); setIsStylesOpen(false); })}
        onViewCode={onViewCode || (() => setIsCodeModalOpen(true))}
        onDownload={onDownload || handleDownload}
        onReloadPage={onReloadPage || handleReloadPage}
        onDeletePage={onDeletePage || handleDeletePage}
      />
      
      <div className="canvas-body" style={{ display: 'flex', position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <LeftSidebar 
          isSidebarExpanded={isSidebarExpanded} 
          setIsSidebarExpanded={setIsSidebarExpanded} 
        />

        <div
          className="canvas-center"
          ref={canvasCenterRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => { e.preventDefault(); handleMouseDown(e); }} 
          style={{ 
            width: '100%',
            height: '100%',
            cursor: isPanning ? 'grabbing' : 
                    activeTool === 'pan' ? 'grab' : 
                    (activeTool === 'frame' || activeTool === 'draw') ? 'crosshair' : 'default', 
            background: 'transparent' 
          }}
        >
          <div
            className="canvas-viewport"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              pointerEvents: (activeTool === 'pan' || isPanning) ? 'none' : 'auto',
              width: 10000, height: 10000 
            }}
          >
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', color: '#64748B', fontSize: 14 }}>
                      <SearchOutlined />
                      <span>Search</span>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 999, padding: '10px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HomeOutlined style={{ fontSize: 16 }} />
                      </div>
                      <SearchOutlined style={{ fontSize: 18, color: '#64748B', cursor: 'pointer' }} />
                      <UserOutlined style={{ fontSize: 18, color: '#64748B', cursor: 'pointer' }} />
                    </div>
                  </div>

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

            {(pages || []).map((page: any, index: number) => {
              const isSelectedPage = selectedId?.includes(page.id) || (!selectedId && index === 0);
              return (
                <DraggableBoard
                  key={page.id}
                  initialX={(index + 1) * PAGE_SPACING}
                  initialY={100}
                  zoom={zoom}
                  activeTool={activeTool}
                  requestTopZ={requestTopZ}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {isFetchingWidgets && isSelectedPage && (
                      <div style={{ position: 'absolute', inset: -8, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', borderRadius: 12 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16, color: '#38bdf8', fontWeight: 600, fontSize: 16, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Reloading data...</div>
                      </div>
                    )}
                    <CanvasPageFrame
                      pageId={page.id}
                      pageTitle={page.title || 'Home'}
                      siteName={site?.name || 'My Site'}
                      globalSelectedId={selectedId}
                      onSelectWidget={setSelectedId}
                      activeTool={activeTool}
                      canvasDevice={canvasDevice}
                    />
                  </div>
                </DraggableBoard>
              );
            })}
          </div>
        </div>

        <div id="portal-right-sidebar" style={{ display: 'none' }} />

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
                    setIsStylesOpen(!isStylesOpen);
                    setIsDetailsOpen(false);
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
          <AIPromptBar 
            compact 
            onGenerated={onAIGenerated} 
            siteId={siteId} 
            selectedPage={pages?.find((p: any) => selectedId?.includes(p.id))}
            onClearSelection={() => setSelectedId(null)}
            onSelectTheme={(id) => {
              setDetailThemeId(id);
            }}
            onCreateNewTheme={() => {
              setDetailThemeId('custom');
              setIsStylesOpen(true);
            }}
            themeOverrides={{
              themeId: detailThemeId,
              mode: themeMode,
              radius: themeRadius,
              colors: themeColorOverrides,
              fonts: themeFonts,
              scheme: themeScheme
            }}
          />
        </div>

        {(() => {
          if (!isDetailsOpen) return null;
          
          const activePage = pages?.find((p: any) => selectedId?.includes(p.id)) || pages?.[0];
          let pageHeight = 1000;
          let extractedAssets: string[] = [];
          
          if (activePage && allPagesWidgets) {
            const pageWidgets = allPagesWidgets.filter((w: any) => w._id?.includes(activePage.id) || w.pageId === activePage.id);
            let maxH = 0;
            pageWidgets.forEach((w: any) => {
              const h = w.contentConfig?.geometry?.height || 200;
              const y = w.contentConfig?.geometry?.y || 0;
              if (y + h > maxH) maxH = y + h;
              
              const props = w.contentConfig?.props || {};
              if (props.src) extractedAssets.push(props.src);
              if (props.url) extractedAssets.push(props.url);
              if (props.images && Array.isArray(props.images)) {
                extractedAssets.push(...props.images.map((img: any) => img.url || img));
              }
            });
            if (maxH > 0) pageHeight = maxH;
          }
          
          extractedAssets = [...new Set(extractedAssets)].filter(url => typeof url === 'string' && url.startsWith('http'));

          return (
            <div style={{
              position: 'absolute',
              top: 80, 
              right: 70, 
              bottom: 90, 
              width: 320,
              background: 'rgba(17, 24, 39, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100,
              color: '#F8FAFC',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{site?.name ? `${site.name} - ` : ''}{activePage?.title || 'Home'}</span>
                <button 
                  onClick={() => setIsDetailsOpen(false)} 
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: 20, overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Properties</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>Type</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Monitor size={12} style={{ opacity: 0.7 }} /> Design Screen
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>Size</span>
                    <span style={{ fontWeight: 500 }}>1440 x {pageHeight}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>DESIGN.md</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                      {site?.name || 'My Project'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>Source</span>
                    <span style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsCodeModalOpen(true)}>{'</>'} View Code</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Design Prompt</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, color: '#CBD5E1', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    {activePage?.settings?.designPrompt || site?.settings?.systemPrompt || 'No design prompt specified for this project.'}
                  </div>
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assets ({extractedAssets.length})</div>
                  {extractedAssets.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {extractedAssets.map((asset, i) => (
                        <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <img src={asset} alt="Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', padding: 16, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}>
                      No assets extracted yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        {isStylesOpen && (
          <ThemeEditorPanel
            detailThemeId={detailThemeId}
            setDetailThemeId={setDetailThemeId}
            detailThemeTab={detailThemeTab}
            setDetailThemeTab={setDetailThemeTab}
            themeColorOverrides={themeColorOverrides}
            setThemeColorOverrides={setThemeColorOverrides}
            themeFonts={themeFonts}
            setThemeFonts={setThemeFonts}
            expandedFontRole={expandedFontRole}
            setExpandedFontRole={setExpandedFontRole}
            fontSearch={fontSearch}
            setFontSearch={setFontSearch}
            themeScheme={themeScheme}
            setThemeScheme={setThemeScheme}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            themeRadius={themeRadius}
            setThemeRadius={setThemeRadius}
            isThemeSchemeOpen={isThemeSchemeOpen}
            setIsThemeSchemeOpen={setIsThemeSchemeOpen}
            handleApplyThemeToSelection={handleApplyThemeToSelection}
            isApplyingTheme={isApplyingTheme}
            selectedId={selectedId}
            setIsStylesOpen={setIsStylesOpen}
          />
        )}

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

        {/* Code Viewer Modal */}
        <Modal
          open={isCodeModalOpen}
          onCancel={() => setIsCodeModalOpen(false)}
          footer={null}
          closable={false}
          width={1000}
          centered
          styles={{
            content: {
              background: '#1e1e1e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              padding: 0,
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden'
            },
            mask: {
              backdropFilter: 'blur(4px)',
              background: 'rgba(0, 0, 0, 0.7)',
            }
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#252526' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ed6a5e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f4bf4f' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#61c554' }} />
            </div>
            <div style={{ color: '#ccc', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{site?.name || 'Project'} - Code View</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { navigator.clipboard.writeText(getActivePageCode()); message.success('Code copied to clipboard!'); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CopyOutlined /> Copy Code
              </button>
              <button 
                onClick={() => setIsCodeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <CloseOutlined />
              </button>
            </div>
          </div>
          
          <div style={{ padding: 20, maxHeight: '70vh', overflow: 'auto', background: '#1e1e1e', fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', lineHeight: 1.6 }} className="custom-scrollbar">
            {getActivePageCode().split('\n').map((line, i) => {
              let highlighted = line
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(&lt;\/?)([a-zA-Z0-9\-]+)(.*?)(&gt;)/g, (_match, p1, tag, attrs, p4) => {
                  const coloredAttrs = attrs.replace(/([a-zA-Z0-9\-]+)=(&quot;.*?&quot;|'.*?'|".*?")/g, 
                    '<span style="color: #9cdcfe;">$1</span>=<span style="color: #ce9178;">$2</span>'
                  );
                  return `${p1}<span style="color: #569cd6;">${tag}</span>${coloredAttrs}${p4}`;
                });
                
              return (
                <div key={i} style={{ display: 'flex' }}>
                  <span style={{ color: '#858585', minWidth: 40, userSelect: 'none', textAlign: 'right', paddingRight: 16 }}>{i + 1}</span>
                  <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
                </div>
              );
            })}
          </div>
        </Modal>

        {/* Delete Page Modal - Synchronized with aiLogs UI */}
        <Modal
          open={!!pageToDelete}
          onCancel={() => setPageToDelete(null)}
          footer={null}
          closable={false}
          width={440}
          centered
          styles={{
            content: {
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(19, 21, 29, 0.96)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(239, 68, 68, 0.12)',
              backdropFilter: 'blur(24px) saturate(140%)',
            },
            mask: {
              backdropFilter: 'blur(6px)',
              background: 'rgba(0, 0, 0, 0.65)',
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              flexShrink: 0
            }}>
              <Trash2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'var(--font-sans)' }}>Delete Page</h3>
              <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>Confirm removing this page from the project</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.025)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.07)',
            padding: '16px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
                <span style={{ color: '#06B6D4' }}>✦</span>
                <span>Page Name:</span>
              </div>
              <span style={{ color: '#fff', fontWeight: 600 }}>{pageToDelete?.title || 'Current Page'}</span>
            </div>

            <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
              Are you sure you want to delete this page? All components and content within this page will be permanently removed.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={() => setPageToDelete(null)}
              style={{
                padding: '9px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                color: '#CBD5E1',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (pageToDelete) {
                  deletePageMutation.mutate(pageToDelete.id);
                  setPageToDelete(null);
                }
              }}
              style={{
                padding: '9px 20px',
                background: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.8)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Delete Page
            </button>
          </div>
        </Modal>
      </div>
  );
};

export default CanvasWorkspace;
