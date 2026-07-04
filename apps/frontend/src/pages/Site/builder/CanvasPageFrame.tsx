import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWidgetsApi, replaceWidgetsApi } from '../../../api/sites';
import WidgetRenderer from './WidgetRenderer';
import GrapesEditor from './GrapesEditor';
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
  globalSelectedId: string | null;
  onSelectWidget: (id: string | null) => void;
  onUpdateWidget: (widget: CanvasWidget | null) => void;
}

const CanvasPageFrame: React.FC<CanvasPageFrameProps> = ({
  pageId,
  pageTitle,
  globalSelectedId,
  onSelectWidget,
  onUpdateWidget
}) => {
  const queryClient = useQueryClient();
  const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
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
      setHasUnsaved(false);
    }
  }, [dbWidgets, pageId]);

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
    setWidgets(prev => prev.map(w => w._id === id ? { ...w, x, y, width, height } : w));
    setHasUnsaved(true);
    const updated = widgets.find(w => w._id === id);
    if (updated) {
      onUpdateWidget({ ...updated, x, y, width, height });
    }
  };

  const deleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w._id !== id));
    if (globalSelectedId === id) onSelectWidget(null);
    setHasUnsaved(true);
  };

  const canvasHeight = Math.max(600, widgets.reduce((max, w) => Math.max(max, w.y + w.height), 600));

  return (
    <div style={{ position: 'relative', width: 1440, height: canvasHeight, background: '#111827', border: '2px solid #1E293B', borderRadius: 8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
      {/* Frame Header */}
      <div style={{ position: 'absolute', top: -40, left: 0, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{pageTitle}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="canvas-tool-btn" onClick={handleExportHTML} title="Export HTML">⬇</button>
          <button className={`canvas-save-btn ${hasUnsaved ? 'unsaved' : 'saved'}`} onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : hasUnsaved ? 'Publish' : 'Published'}
          </button>
        </div>
      </div>

      {isLoading && <div style={{ color: 'white', padding: 20 }}>Loading...</div>}

      {widgets.map((widget) => (
        <Rnd
          key={widget._id}
          className="canvas-widget-rnd"
          position={{ x: widget.x, y: widget.y }}
          size={{ width: widget.width, height: widget.height }}
          onDragStop={(_e, d) => updateWidgetGeometry(widget._id, d.x, d.y, widget.width, widget.height)}
          onResizeStop={(_e, _dir, ref, _delta, pos) => updateWidgetGeometry(widget._id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)}
          minWidth={120} minHeight={60} bounds="parent" dragGrid={[10, 10]} resizeGrid={[10, 10]} cancel=".canvas-widget-delete"
          dragHandleClassName={widget.type === 'GRAPESJS' ? 'canvas-widget-label' : undefined}
          enableResizing={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
          resizeHandleStyles={{
            right: { width: 4, right: -2, background: globalSelectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
            bottom: { height: 4, bottom: -2, background: globalSelectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
          }}
        >
          <div
            className={`canvas-widget-frame ${globalSelectedId === widget._id ? 'selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSelectWidget(widget._id); onUpdateWidget(widget); }}
          >
            <span className="canvas-widget-label">{widget.type}</span>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', pointerEvents: widget.type === 'GRAPESJS' ? 'auto' : 'none' }}>
              {widget.type === 'GRAPESJS' ? (
                <GrapesEditor htmlContent={widget.contentConfig.html} />
              ) : (
                <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={globalSelectedId === widget._id} />
              )}
            </div>
            <button className="canvas-widget-delete" onClick={(e) => { e.stopPropagation(); deleteWidget(widget._id); }}>
              <DeleteOutlined style={{ fontSize: 10 }} />
            </button>
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default CanvasPageFrame;
