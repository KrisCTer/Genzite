import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Monitor } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWidgetsApi } from '../../../api/sites';
import WidgetRenderer from './WidgetRenderer';
import GrapesEditor from './GrapesEditor';

interface CanvasWidget {
  _id: string;
  type: string;
  sortOrder: number;
  contentConfig: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
}

const WIDGET_DEFAULTS: Record<string, { w: number; h: number }> = {
  HEADER: { w: 1440, h: 72 },
  HERO: { w: 1440, h: 480 },
  TEXT: { w: 760, h: 200 },
  TEXTCONTENT: { w: 760, h: 200 },
  FEATURELIST: { w: 1440, h: 320 },
  IMAGEGALLERY: { w: 1440, h: 360 },
  TESTIMONIAL: { w: 1440, h: 300 },
  STATS: { w: 1440, h: 200 },
  CTA: { w: 1440, h: 240 },
  FOOTER: { w: 1440, h: 120 },
  GRAPESJS: { w: 1440, h: 1000 },
};

interface CanvasPageFrameProps {
  pageId: string;
  pageTitle: string;
  siteName?: string;
  globalSelectedId: string | null;
  onSelectWidget: (id: string | null) => void;
  onUpdateWidget?: (widget: CanvasWidget | null) => void;
  activeTool?: string;
  canvasDevice?: 'mobile' | 'tablet' | 'desktop' | 'full';
}

const CanvasPageFrame: React.FC<CanvasPageFrameProps> = ({
  pageId,
  pageTitle,
  siteName,
  globalSelectedId,
  onSelectWidget,
  onUpdateWidget,
  activeTool,
  canvasDevice = 'full'
}) => {
  const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
  const [past, setPast] = useState<CanvasWidget[][]>([]);
  const [future, setFuture] = useState<CanvasWidget[][]>([]);
  const [grapesHeight, setGrapesHeight] = useState(1000);

  useEffect(() => {
    const handleHeight = (e: any) => setGrapesHeight(e.detail);
    window.addEventListener('grapes:content:height', handleHeight);
    return () => window.removeEventListener('grapes:content:height', handleHeight);
  }, []);

  const { data: dbWidgets, isLoading } = useQuery({
    queryKey: ['page-widgets', pageId],
    queryFn: () => fetchWidgetsApi(pageId),
    retry: 1,
  });

  useEffect(() => {
    if (dbWidgets) {
      const sorted = [...dbWidgets].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      let yOffset = 0;
      const mapped: CanvasWidget[] = sorted.map((w: any, i: number) => {
        const defaults = WIDGET_DEFAULTS[w.type?.toUpperCase()] || { w: 760, h: 200 };
        const geom = w.contentConfig?.geometry || {};
        const isGrapes = w.type === 'GRAPESJS';
        const widget: CanvasWidget = {
          ...w,
          _id: `widget-${pageId}-${i}-${Date.now()}`,
          x: geom.x ?? 0,
          y: geom.y ?? yOffset,
          width: isGrapes ? Math.max(geom.width ?? defaults.w, 1440) : (geom.width ?? defaults.w),
          height: isGrapes ? Math.max(geom.height ?? defaults.h, 1000) : (geom.height ?? defaults.h),
        };
        if (geom.y === undefined) yOffset += defaults.h;
        return widget;
      });
      setWidgets(mapped);
      setPast([]);
      setFuture([]);
    }
  }, [dbWidgets, pageId]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('genzite:history:state', {
      detail: { pageId, canUndo: past.length > 0, canRedo: future.length > 0 }
    }));
  }, [past.length, future.length, pageId]);

  useEffect(() => {
    const handleUndo = (e: any) => {
      if (e.detail?.pageId !== pageId) return;
      setPast(p => {
        if (p.length === 0) return p;
        const newPast = [...p];
        const previous = newPast.pop()!;
        setWidgets(current => {
          setFuture(f => [current, ...f]);
          return previous;
        });
        return newPast;
      });
    };

    const handleRedo = (e: any) => {
      if (e.detail?.pageId !== pageId) return;
      setFuture(f => {
        if (f.length === 0) return f;
        const newFuture = [...f];
        const next = newFuture.shift()!;
        setWidgets(current => {
          setPast(p => [...p, current]);
          return next;
        });
        return newFuture;
      });
    };

    window.addEventListener('genzite:undo', handleUndo);
    window.addEventListener('genzite:redo', handleRedo);
    return () => {
      window.removeEventListener('genzite:undo', handleUndo);
      window.removeEventListener('genzite:redo', handleRedo);
    };
  }, [pageId]);

  const updateWidgetGeometry = (id: string, x: number, y: number, width: number, height: number) => {
    setWidgets(prev => {
      const next = prev.map(w => w._id === id ? { ...w, x, y, width, height } : w);
      setPast(p => [...p, prev].slice(-50));
      setFuture([]);
      return next;
    });
    const updated = widgets.find(w => w._id === id);
    if (updated && onUpdateWidget) {
      onUpdateWidget({ ...updated, x, y, width, height });
    }
  };
  const contentHeight = Math.max(600, widgets.reduce((max, w) => Math.max(max, w.y + w.height), 600));

  const getDeviceDimensions = () => {
    switch (canvasDevice) {
      case 'mobile': return { width: 390, height: 884 };
      case 'tablet': return { width: 768, height: 1024 };
      case 'desktop': return { width: 1280, height: 1024 };
      case 'full': 
      default: return { width: 1440, height: Math.max(contentHeight, grapesHeight) };
    }
  };

  const { width: frameWidth, height: frameHeight } = getDeviceDimensions();

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: frameWidth, 
        height: frameHeight, 
        transition: 'width 0.3s ease, height 0.3s ease'
      }}
      onPointerDown={(e) => {
        if (e.button === 0 && activeTool === 'select') {
          const firstWidget = widgets[0];
          if (firstWidget) {
            onSelectWidget(firstWidget._id);
            onUpdateWidget(firstWidget);
          }
        }
      }}
    >
      {/* Frame Header (Design System Style) */}
      <div className="canvas-page-drag-handle" style={{ 
        position: 'absolute', 
        top: -50, 
        left: 0, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10,
        cursor: activeTool === 'select' ? 'pointer' : 'grab'
      }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
          <Monitor size={16} color="#fff" />
        </div>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
          {siteName || 'My Site'}
        </span>
        <span style={{ fontSize: 12, background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '4px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.3)', marginLeft: 8, whiteSpace: 'nowrap' }}>
          {pageTitle || 'Home'}
        </span>
      </div>

      {/* Main Content Container with Dynamic Border */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: '#111827', 
        border: globalSelectedId && widgets.some(w => w._id === globalSelectedId) ? '3px solid #8b5cf6' : '3px solid #ffffff',
        borderRadius: 12, 
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
      }}>
        {isLoading && <div style={{ color: '#111827', padding: 20 }}>Loading...</div>}

      {widgets.map((widget) => (
        <Rnd
          key={widget._id}
          className="canvas-widget-rnd"
          position={{ x: widget.x, y: widget.y }}
          size={{ width: widget.width, height: (canvasDevice === 'full' && widget.type === 'GRAPESJS') ? Math.max(widget.height, grapesHeight) : widget.height }}
          onDragStop={(_e, d) => updateWidgetGeometry(widget._id, d.x, d.y, widget.width, widget.height)}
          onResizeStop={(_e, _dir, ref, _delta, pos) => updateWidgetGeometry(widget._id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)}
          minWidth={120} minHeight={60} bounds="parent" dragGrid={[10, 10]} resizeGrid={[10, 10]} cancel=".canvas-widget-delete"
          dragHandleClassName="canvas-page-drag-handle"
          enableResizing={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
          resizeHandleStyles={{
            right: { width: 4, right: -2, background: globalSelectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
            bottom: { height: 4, bottom: -2, background: globalSelectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
          }}
        >
          <div
            className={`canvas-widget-frame ${globalSelectedId === widget._id ? 'selected' : ''}`}
            style={{ position: 'relative', width: '100%', height: '100%' }}
          >
            <span className="canvas-widget-label">{widget.type}</span>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
              
              {/* Interaction Overlay: Captures drags and clicks, forwards scrolls */}
              <div 
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, cursor: 'grab' }}
                onPointerDown={(e) => {
                  // Allow bubbling so DraggableBoard can drag the page
                  if (e.button === 0 && activeTool === 'select') {
                    onSelectWidget(widget._id); 
                    onUpdateWidget(widget);
                  }
                }}
                onWheel={(e) => {
                  e.preventDefault(); // Prevent default page scroll
                  const iframe = e.currentTarget.parentElement?.querySelector('iframe');
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.scrollBy({ top: e.deltaY, behavior: 'auto' });
                  }
                }}
              />

              {widget.type === 'GRAPESJS' ? (
                <GrapesEditor htmlContent={widget.contentConfig.html} readOnly={globalSelectedId !== widget._id} />
              ) : (
                <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={globalSelectedId === widget._id} />
              )}
            </div>
          </div>
        </Rnd>
      ))}
      </div>
    </div>
  );
};

export default CanvasPageFrame;
