import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { message, Spin } from 'antd';
import {
  SaveOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DeleteOutlined,
  GlobalOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWidgetsApi, replaceWidgetsApi } from '../../api/sites';
import { useParams, useNavigate } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import WidgetRenderer from './builder/WidgetRenderer';
import DarkPropertyEditor from './builder/DarkPropertyEditor';
import AIPromptBar from './builder/AIPromptBar';
import './CanvasBuilder.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const CANVAS_WIDTH = 1440;  // px — full page width

// Widget default sizes (width x height)
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
};

// Widget library items
const WIDGET_LIBRARY = [
  { type: 'HEADER', label: 'Header', icon: '⬛' },
  { type: 'HERO', label: 'Hero', icon: '🌄' },
  { type: 'TEXT', label: 'Text', icon: '📝' },
  { type: 'FEATURELIST', label: 'Features', icon: '⭐' },
  { type: 'IMAGEGALLERY', label: 'Gallery', icon: '🖼️' },
  { type: 'TESTIMONIAL', label: 'Testimonial', icon: '💬' },
  { type: 'STATS', label: 'Stats', icon: '📊' },
  { type: 'CTA', label: 'CTA', icon: '🚀' },
  { type: 'FOOTER', label: 'Footer', icon: '🔽' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CanvasWidget {
  _id: string;
  type: string;
  sortOrder: number;
  contentConfig: Record<string, any>;
  // Canvas position & size (stored client-side only; mapped to sortOrder on save)
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Main Component ────────────────────────────────────────────────────────────

const PageBuilder: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [widgets, setWidgets] = useState<CanvasWidget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  // Whether to show the welcome/AI-generation screen (no pageId or no widgets)
  const isWelcomeMode = !pageId;

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const { data: dbWidgets, isLoading, isError } = useQuery({
    queryKey: ['page-widgets', pageId],
    queryFn: () => fetchWidgetsApi(pageId!),
    enabled: !!pageId,
    retry: 1,
  });

  // Map DB widgets to canvas positions (stack vertically by sortOrder)
  useEffect(() => {
    if (dbWidgets) {
      const sorted = [...dbWidgets].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      let yOffset = 0;
      const mapped: CanvasWidget[] = sorted.map((w: any, i: number) => {
        const defaults = WIDGET_DEFAULTS[w.type?.toUpperCase()] || { w: 760, h: 200 };
        const geom = w.contentConfig?.geometry || {};
        const widget: CanvasWidget = {
          ...w,
          _id: `widget-${i}-${Date.now()}`,
          x: geom.x ?? 0,
          y: geom.y ?? yOffset,
          width: geom.width ?? defaults.w,
          height: geom.height ?? defaults.h,
        };
        // Only increment default yOffset if it wasn't saved explicitly
        if (geom.y === undefined) {
          yOffset += defaults.h;
        }
        return widget;
      });
      setWidgets(mapped);
      setHasUnsaved(false);
    }
  }, [dbWidgets]);

  // ─── Save ───────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (payload: any[]) => replaceWidgetsApi(pageId!, payload),
    onSuccess: () => {
      message.success('Page saved!');
      setHasUnsaved(false);
      queryClient.invalidateQueries({ queryKey: ['page-widgets', pageId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to save');
    },
  });

  const handleSave = () => {
    // Sort by Y position to determine order; strip canvas-only fields
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
            <WidgetRenderer
              type={widget.type}
              config={widget.contentConfig}
              isActive={false}
            />
          </div>
        );
      }).join('');

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Layout</title>
  <style>
    :root {
      --color-bg-app: #0B0F19;
      --color-text-primary: #FFFFFF;
      --color-text-secondary: #94A3B8;
      --color-text-muted: #475569;
      --color-accent: #06B6D4;
      --color-accent-hover: #0891b2;
      --color-accent-muted: rgba(6, 182, 212, 0.2);
      --color-accent-glow: rgba(6, 182, 212, 0.4);
      --gradient-accent: linear-gradient(135deg, #06B6D4 0%, #10B981 100%);
      --color-border: #1E293B;
      --color-border-subtle: rgba(30, 41, 59, 0.5);
      --gz-dark-1: #0B0F19;
      --gz-dark-2: #0f172a;
      --gz-dark-3: #111827;
      --gz-dark-4: #1E293B;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-full: 9999px;
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--color-bg-app);
      color: var(--color-text-primary);
      font-family: 'Inter', system-ui, sans-serif;
      overflow-x: hidden;
    }
    * {
      box-sizing: border-box;
    }
    .ant-typography {
      color: inherit;
    }
  </style>
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
      a.download = 'layout.html';
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

  // ─── Widget Operations ──────────────────────────────────────────────────────

  const addWidget = (type: string) => {
    const defaults = WIDGET_DEFAULTS[type] || { w: 760, h: 200 };
    // Find bottom of existing widgets
    const bottomY = widgets.reduce((max, w) => Math.max(max, w.y + w.height), 0);
    const newWidget: CanvasWidget = {
      _id: `widget-new-${Date.now()}`,
      type,
      sortOrder: widgets.length + 1,
      contentConfig: { title: `New ${type}`, subtitle: 'Click to edit properties.' },
      x: 0,
      y: bottomY + 16,
      width: defaults.w,
      height: defaults.h,
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedId(newWidget._id);
    setHasUnsaved(true);
  };

  const deleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w._id !== id));
    if (selectedId === id) setSelectedId(null);
    setHasUnsaved(true);
  };

  const updateWidgetConfig = (id: string, newConfig: Record<string, any>) => {
    setWidgets(prev => prev.map(w => w._id === id ? { ...w, contentConfig: newConfig } : w));
    setHasUnsaved(true);
  };

  const updateWidgetGeometry = (id: string, x: number, y: number, width: number, height: number) => {
    setWidgets(prev => prev.map(w => w._id === id ? { ...w, x, y, width, height } : w));
    setHasUnsaved(true);
  };

  // ─── Zoom Controls ──────────────────────────────────────────────────────────

  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  const resetZoom = () => { setZoom(0.7); setPan({ x: 40, y: 40 }); };

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((z + delta).toFixed(2)))));
    }
  }, []);

  // Pan with middle-click or Alt+drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan.x, pan.y]);

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

  // ─── AI Generation callback ────────────────────────────────────────────────

  const handleAIGenerated = (_jobId: string) => {
    // After AI generates a site, navigate to the site list to view it
    // (since the AI creates a whole new site with new pages)
    navigate('/admin/site');
  };

  // ─── Canvas height (dynamic) ────────────────────────────────────────────────

  const canvasHeight = Math.max(
    2000,
    widgets.reduce((max, w) => Math.max(max, w.y + w.height + 200), 2000)
  );

  const selectedWidget = widgets.find(w => w._id === selectedId) || null;

  // ─── Welcome State (Stitch-style) ──────────────────────────────────────────

  if (isWelcomeMode) {
    return (
      <div className="canvas-builder">
        <div className="canvas-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="canvas-welcome">
            <h1 className="canvas-welcome-title">
              Build at the<br />speed of AI
            </h1>
            <p className="canvas-welcome-subtitle">
              Describe your app or website and Genzite will generate it for you. Drag, drop, and customize every detail.
            </p>
          </div>
        </div>
        <AIPromptBar onGenerated={handleAIGenerated} />
      </div>
    );
  }

  // ─── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="canvas-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="canvas-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gz-error)' }}>
        Failed to load widgets.
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="canvas-builder">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-left">
          <span className="canvas-page-title">✦ Canvas Editor</span>
        </div>

        <div className="canvas-toolbar-center">
          <button className="canvas-tool-btn" onClick={zoomOut} title="Zoom Out">
            <ZoomOutOutlined />
          </button>
          <span className="canvas-zoom-display">{Math.round(zoom * 100)}%</span>
          <button className="canvas-tool-btn" onClick={zoomIn} title="Zoom In">
            <ZoomInOutlined />
          </button>
          <div className="canvas-divider" />
          <button className="canvas-tool-btn" onClick={resetZoom} title="Fit to Screen">
            <FullscreenOutlined />
          </button>
        </div>

        <div className="canvas-toolbar-right">
          <button
            className="canvas-tool-btn"
            onClick={handleExportHTML}
            title="Export HTML"
          >
            <DownloadOutlined />
          </button>
          <button
            className="canvas-tool-btn"
            onClick={() => window.open(`/live/${pageId}`, '_blank')}
            title="View Live"
          >
            <GlobalOutlined />
          </button>
          <button
            className={`canvas-save-btn ${hasUnsaved ? 'unsaved' : 'saved'}`}
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <SaveOutlined />
            {saveMutation.isPending ? 'Saving…' : hasUnsaved ? 'Publish' : 'Published'}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="canvas-body">
        {/* Left: Widget Library */}
        <div className="canvas-sidebar-left">
          <div className="canvas-sidebar-section-title">Widgets</div>
          <div className="canvas-widget-grid">
            {WIDGET_LIBRARY.map(({ type, label, icon }) => (
              <button
                key={type}
                className="canvas-widget-chip"
                onClick={() => addWidget(type)}
                title={`Add ${label}`}
              >
                <span className="canvas-widget-chip-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Infinite Canvas */}
        <div
          className="canvas-center"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isPanning ? 'grabbing' : 'default' }}
          onClick={(e) => {
            // Deselect when clicking canvas bg
            if ((e.target as HTMLElement).classList.contains('canvas-center') ||
                (e.target as HTMLElement).classList.contains('canvas-page-frame')) {
              setSelectedId(null);
            }
          }}
        >
          {/* Viewport with zoom + pan transform */}
          <div
            className="canvas-viewport"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* Page Frame */}
            <div
              className="canvas-page-frame"
              style={{ width: CANVAS_WIDTH, height: canvasHeight }}
            >
              {widgets.length === 0 && (
                <div className="canvas-empty-hint">
                  <div className="canvas-empty-icon">✦</div>
                  <div className="canvas-empty-text">
                    Add a widget from the left panel<br />to start building your page
                  </div>
                </div>
              )}

              {widgets.map((widget) => (
                <Rnd
                  key={widget._id}
                  className="canvas-widget-rnd"
                  position={{ x: widget.x, y: widget.y }}
                  size={{ width: widget.width, height: widget.height }}
                  onDragStop={(_e, d) => {
                    updateWidgetGeometry(widget._id, d.x, d.y, widget.width, widget.height);
                  }}
                  onResizeStop={(_e, _dir, ref, _delta, pos) => {
                    updateWidgetGeometry(
                      widget._id,
                      pos.x, pos.y,
                      ref.offsetWidth,
                      ref.offsetHeight
                    );
                  }}
                  minWidth={120}
                  minHeight={60}
                  bounds="parent"
                  dragGrid={[10, 10]}
                  resizeGrid={[10, 10]}
                  cancel=".canvas-widget-delete"
                  enableResizing={{
                    top: true, right: true, bottom: true, left: true,
                    topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
                  }}
                  resizeHandleStyles={{
                    right: { width: 4, right: -2, background: selectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
                    bottom: { height: 4, bottom: -2, background: selectedId === widget._id ? 'var(--color-accent)' : 'transparent' },
                  }}
                >
                  <div
                    className={`canvas-widget-frame ${selectedId === widget._id ? 'selected' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(widget._id); }}
                  >
                    <span className="canvas-widget-label">{widget.type}</span>

                    {/* Widget visual preview */}
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
                      <WidgetRenderer
                        type={widget.type}
                        config={widget.contentConfig}
                        isActive={selectedId === widget._id}
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      className="canvas-widget-delete"
                      onClick={(e) => { e.stopPropagation(); deleteWidget(widget._id); }}
                      title="Delete widget"
                    >
                      <DeleteOutlined style={{ fontSize: 10 }} />
                    </button>
                  </div>
                </Rnd>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Property Editor */}
        <div className="canvas-sidebar-right">
          <DarkPropertyEditor
            widget={selectedWidget}
            onChange={(newConfig) => { if (selectedId) updateWidgetConfig(selectedId, newConfig); }}
            onSizeChange={(w, h) => {
              if (selectedId && selectedWidget) {
                updateWidgetGeometry(selectedId, selectedWidget.x, selectedWidget.y, w, h);
              }
            }}
          />
        </div>
      </div>

      {/* ── Floating AI Prompt Bar (always visible) ─────────── */}
      <AIPromptBar compact onGenerated={handleAIGenerated} />
    </div>
  );
};

export default PageBuilder;
