import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { fetchWidgetsPublicApi, fetchPagesApi, type Widget } from '../../api/sites';
import WidgetRenderer from '../Site/builder/WidgetRenderer';
import GrapesEditor from '../Site/builder/GrapesEditor';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CartDrawer from '../../components/CartDrawer';

interface LiveViewerProps {
  siteId?: string;
}

const LiveViewer: React.FC<LiveViewerProps> = ({ siteId: propSiteId }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!propSiteId) {
        setScale(1);
        return;
      }
      if (!containerRef.current) return;
      const rect = containerRef.current.parentElement?.getBoundingClientRect();
      const availableWidth = rect ? rect.width - 64 : window.innerWidth;
      const targetWidth = 1440;
      if (availableWidth < targetWidth) {
        setScale(availableWidth / targetWidth);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const [searchParams] = useSearchParams();
  const { pageId: paramPageId } = useParams<{ pageId: string }>();
  
  // A param is a siteId if it's NOT a UUID (page ids are UUIDs) and not a special keyword
  const isUUID = paramPageId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramPageId);
  const isParamActuallySiteId = paramPageId && !isUUID && paramPageId !== 'preview' && paramPageId !== '_';
  
  const siteId = propSiteId || searchParams.get('siteId') || (isParamActuallySiteId ? paramPageId : undefined);
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedPageId, setResolvedPageId] = useState<string | null>(searchParams.get('pageId') || (isParamActuallySiteId ? null : (paramPageId || null)));

  useEffect(() => {
    // Dynamically inject Tailwind CDN so that AI-generated classes work at runtime in Live View
    if (!document.querySelector('script#tailwind-cdn-runtime')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn-runtime';
      script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      window.parent.postMessage({
        type: 'CANVAS_MOUSE_MOVE',
        clientX: e.clientX,
        clientY: e.clientY
      }, '*');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (siteId && !resolvedPageId) {
      setLoading(true);
      fetchPagesApi(siteId)
        .then(pages => {
          if (pages && pages.length > 0) {
            const homePage = pages.find(p => p.slug === 'home' || p.slug === '/') || pages[0];
            setResolvedPageId(homePage.id);
          } else {
            setError(true);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to load site pages:', err);
          setError(true);
          setLoading(false);
        });
    }
  }, [siteId, resolvedPageId]);

  useEffect(() => {
    const targetPageId = resolvedPageId || (isParamActuallySiteId ? null : paramPageId);
    if (targetPageId) {
      setLoading(true);
      fetchWidgetsPublicApi(targetPageId)
        .then(data => {
          setWidgets(data);
          setError(false);
        })
        .catch(err => {
          console.error('Failed to load page:', err);
          setError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [resolvedPageId, paramPageId]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19' }}>
        <Result
          status="404"
          title={<span style={{ color: '#fff' }}>Page Not Found</span>}
          subTitle={<span style={{ color: '#94A3B8' }}>Sorry, something went wrong or the page does not exist.</span>}
          extra={<Link to="/admin"><Button type="primary">Back Home</Button></Link>}
        />
      </div>
    );
  }

  // Constants for default widget geometry
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

  // Map widgets to include stacking geometry
  let yOffset = 0;
  const mappedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder).map(widget => {
    const defaults = WIDGET_DEFAULTS[widget.type?.toUpperCase()] || { w: 760, h: 200 };
    const geom = widget.contentConfig?.geometry || {};
    const isGrapes = widget.type === 'GRAPESJS';
    
    const finalGeom = {
      x: geom.x ?? 0,
      y: geom.y ?? yOffset,
      width: isGrapes ? Math.max(geom.width ?? defaults.w, 1440) : (geom.width ?? defaults.w),
      height: isGrapes ? Math.max(geom.height ?? defaults.h, 1000) : (geom.height ?? defaults.h),
    };
    
    // Only increment yOffset if this widget didn't have a fixed Y saved
    if (geom.y === undefined) {
      yOffset += defaults.h;
    }

    return { ...widget, _geom: finalGeom };
  });

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      background: '#0B0F19', 
      position: 'relative', 
      overflowX: 'hidden' 
    }}>
      
      {/* Return button for preview purpose (only if not viewing via subdomain) */}
      {!siteId && (resolvedPageId || paramPageId) && (
        <Link to={`/admin/site/pages/${resolvedPageId || paramPageId}/builder`} style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 1000,
        }}>
          <Button 
            type="primary" 
            shape="round" 
            icon={<ArrowLeftOutlined />}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
          >
            Back to Editor
          </Button>
        </Link>
      )}

      <div ref={containerRef} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ 
          position: 'relative', 
          width: propSiteId ? '1440px' : '100%', 
          minWidth: propSiteId ? '1440px' : '100%', 
          margin: '0 auto', 
          minHeight: `${Math.max(yOffset, 1000)}px`, 
          display: 'flex', 
          flexDirection: 'column',
          transform: propSiteId ? `scale(${scale})` : 'none',
          transformOrigin: 'top center'
        }}>
        {mappedWidgets.map(widget => {
          const isManual = !!widget.contentConfig?.geometry;
          const isGrapes = widget.type === 'GRAPESJS';
          return (
            <div key={widget.id} style={{ 
              position: isManual ? 'absolute' : 'relative',
              left: isManual ? widget._geom.x : undefined,
              top: isManual ? widget._geom.y : undefined,
              width: isManual ? widget._geom.width : '100%',
              height: isManual || isGrapes ? widget._geom.height : 'auto',
              minHeight: isManual ? undefined : widget._geom.height
            }}>
              {isGrapes ? (
                <iframe
                  title="GrapesJS Content"
                  style={{ width: '100%', height: '100%', minHeight: '800px', border: 'none', background: 'transparent' }}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
                        <style>
                          body { margin: 0; padding: 0; font-family: sans-serif; box-sizing: border-box; }
                          *, *::before, *::after { box-sizing: inherit; }
                          ${widget.contentConfig?.css || ''}
                        </style>
                      </head>
                      <body>
                        ${widget.contentConfig?.html || ''}
                      </body>
                    </html>
                  `}
                />
              ) : (
                <WidgetRenderer
                  type={widget.type}
                  config={widget.contentConfig}
                  isActive={false}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>
      
      {/* Cart Drawer for E-commerce flow */}
      {widgets.length > 0 && (
        <CartDrawer siteId={(widgets[0] as any)?.page?.siteId} />
      )}
    </div>
  );
};

export default LiveViewer;
