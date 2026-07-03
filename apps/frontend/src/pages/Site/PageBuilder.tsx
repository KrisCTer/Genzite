import React, { useState, useRef, useCallback } from 'react';
import { Spin } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchPagesApi } from '../../api/sites';
import { useParams, useNavigate } from 'react-router-dom';
import DarkPropertyEditor from './builder/DarkPropertyEditor';
import AIPromptBar from './builder/AIPromptBar';
import CanvasPageFrame from './builder/CanvasPageFrame';
import './CanvasBuilder.css';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAGE_SPACING = 1640; // 1440 width + 200 gap

const PageBuilder: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWidgetObj, setSelectedWidgetObj] = useState<any | null>(null);
  
  const [zoom, setZoom] = useState(0.4); // Start zoomed out
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const { data: pages, isLoading, isError } = useQuery({
    queryKey: ['site-pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId,
    retry: 1,
  });

  const isWelcomeMode = !siteId;

  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  const resetZoom = () => { setZoom(0.4); setPan({ x: 100, y: 100 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((z + delta).toFixed(2)))));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey || e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    }
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

  const handleAIGenerated = (_jobId: string) => {
    if (!siteId) {
      navigate('/admin/site');
    }
  };

  if (isWelcomeMode) {
    return (
      <div className="canvas-builder">
        <div className="canvas-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="canvas-welcome">
            <h1 className="canvas-welcome-title">Build at the speed of AI</h1>
            <p className="canvas-welcome-subtitle">
              Describe what you want to build with AI.
            </p>
          </div>
        </div>
        <AIPromptBar onGenerated={handleAIGenerated} />
      </div>
    );
  }

  if (isLoading) return <div className="canvas-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>;
  if (isError) return <div className="canvas-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>Failed to load site.</div>;

  return (
    <div className="canvas-builder">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-left">
          <span className="canvas-page-title">✦ Infinite Canvas Builder</span>
        </div>

        <div className="canvas-toolbar-center">
          <button className="canvas-tool-btn" onClick={zoomOut} title="Zoom Out"><ZoomOutOutlined /></button>
          <span className="canvas-zoom-display">{Math.round(zoom * 100)}%</span>
          <button className="canvas-tool-btn" onClick={zoomIn} title="Zoom In"><ZoomInOutlined /></button>
          <div className="canvas-divider" />
          <button className="canvas-tool-btn" onClick={resetZoom} title="Fit to Screen"><FullscreenOutlined /></button>
        </div>

        <div className="canvas-toolbar-right">
          <button className="canvas-tool-btn" onClick={() => window.open(`https://${siteId}.genzite.com`, '_blank')} title="View Live"><GlobalOutlined /></button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="canvas-body">
        {/* Left: Component Library */}
        <div className="canvas-sidebar-left">
          <div className="canvas-sidebar-section-title">Instructions</div>
          <p style={{ color: 'var(--color-text-secondary)', padding: '16px', fontSize: '14px', lineHeight: 1.6 }}>
            Use the <b>AI Prompt Bar</b> below to add new pages or generate components.<br /><br />
            Hold <b>Alt/Option</b> or <b>Middle Mouse</b> and drag to pan around the infinite canvas.<br /><br />
            Hold <b>Ctrl/Cmd</b> and scroll to zoom in and out.
          </p>
        </div>

        {/* Center: Infinite Canvas */}
        <div
          className="canvas-center"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => { e.preventDefault(); handleMouseDown(e); }} // Right click pan
          style={{ cursor: isPanning ? 'grabbing' : 'default', background: '#0B0F19' }}
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('canvas-center') ||
                (e.target as HTMLElement).classList.contains('canvas-viewport')) {
              setSelectedId(null);
              setSelectedWidgetObj(null);
            }
          }}
        >
          {/* Viewport with zoom + pan transform */}
          <div
            className="canvas-viewport"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              width: 10000, height: 10000 // Very large logical space
            }}
          >
            {(pages || []).map((page: any, index: number) => (
              <div 
                key={page.id} 
                style={{ 
                  position: 'absolute', 
                  left: index * PAGE_SPACING, 
                  top: 100 
                }}
              >
                <CanvasPageFrame
                  pageId={page.id}
                  pageTitle={page.title}
                  globalSelectedId={selectedId}
                  onSelectWidget={setSelectedId}
                  onUpdateWidget={setSelectedWidgetObj}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Property Editor */}
        <div className="canvas-sidebar-right">
          <DarkPropertyEditor
            widget={selectedWidgetObj}
            onChange={() => {}} // Config change requires lifting state up or handling in CanvasPageFrame. Since this is an MVP of infinite canvas, we skip deep property editing here or it will require more refactoring.
            onSizeChange={() => {}} 
          />
        </div>
      </div>

      <AIPromptBar compact onGenerated={handleAIGenerated} siteId={siteId} />
    </div>
  );
};

export default PageBuilder;
