import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Spin } from 'antd';
import { MobileOutlined, TabletOutlined, DesktopOutlined } from '@ant-design/icons';
import { fetchPagesApi, fetchWidgetsApi, replaceWidgetsApi, fetchSiteByIdApi, type Widget } from '../../api/sites';
import EditTopBar from './builder/EditTopBar';
import EditLeftPanel from './builder/EditLeftPanel';
import EditRightPanel from './builder/EditRightPanel';
import GrapesEditor, { type GrapesEditorRef } from './builder/GrapesEditor';
import WidgetRenderer from './builder/WidgetRenderer';
import { MediaLibraryModal } from './builder/components/MediaLibraryModal';
import { renderToStaticMarkup } from 'react-dom/server';
import './CanvasBuilder.css';

const EditViewer: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('desktop');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const dragMode = 'absolute';
  const [isPanActive, setIsPanActive] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  
  const canvasCenterRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<GrapesEditorRef>(null);
  const [grapesEditorInstance, setGrapesEditorInstance] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleInit = (e: any) => {
      if (e.detail?.editor) {
        setGrapesEditorInstance(e.detail.editor);
      }
    };
    window.addEventListener('genzite:grapes:init', handleInit);
    if (editorRef.current && typeof (editorRef.current as any).getEditor === 'function') {
      const ed = (editorRef.current as any).getEditor();
      if (ed) setGrapesEditorInstance(ed);
    }
    return () => window.removeEventListener('genzite:grapes:init', handleInit);
  }, []);

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
  const { data: site, isError: isSiteError, error: siteError } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId,
    retry: false // Don't retry on 403 or 404
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
      // Clear GrapesJS dirty flag so browser won't show "Changes may not be saved" on exit
      window.dispatchEvent(new CustomEvent('genzite:grapes:clearDirty'));
    },
    onError: (error: any) => {
      console.error('[EditViewer] Error saving changes - Full error object:', error);
      if (error.response) {
        console.error('[EditViewer] Error Response Data:', error.response.data);
        console.error('[EditViewer] Error Response Status:', error.response.status);
        message.error(`Save failed: ${error.response.data?.message || error.message}`);
      } else {
        message.error(`Error saving changes: ${error.message}`);
      }
    }
  });

  const getPageHtmlForGrapes = () => {
    const grapesWidget = widgets?.find(w => w.type === 'GRAPESJS');
    if (grapesWidget) return grapesWidget.contentConfig?.html || '';
    if (!widgets || widgets.length === 0) return '';

    return widgets.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(widget => {
      if (widget.type === 'CUSTOM_HTML' || widget.type === 'HTML') {
        return widget.contentConfig?.html || '';
      }
      return renderToStaticMarkup(
        <div id={widget.id || (widget as any)._id} data-gjs-type="default">
          <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={false} />
        </div>
      );
    }).join('\n');
  };

  const handleSave = () => {
    if (!activePage?.id) return;
    const grapesWidget = widgets?.find(w => w.type === 'GRAPESJS');
    
    if (editorRef.current) {
      const html = editorRef.current.getHtml();
      const css = editorRef.current.getCss();
      
      if (grapesWidget) {
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
      } else {
        // Convert the entire page into a single GRAPESJS widget
        const newGrapesWidget = {
          id: `w-${Date.now()}`,
          type: 'GRAPESJS',
          sortOrder: 10,
          contentConfig: {
            html,
            css
          }
        };
        saveMutation.mutate([newGrapesWidget]);
      }
    } else if (widgets) {
      saveMutation.mutate(widgets);
    }
  };

  const handleAddWidget = (type: string) => {
    if (!activePage?.id || !widgets) return;
    const newWidget: any = {
      _id: `w-${Date.now()}`,
      id: `w-${Date.now()}`,
      type: type,
      sortOrder: (widgets.length + 1) * 10,
      contentConfig: {
        title: `New ${type.replace(/_/g, ' ')}`,
        subtitle: 'Customize this section in the properties panel or prompt AI to refine it.',
      }
    };
    const updated = [...widgets, newWidget];
    setSelectedWidgetId(newWidget._id);
    saveMutation.mutate(updated);
  };

  const handleDeleteWidget = (id: string) => {
    if (!activePage?.id || !widgets) return;
    const updated = widgets.filter(w => w.id !== id && (w as any)._id !== id);
    if (selectedWidgetId === id) setSelectedWidgetId(null);
    saveMutation.mutate(updated);
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    if (!activePage?.id || !widgets) return;
    const idx = widgets.findIndex(w => w.id === id || (w as any)._id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;
    const updated = [...widgets];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((w, i) => { (w as any).sortOrder = (i + 1) * 10; });
    saveMutation.mutate(updated);
  };

  const handleUpdateWidgetConfig = (id: string, newConfig: any) => {
    if (!activePage?.id || !widgets) return;
    const updated = widgets.map(w => (w.id === id || (w as any)._id === id) ? { ...w, contentConfig: newConfig } : w);
    saveMutation.mutate(updated);
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

  if (isSiteError) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#94a3b8' }}>You do not have permission to view or edit this project.</p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>If you believe this is a mistake, please contact the project owner.</p>
      </div>
    );
  }

  return (
    <div className="canvas-builder" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
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
        siteId={siteId}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <EditLeftPanel 
          isOpen={leftPanelOpen}
          setIsOpen={setLeftPanelOpen}
          widgets={widgets || []}
          selectedId={selectedWidgetId}
          onSelectWidget={(id) => setSelectedWidgetId(id)}
          onAddWidget={handleAddWidget}
          onDeleteWidget={handleDeleteWidget}
          onMoveWidget={handleMoveWidget}
          isGrapesPage={true}
          editor={grapesEditorInstance}
        />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
           {/* Canvas Center — Figma-style artboard area */}
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
                cursor: isPanning ? 'grabbing' : isPanActive ? 'grab' : 'default',
                position: 'relative',
                // Figma/Framer-style dot grid background
                background: [
                  'radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)',
                ].join(', '),
                backgroundSize: '20px 20px',
                backgroundPosition: 'center center',
             }}>
              {isLoading ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" />
                </div>
              ) : activePage && widgets ? (
                <div
                  className="canvas-viewport"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '50% 50%',
                    position: 'absolute',
                    left: 0, top: 0, right: 0, bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                    pointerEvents: (isPanActive || isPanning) ? 'none' : 'auto',
                  }}
                >
                  {/* Page size label floating above frame */}
                  <div style={{
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(148,163,184,0.6)',
                      letterSpacing: '0.04em',
                      fontFamily: 'ui-monospace, monospace',
                      background: 'rgba(15,23,42,0.6)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(148,163,184,0.12)',
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {device === 'mobile' ? <><MobileOutlined /> 390 × 844</> : device === 'tablet' ? <><TabletOutlined /> 768 × 1024</> : <><DesktopOutlined /> 1440 × 900</>}
                        {' '}&nbsp;{'—'}&nbsp; {Math.round(zoom * 100)}%
                      </span>
                    </span>
                  </div>

                  <div 
                    id="edit-viewer-canvas-wrapper"
                    style={{ 
                      width: getWidth(), 
                      maxWidth: device === 'full' ? '100%' : getWidth(),
                      height: getHeight(),
                      maxHeight: device === 'full' ? 'none' : getHeight(),
                      overflow: 'hidden',
                      background: '#fff',
                      border: device !== 'full' ? '1.5px solid rgba(148, 163, 184, 0.25)' : 'none',
                      boxShadow: device !== 'full' ? `
                        0 0 0 1px rgba(148,163,184,0.1),
                        0 20px 60px -12px rgba(0,0,0,0.6),
                        0 0 40px ${(site?.settings as any)?.themeColor || '#06B6D4'}22
                      ` : 'none',
                      borderRadius: device !== 'full' ? 12 : 0,
                      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      flexShrink: 0,
                      position: 'relative',
                  }}>
                    <GrapesEditor 
                      key={`grapes-${reloadKey}-${activePage.id}`}
                      ref={editorRef} 
                      htmlContent={getPageHtmlForGrapes()} 
                      cssContent={grapesWidget?.contentConfig?.css || ''}
                      initialDragMode={dragMode}
                      canvasDevice={device}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ color: '#fff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 16 }}>No Page Selected</h2>
                    <p style={{ color: '#94a3b8' }}>Please select or create a page to start building.</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        <EditRightPanel 
          isOpen={rightPanelOpen}
          setIsOpen={setRightPanelOpen}
          selectedWidget={(widgets || []).find(w => w.id === selectedWidgetId || (w as any)._id === selectedWidgetId)}
          onUpdateWidgetContent={(cfg) => selectedWidgetId && handleUpdateWidgetConfig(selectedWidgetId, cfg)}
          isGrapesPage={true}
        />
        <MediaLibraryModal globalListener={true} />
      </div>
    </div>
  );
};

export default EditViewer;
