import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { fetchWidgetsApi, fetchPagesApi, type Widget } from '../../api/sites';
import WidgetRenderer from '../Site/builder/WidgetRenderer';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CartDrawer from '../../components/CartDrawer';

interface LiveViewerProps {
  siteId?: string;
}

const LiveViewer: React.FC<LiveViewerProps> = ({ siteId }) => {
  const { pageId: paramPageId } = useParams<{ pageId: string }>();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedPageId, setResolvedPageId] = useState<string | null>(paramPageId || null);

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
    const targetPageId = resolvedPageId || paramPageId;
    if (targetPageId) {
      setLoading(true);
      fetchWidgetsApi(targetPageId)
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
          status="500"
          title={<span style={{ color: '#fff' }}>Page Not Found</span>}
          subTitle={<span style={{ color: '#94A3B8' }}>Sorry, something went wrong or the page does not exist.</span>}
          extra={<Link to="/admin"><Button type="primary">Back Home</Button></Link>}
        />
      </div>
    );
  }

  // Map widgets to include stacking geometry
  let yOffset = 0;
  const mappedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder).map(widget => {
    // Basic defaults
    const defaults = { w: 1440, h: 300 };
    if (widget.type.toUpperCase() === 'HEADER') defaults.h = 100;
    if (widget.type.toUpperCase() === 'HERO') defaults.h = 600;
    if (widget.type.toUpperCase() === 'FOOTER') defaults.h = 150;

    const geom = widget.contentConfig?.geometry || {};
    const finalGeom = {
      x: geom.x ?? 0,
      y: geom.y ?? yOffset,
      width: geom.width ?? defaults.w,
      height: geom.height ?? defaults.h,
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

      <div style={{ position: 'relative', width: '1440px', margin: '0 auto', minHeight: `${Math.max(yOffset, 1000)}px` }}>
        {mappedWidgets.map(widget => (
          <div key={widget.id} style={{ 
            position: 'absolute',
            left: widget._geom.x,
            top: widget._geom.y,
            width: widget._geom.width,
            height: widget._geom.height
          }}>
            <WidgetRenderer
              type={widget.type}
              config={widget.contentConfig}
              isActive={false}
            />
          </div>
        ))}
      </div>
      
      {/* Cart Drawer for E-commerce flow */}
      {widgets.length > 0 && (
        <CartDrawer siteId={(widgets[0] as any)?.page?.siteId} />
      )}
    </div>
  );
};

export default LiveViewer;
