import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { message } from 'antd';
import { Monitor } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWidgetsApi, replaceWidgetsApi } from '../../../api/sites';
import WidgetRenderer from './WidgetRenderer';

import { renderToStaticMarkup } from 'react-dom/server';

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
  const queryClient = useQueryClient();
  const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
  const [past, setPast] = useState<CanvasWidget[][]>([]);
  const [future, setFuture] = useState<CanvasWidget[][]>([]);
  // @ts-ignore
  const [hasUnsaved, setHasUnsaved] = useState(false);

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
      setHasUnsaved(false);
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
        setHasUnsaved(true);
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
        setHasUnsaved(true);
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

  const saveMutation = useMutation({
    mutationFn: (payload: any[]) => replaceWidgetsApi(pageId, payload),
    onSuccess: () => {
      message.success(`${pageTitle} saved!`);
      setHasUnsaved(false);
      queryClient.invalidateQueries({ queryKey: ['page-widgets', pageId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to save');
    },
  });

  // @ts-ignore
  const handleSave = () => {
    const sorted = [...widgets].sort((a, b) => a.y - b.y);
    const payload = sorted.map((w, i) => {
      const { _id, x, y, width, height, contentConfig, ...rest } = w;
      return { 
        ...rest, 
        contentConfig: {
          ...(contentConfig || {}),
          geometry: { x, y, width, height }
        },
        sortOrder: i + 1 
      };
    });
    saveMutation.mutate(payload);
  };

  // @ts-ignore
  const handleExportHTML = () => {
    try {
      const sorted = [...widgets].sort((a, b) => a.y - b.y);
      const htmlContent = sorted.map(widget => {
        const geom = widget.contentConfig?.geometry || { x: widget.x, y: widget.y, width: widget.width, height: widget.height };
        return renderToStaticMarkup(
          <div key={widget._id} style={{ 
            position: 'absolute',
            left: geom.x,
            top: geom.y,
            width: geom.width,
            height: geom.height
          }}>
            <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={false} />
          </div>
        );
      }).join('');

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    :root { --color-bg-app: #0B0F19; --color-text-primary: #FFFFFF; --color-text-secondary: #94A3B8; --color-text-muted: #475569; --color-accent: #06B6D4; --color-accent-hover: #0891b2; --color-accent-muted: rgba(6, 182, 212, 0.2); --color-accent-glow: rgba(6, 182, 212, 0.4); --gradient-accent: linear-gradient(135deg, #06B6D4 0%, #10B981 100%); --color-border: #1E293B; --color-border-subtle: rgba(30, 41, 59, 0.5); --gz-dark-1: #0B0F19; --gz-dark-2: #0f172a; --gz-dark-3: #111827; --gz-dark-4: #1E293B; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-full: 9999px; }
    body { margin: 0; padding: 0; background: var(--color-bg-app); color: var(--color-text-primary); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
    * { box-sizing: border-box; }
  </style>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
</head>
<body>
  <div style="position: relative; width: 1440px; margin: 0 auto; min-height: 100vh;">
    ${htmlContent}
  </div>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageTitle}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('HTML Exported Successfully!');
    } catch (e) {
      console.error(e);
      message.error('Failed to export HTML');
    }
  };

  const updateWidgetGeometry = (id: string, x: number, y: number, width: number, height: number) => {
    setWidgets(prev => {
      const next = prev.map(w => w._id === id ? { ...w, x, y, width, height } : w);
      setPast(p => [...p, prev].slice(-50));
      setFuture([]);
      return next;
    });
    setHasUnsaved(true);
    const updated = widgets.find(w => w._id === id);
    if (updated) {
      onUpdateWidget?.({ ...updated, x, y, width, height });
    }
  };

  // @ts-ignore
  const deleteWidget = (id: string) => {
    setWidgets(prev => {
      const next = prev.filter(w => w._id !== id);
      setPast(p => [...p, prev].slice(-50));
      setFuture([]);
      return next;
    });
    if (globalSelectedId === id) onSelectWidget(null);
    setHasUnsaved(true);
  };

  const computedHeight = Math.max(600, widgets.reduce((max, w) => Math.max(max, w.y + w.height), 600));

  const deviceWidth = canvasDevice === 'mobile' ? 390 : canvasDevice === 'tablet' ? 768 : canvasDevice === 'desktop' ? 1280 : 1440;
  const deviceHeight = canvasDevice === 'mobile' ? 884 : canvasDevice === 'tablet' ? 1024 : canvasDevice === 'desktop' ? 1024 : computedHeight;

  return (
    <div 
      style={{ position: 'relative', width: deviceWidth, height: deviceHeight, margin: '0 auto', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      onPointerDown={(e) => {
        if (e.button === 0 && activeTool === 'select') {
          const firstWidget = widgets[0];
          if (firstWidget) {
            onSelectWidget(firstWidget._id);
            onUpdateWidget?.(firstWidget);
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
            <Monitor size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            {siteName || 'My Site'}
          </span>
          <span style={{ fontSize: 12, background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '4px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.3)', marginLeft: 8 }}>
            {pageTitle}
          </span>
        </div>
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
          size={{ width: widget.type === 'GRAPESJS' ? deviceWidth : Math.min(widget.width, deviceWidth), height: widget.type === 'GRAPESJS' ? deviceHeight : Math.min(widget.height, deviceHeight) }}
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

            <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
              
              {/* Interaction Overlay: Captures drags and clicks, forwards scrolls */}
              <div 
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, cursor: 'grab' }}
                onPointerDown={(e) => {
                  // Allow bubbling so DraggableBoard can drag the page
                  if (e.button === 0 && activeTool === 'select') {
                    onSelectWidget(widget._id); 
                    onUpdateWidget?.(widget);
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
                <iframe
                  title={`preview-${widget._id}`}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fff' }}
                  srcDoc={`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <style>
      html, body { margin: 0; padding: 0; font-family: sans-serif; box-sizing: border-box; }
      *, *::before, *::after { box-sizing: inherit; }
      ${widget.contentConfig.css || ''}
    </style>
  </head>
  <body>
    ${widget.contentConfig.html || ''}
  </body>
</html>`}
                />
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
