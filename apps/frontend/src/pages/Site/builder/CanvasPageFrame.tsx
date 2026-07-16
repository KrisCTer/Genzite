import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWidgetsApi } from '../../../api/sites';
import WidgetRenderer from './WidgetRenderer';
import GrapesIframe from '../../../components/GrapesIframe';

interface CanvasWidget {
  _id: string;
  id?: string;
  type: string;
  sortOrder: number;
  contentConfig: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
}

const WIDGET_DEFAULTS: Record<string, { w: number; h: number }> = {
  HEADER: { w: 1440, h: 80 },
  NAVBAR: { w: 1440, h: 80 },
  TOPBAR: { w: 1440, h: 80 },
  NAV: { w: 1440, h: 80 },
  HERO: { w: 1440, h: 560 },
  HERO_SECTION: { w: 1440, h: 560 },
  PRODUCT_GRID: { w: 1440, h: 720 },
  PRODUCTGRID: { w: 1440, h: 720 },
  FEATURES: { w: 1440, h: 480 },
  FEATURELIST: { w: 1440, h: 480 },
  TESTIMONIAL: { w: 1440, h: 360 },
  STATS: { w: 1440, h: 240 },
  PRICING: { w: 1440, h: 560 },
  FAQ: { w: 1440, h: 400 },
  CONTACT: { w: 1440, h: 500 },
  FORM: { w: 1440, h: 420 },
  CTA: { w: 1440, h: 300 },
  FOOTER: { w: 1440, h: 160 },
  IMAGEGALLERY: { w: 1440, h: 400 },
  IMAGE: { w: 1440, h: 400 },
  IMAGE_MEDIA: { w: 1440, h: 560 },
  CUSTOM_HTML: { w: 1440, h: 560 },
  DYNAMIC_SECTION: { w: 1440, h: 560 },
  STITCH_SECTION: { w: 1440, h: 560 },
  TEXT: { w: 1440, h: 240 },
  TEXTCONTENT: { w: 1440, h: 240 },
  CART: { w: 1440, h: 500 },
  CHECKOUT: { w: 1440, h: 600 },
  SEARCH: { w: 1440, h: 300 },
  ORDER_TABLE: { w: 1440, h: 450 },
  ADMIN_PANEL: { w: 1440, h: 600 },
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
  isStarred?: boolean;
  onToggleStar?: () => void;
  onEditPageSettings?: () => void;
}

/**
 * Overlay div for each widget — handles pointer and wheel events.
 * Uses native addEventListener with { passive: false } so that
 * preventDefault() works correctly for forwarding scroll to iframes.
 */
const WidgetOverlay: React.FC<{
  activeTool?: string;
  isEditMode: boolean;
  widget: CanvasWidget;
  pageId: string;
  onSelectWidget: (id: string | null) => void;
  onUpdateWidget?: (widget: CanvasWidget | null) => void;
  onToggleStar?: () => void;
}> = ({ activeTool, isEditMode, widget, pageId, onSelectWidget, onUpdateWidget, onToggleStar }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const iframe = el.parentElement?.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0 && activeTool === 'star') {
      e.stopPropagation();
      onToggleStar?.();
      return;
    }
    if (e.button === 0 && activeTool === 'select') {
      if (isEditMode) {
        e.stopPropagation();
        onSelectWidget(widget._id);
        onUpdateWidget?.(widget);
      } else {
        onSelectWidget(pageId);
      }
    }
  }, [activeTool, isEditMode, widget, pageId, onSelectWidget, onUpdateWidget, onToggleStar]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
        cursor: activeTool === 'pan' ? 'grab'
          : (activeTool === 'frame' || activeTool === 'draw') ? 'crosshair'
          : activeTool === 'star' ? 'cell'
          : (isEditMode ? 'move' : 'pointer'),
      }}
      onPointerDown={handlePointerDown}
    />
  );
};

const CanvasPageFrame: React.FC<CanvasPageFrameProps> = ({
  pageId,
  pageTitle,
  siteName,
  globalSelectedId,
  onSelectWidget,
  onUpdateWidget,
  activeTool,
  canvasDevice = 'full',
  isStarred = false,
  onToggleStar,
  onEditPageSettings,
}) => {
  const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
  const [past, setPast] = useState<CanvasWidget[][]>([]);
  const [future, setFuture] = useState<CanvasWidget[][]>([]);
  const [iframeHeights, setIframeHeights] = useState<Record<string, number>>({});

  // Listen for iframe height reports from GRAPESJS content iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'GRAPES_CONTENT_HEIGHT' && e.data.widgetId && e.data.height) {
        setIframeHeights(prev => ({ ...prev, [e.data.widgetId]: e.data.height }));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
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
        const defaults = WIDGET_DEFAULTS[w.type?.toUpperCase()] || { w: 1440, h: 500 };
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
    // Dynamically inject Tailwind CDN so that AI-generated classes render pixel-perfect identical to Live/Preview views
    if (!document.querySelector('script#tailwind-cdn-runtime')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn-runtime';
      script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
      document.head.appendChild(script);
    }
  }, []);

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
    if (updated) {
      onUpdateWidget?.({ ...updated, x, y, width, height });
    }
  };

  const isEditMode = window.location.pathname.includes('/edit/');
  const computedHeight = Math.max(800, widgets.reduce((max, w) => Math.max(max, (w.y || 0) + (w.height || 400)), 800));

  const hasGrapes = widgets.some(w => w.type === 'GRAPESJS');
  const deviceWidth = canvasDevice === 'mobile' ? 390 : canvasDevice === 'tablet' ? 768 : canvasDevice === 'desktop' ? 1440 : 1440;
  const fixedViewportHeight = canvasDevice === 'mobile' ? 844 : canvasDevice === 'tablet' ? 1024 : 900;
  const isFullUnrollMode = canvasDevice === 'full';
  const grapesWidget = widgets.filter(w => w.type === 'GRAPESJS').slice(-1)[0];
  const measuredHeight = grapesWidget ? (iframeHeights[grapesWidget.id || grapesWidget._id] || 0) : 0;
  const fullGrapesHeight = measuredHeight > 0 ? measuredHeight : fixedViewportHeight;
  const deviceHeight = isFullUnrollMode
    ? (hasGrapes ? fullGrapesHeight : Math.max(computedHeight, 900))
    : fixedViewportHeight;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('genzite:page:dimensions', {
      detail: { pageId, width: deviceWidth, height: Math.round(deviceHeight) }
    }));
  }, [pageId, deviceWidth, deviceHeight]);

  return (

    <div 
      style={{ position: 'relative', width: deviceWidth, height: deviceHeight, minHeight: 800, margin: '0 auto', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      onPointerDown={(e) => {
        if (e.button === 0 && !isEditMode) {
          if (activeTool === 'select') {
            onSelectWidget(pageId);
          } else if (activeTool === 'tag') {
            e.stopPropagation();
            onEditPageSettings?.();
          }
        }
      }}
    >
      {/* Frame Header (Browser Tab Style) */}
      <div className="canvas-page-drag-handle" style={{ 
        position: 'absolute', 
        top: -48, 
        left: 0, 
        width: '100%', 
        height: 40, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        color: '#f8fafc', 
        fontFamily: 'Inter, sans-serif' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
            {canvasDevice === 'mobile' ? <Smartphone size={16} color="#38bdf8" /> : canvasDevice === 'tablet' ? <Tablet size={16} color="#38bdf8" /> : <Monitor size={16} color="#fff" />}
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            {siteName || 'My Site'}
          </span>
          <span 
            style={{ 
              fontSize: 12, 
              background: 'rgba(99, 102, 241, 0.2)', 
              color: '#818CF8', 
              padding: '4px 10px', 
              borderRadius: 999, 
              fontWeight: 600, 
              border: '1px solid rgba(99, 102, 241, 0.3)', 
              marginLeft: 8,
            }}
          >
            {pageTitle}
          </span>
          {isStarred && (
            <span 
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar?.();
              }}
              style={{
                fontSize: 12,
                background: 'rgba(234, 179, 8, 0.2)',
                color: '#EAB308',
                padding: '4px 12px',
                borderRadius: 999,
                fontWeight: 700,
                border: '1px solid rgba(234, 179, 8, 0.4)',
                marginLeft: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 0 16px rgba(234, 179, 8, 0.35)',
                cursor: 'pointer'
              }}
              title="Starred Page ⭐ (Click to remove star)"
            >
              ⭐ Starred
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ 
            fontSize: 12, 
            background: 'rgba(30, 41, 59, 0.8)', 
            color: '#cbd5e1', 
            padding: '4px 12px', 
            borderRadius: 999, 
            fontWeight: 500, 
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {canvasDevice === 'mobile' && <Smartphone size={13} color="#38bdf8" />}
            {canvasDevice === 'tablet' && <Tablet size={13} color="#38bdf8" />}
            {(canvasDevice === 'desktop' || canvasDevice === 'full' || !canvasDevice) && <Monitor size={13} color="#94a3b8" />}
            <span style={{ fontFamily: 'Geist Mono, monospace', letterSpacing: '0.02em' }}>
              {deviceWidth} × {Math.round(deviceHeight)}px
            </span>
            <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginLeft: 2 }}>
              {canvasDevice === 'mobile' ? 'Mobile' : canvasDevice === 'tablet' ? 'Tablet' : 'Desktop'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Content Container with Dynamic Border matching Preview card exact style */}
      <div id="canvas-page-main-wrapper" style={{ 
        width: '100%', 
        height: deviceHeight,
        minHeight: isFullUnrollMode ? Math.max(computedHeight, 800) : deviceHeight,
        background: '#ffffff', 
        border: (!isEditMode && (globalSelectedId === pageId || globalSelectedId?.includes(pageId) || (globalSelectedId && widgets.some(w => w._id === globalSelectedId)))) ? '6px solid #8b5cf6' : '6px solid rgba(148, 163, 184, 0.4)',
        borderRadius: 24, 
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
      }}>
        {isLoading && <div style={{ color: '#111827', padding: 20 }}>Loading...</div>}

        {/* If GRAPESJS widget exists, only show the latest one (contains full page HTML) */}
        {(() => {
          const grapesWidgets = widgets.filter(w => w.type === 'GRAPESJS');
          const widgetsToRender = grapesWidgets.length > 0
            ? [grapesWidgets[grapesWidgets.length - 1]]
            : widgets;
          return widgetsToRender;
        })().map((widget) => {
          const isGrapesItem = widget.type === 'GRAPESJS';
          return (
            <Rnd
              key={widget._id}
              className="canvas-widget-rnd"
              position={{ x: widget.x || 0, y: widget.y || 0 }}
              size={{ 
                width: isGrapesItem ? deviceWidth : Math.min(widget.width || deviceWidth, deviceWidth), 
                height: isGrapesItem ? deviceHeight : (widget.height || 'auto') 
              }}
              onDragStop={(_e, d) => updateWidgetGeometry(widget._id, d.x, d.y, widget.width, widget.height)}
              onResizeStop={(_e, _dir, ref, _delta, pos) => updateWidgetGeometry(widget._id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)}
              minWidth={120} minHeight={60} bounds="parent" dragGrid={[10, 10]} resizeGrid={[10, 10]} cancel=".canvas-widget-delete"
              dragHandleClassName={!isEditMode ? "canvas-page-drag-handle" : undefined}
              disableDragging={!isEditMode}
              enableResizing={isEditMode ? { top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true } : false}
              resizeHandleStyles={{
                right: { width: 4, right: -2, background: globalSelectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
                bottom: { height: 4, bottom: -2, background: globalSelectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
              }}
            >
              <div
                className={`canvas-widget-frame ${globalSelectedId === widget._id ? 'selected' : ''}`}
                style={{ position: 'relative', width: '100%', height: isGrapesItem ? deviceHeight : '100%' }}
              >
                <div style={{ width: '100%', height: '100%', overflow: isGrapesItem ? 'hidden' : 'hidden', position: 'relative' }}>
                  {/* Overlay div — wheel event handled natively via ref to avoid passive listener issue */}
                  <WidgetOverlay
                    activeTool={activeTool}
                    isEditMode={isEditMode}
                    widget={widget}
                    pageId={pageId}
                    onSelectWidget={onSelectWidget}
                    onUpdateWidget={onUpdateWidget}
                    onToggleStar={onToggleStar}
                  />

                  {isGrapesItem ? (
                    <GrapesIframe
                      html={widget.contentConfig.html || ''}
                      css={widget.contentConfig.css || ''}
                      height={isFullUnrollMode ? fullGrapesHeight : deviceHeight}
                      widgetId={widget.id || widget._id}
                      onHeightChange={(h) => setIframeHeights(prev => ({ ...prev, [widget.id || widget._id]: h }))}
                      title={`canvas-${widget._id}`}
                      style={{ overflowY: isFullUnrollMode ? 'auto' : 'scroll' }}
                    />
                  ) : (
                    <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={globalSelectedId === widget._id} />
                  )}
                </div>
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default CanvasPageFrame;
