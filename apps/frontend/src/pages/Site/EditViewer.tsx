import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Spin } from 'antd';
import { fetchPagesApi, fetchWidgetsApi, replaceWidgetsApi, fetchSiteByIdApi, type Widget } from '../../api/sites';
import EditTopBar from './builder/EditTopBar';
import EditLeftPanel from './builder/EditLeftPanel';
import EditRightPanel from './builder/EditRightPanel';
import GrapesEditor, { type GrapesEditorRef } from './builder/GrapesEditor';
import './CanvasBuilder.css';

const EditViewer: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const navigate = useNavigate();
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('desktop');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [dragMode, setDragMode] = useState<'absolute' | ''>('absolute');
  const [isPanActive, setIsPanActive] = useState(false);
  
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  
  const canvasCenterRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<GrapesEditorRef>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleZoomIn = () => {
      setZoom(z => {
        const newZ = Math.min(2, parseFloat((z + 0.1).toFixed(2))); // max 200%
        window.dispatchEvent(new CustomEvent('genzite:grapes:zoom:update', { detail: { zoom: newZ * 100 } }));
        return newZ;
      });
    };
    const handleZoomOut = () => {
      setZoom(z => {
        const newZ = Math.max(0.1, parseFloat((z - 0.1).toFixed(2)));
        window.dispatchEvent(new CustomEvent('genzite:grapes:zoom:update', { detail: { zoom: newZ * 100 } }));
        return newZ;
      });
    };
    const handleZoomSet = (e: any) => {
      if (e.detail && typeof e.detail.zoom === 'number') {
        const val = Math.min(2, Math.max(0.1, e.detail.zoom / 100));
        setZoom(val);
        window.dispatchEvent(new CustomEvent('genzite:grapes:zoom:update', { detail: { zoom: val * 100 } }));
      }
    };
    const handleZoomFit = () => {
      setZoom(1.0); // 100% is fit to screen as requested
      setPan({ x: 0, y: 0 });
      window.dispatchEvent(new CustomEvent('genzite:grapes:zoom:update', { detail: { zoom: 100 } }));
    };
    const handlePanToggle = () => {
      setIsPanActive(prev => {
        const next = !prev;
        window.dispatchEvent(new CustomEvent('genzite:grapes:pan:update', { detail: { active: next } }));
        return next;
      });
    };

    const handleReload = () => {
      setReloadKey(prev => prev + 1);
      
      const el = document.getElementById('edit-viewer-canvas-wrapper');
      if (el) {
        el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transform = 'scale(0.98)';
        el.style.opacity = '0.7';
        el.style.filter = 'brightness(1.1)';
        
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.style.opacity = '1';
          el.style.filter = 'brightness(1)';
          
          setTimeout(() => {
            el.style.transition = 'all 0.3s ease';
            el.style.transform = '';
            el.style.filter = '';
          }, 300);
        }, 200);
      }
    };

    window.addEventListener('genzite:grapes:zoom-in', handleZoomIn);
    window.addEventListener('genzite:grapes:zoom-out', handleZoomOut);
    window.addEventListener('genzite:grapes:zoom-fit', handleZoomFit);
    window.addEventListener('genzite:grapes:zoom-set', handleZoomSet);
    window.addEventListener('genzite:grapes:pan:toggle', handlePanToggle);
    window.addEventListener('genzite:grapes:reload', handleReload);

    return () => {
      window.removeEventListener('genzite:grapes:zoom-in', handleZoomIn);
      window.removeEventListener('genzite:grapes:zoom-out', handleZoomOut);
      window.removeEventListener('genzite:grapes:zoom-fit', handleZoomFit);
      window.removeEventListener('genzite:grapes:zoom-set', handleZoomSet);
      window.removeEventListener('genzite:grapes:pan:toggle', handlePanToggle);
      window.removeEventListener('genzite:grapes:reload', handleReload);
    };
  }, []);

  useEffect(() => {
    const el = canvasCenterRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); 
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => {
          const newZ = Math.min(2, Math.max(0.1, parseFloat((z + delta).toFixed(2)))); // Max 200%
          window.dispatchEvent(new CustomEvent('genzite:grapes:zoom:update', { detail: { zoom: newZ * 100 } }));
          return newZ;
        });
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'h') {
        setIsPanActive(true);
        window.dispatchEvent(new CustomEvent('genzite:grapes:pan:update', { detail: { active: true } }));
      }
      if (e.key.toLowerCase() === 'v') {
        setIsPanActive(false);
        window.dispatchEvent(new CustomEvent('genzite:grapes:pan:update', { detail: { active: false } }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey || e.button === 2 || (isPanActive && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    }
  }, [pan.x, pan.y, isPanActive]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && panStart.current) {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.mx),
        y: panStart.current.py + (e.clientY - panStart.current.my),
      });
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  useEffect(() => {
    (window as any).__currentCanvasDevice = device;
    if (typeof (window as any).__updateGrapesIframeHeight === 'function') {
      (window as any).__updateGrapesIframeHeight();
    }
  }, [device]);

  // Fetch site info
  const { data: site } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId
  });

  // Fetch pages to get the first page or active page
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId
  });

  const activePage = pageId ? pages?.find(p => p.id === pageId) : pages?.[0];

  // Fetch widgets for active page
  const { data: widgets, isLoading: widgetsLoading } = useQuery({
    queryKey: ['widgets', activePage?.id],
    queryFn: () => fetchWidgetsApi(activePage!.id),
    enabled: !!activePage?.id
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedWidgets: Partial<Widget>[]) => {
      if (!activePage?.id) throw new Error('No active page');
      return replaceWidgetsApi(activePage.id, updatedWidgets as any);
    },
    onSuccess: () => {
      message.success('Changes saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['widgets', activePage?.id] });
    },
    onError: () => {
      message.error('Error saving changes!');
    }
  });

  const handleSave = () => {
    if (!editorRef.current || !activePage?.id) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    // Find GRAPESJS widget and update it
    const grapesWidget = widgets?.find(w => w.type === 'GRAPESJS');
    if (!grapesWidget) {
      message.warning('Could not find GrapesJS page to save!');
      return;
    }

    const updatedWidget = {
      ...grapesWidget,
      contentConfig: {
        ...(grapesWidget.contentConfig || {}),
        html,
        css
      }
    };

    const newWidgets = widgets?.map(w => w.id === grapesWidget.id ? updatedWidget : w) || [];
    saveMutation.mutate(newWidgets);
  };

  const grapesWidget = widgets?.find(w => w.type === 'GRAPESJS');
  const isLoading = pagesLoading || widgetsLoading;

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 390;
      case 'tablet': return 768;
      case 'desktop': return 1440;
      case 'full': return 1440;
    }
  };

  const getHeight = () => {
    switch (device) {
      case 'mobile': return 844;
      case 'tablet': return 1024;
      case 'desktop': return 900;
      case 'full': return 'auto';
    }
  };

  return (
    <div className="canvas-builder" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#07090f',
      overflow: 'hidden'
    }}>
      <EditTopBar 
        device={device}
        setDevice={setDevice}
        siteName={site?.name || 'Untitled Project'}
        leftPanelOpen={leftPanelOpen}
        setLeftPanelOpen={setLeftPanelOpen}
        rightPanelOpen={rightPanelOpen}
        setRightPanelOpen={setRightPanelOpen}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
        dragMode={dragMode}
        onToggleDragMode={(mode) => {
          setDragMode(mode);
          editorRef.current?.setDragMode(mode);
        }}
        siteId={siteId}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <EditLeftPanel isOpen={leftPanelOpen} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
           {/* Center Area */}
           <div 
              ref={canvasCenterRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => { e.preventDefault(); handleMouseDown(e); }} 
              style={{
                flex: 1,
                display: 'flex',
                padding: 0,
                overflow: 'hidden',
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                cursor: isPanning ? 'grabbing' : isPanActive ? 'grab' : 'default',
             }}>
              {isLoading ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" />
                </div>
              ) : grapesWidget ? (
                <div
                  className="canvas-viewport"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '50% 50%',
                    position: 'absolute',
                    left: 0, top: 0, right: 0, bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: (isPanActive || isPanning) ? 'none' : 'auto',
                  }}
                >
                  <div 
                    id="edit-viewer-canvas-wrapper"
                    style={{ 
                      width: getWidth(), 
                      maxWidth: device === 'full' ? '100%' : getWidth(),
                      height: getHeight(),
                      maxHeight: device === 'full' ? 'none' : getHeight(),
                      overflow: 'hidden',
                      background: '#fff',
                      border: device !== 'full' ? '6px solid rgba(148, 163, 184, 0.4)' : 'none',
                      boxShadow: device !== 'full' ? `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 20px ${(site?.settings as any)?.themeColor || '#06B6D4'}33` : 'none',
                      borderRadius: device !== 'full' ? 24 : 0,
                      transition: 'all 0.3s ease',
                      flexShrink: 0
                  }}>
                    <GrapesEditor 
                      key={`grapes-${reloadKey}`}
                      ref={editorRef} 
                      htmlContent={grapesWidget.contentConfig?.html || ''} 
                      cssContent={grapesWidget.contentConfig?.css || ''}
                      initialDragMode={dragMode}
                      canvasDevice={device}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ color: '#fff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 16 }}>Builder Mode</h2>
                    <p style={{ color: '#94a3b8' }}>This page does not use GrapesJS engine. Please use standard drag-and-drop mode.</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        <EditRightPanel isOpen={rightPanelOpen} />
      </div>
    </div>
  );
};

export default EditViewer;
