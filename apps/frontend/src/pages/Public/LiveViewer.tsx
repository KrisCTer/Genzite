import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { fetchWidgetsPublicApi, fetchPagesApi, type Widget } from '../../api/sites';
import WidgetRenderer from '../Site/builder/WidgetRenderer';
import GrapesIframe from '../../components/GrapesIframe';

interface LiveViewerProps {
  siteId?: string;
}

const LiveViewer: React.FC<LiveViewerProps> = ({ siteId: propSiteId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const { pageId: paramPageId } = useParams<{ pageId: string }>();

  const isUUID = paramPageId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramPageId);
  const isParamActuallySiteId = paramPageId && !isUUID && paramPageId !== 'preview' && paramPageId !== '_';

  const siteId = propSiteId || searchParams.get('siteId') || (isParamActuallySiteId ? paramPageId : undefined);

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedPageId, setResolvedPageId] = useState<string | null>(
    searchParams.get('pageId') || (isParamActuallySiteId ? null : (paramPageId || null))
  );
  // iframeHeights no longer needed — height is managed by GrapesIframe

  const location = useLocation();
  const navigate = useNavigate();

  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    if (siteId) {
      setLoading(true);
      fetchPagesApi(siteId)
        .then(data => {
          setPages(data || []);
          setError(!data || data.length === 0);
          setLoading(false);
        })
        .catch(() => { setError(true); setLoading(false); });
    }
  }, [siteId]);

  useEffect(() => {
    if (pages.length === 0) return;

    let targetPage = null;

    // 1. Try backward compatibility via query ?pageId=
    const queryPageId = searchParams.get('pageId');
    if (queryPageId) {
      targetPage = pages.find((p: any) => p.id === queryPageId);
    }

    // 2. Try by location.pathname (slug)
    if (!targetPage && !isParamActuallySiteId) {
      const slug = location.pathname === '/' ? 'home' : location.pathname.substring(1);
      targetPage = pages.find((p: any) => p.slug === slug || p.slug === '/' + slug);
    }

    // 3. Fallback to paramPageId if it was treated as pageId
    if (!targetPage && paramPageId && !isParamActuallySiteId) {
      targetPage = pages.find((p: any) => p.id === paramPageId || p.slug === paramPageId);
    }

    // 4. Fallback to 'home' or first page
    if (!targetPage) {
      targetPage = pages.find((p: any) => p.slug === 'home' || p.slug === '/') || pages[0];
    }

    if (targetPage && targetPage.id !== resolvedPageId) {
      setResolvedPageId(targetPage.id);
    }
  }, [pages, location.pathname, searchParams, paramPageId, isParamActuallySiteId, resolvedPageId]);

  useEffect(() => {
    if (resolvedPageId) {
      setLoading(true);
      fetchWidgetsPublicApi(resolvedPageId)
        .then(data => { setWidgets(data); setError(false); setLoading(false); })
        .catch(() => { setError(true); setLoading(false); });
    }
  }, [resolvedPageId]);

  // Intercept postMessage from GrapesIframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GRAPES_NAVIGATE' && e.data.href) {
        let targetHref = e.data.href;
        if (targetHref.startsWith('http')) {
          window.open(targetHref, '_blank');
        } else {
          navigate(targetHref.startsWith('/') ? targetHref : `/${targetHref}`);
        }
      } else if (e.data?.type === 'CANVAS_MOUSE_MOVE') {
        window.parent.postMessage({ type: 'CANVAS_MOUSE_MOVE', clientX: e.data.clientX, clientY: e.data.clientY }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px', height: '100vh', width: '100vw'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 16, padding: '64px 48px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', maxWidth: 480, textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 96, fontWeight: 800, color: 'rgba(255, 255, 255, 0.08)', margin: 0, lineHeight: 1 }}>404</h1>
          <p style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginTop: 24, marginBottom: 8 }}>Oops, something went wrong!</p>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: 32 }}>
            The requested project or page does not exist or has not been published yet.
          </p>
          <Link to="/project">
            <button style={{
              background: '#fff', color: '#000', border: 'none', padding: '12px 24px',
              borderRadius: 8, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
            }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder);

  // If there's a GRAPESJS widget, it contains the full page HTML — use only that one.
  // Multiple GRAPESJS widgets can exist from repeated AI generations; use the latest (highest sortOrder).
  const grapesWidgets = sortedWidgets.filter(w => w.type === 'GRAPESJS');
  const widgetsToRender = grapesWidgets.length > 0
    ? [grapesWidgets[grapesWidgets.length - 1]]
    : sortedWidgets;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%' }}>
        {widgetsToRender.map(widget => {
          const isGrapes = widget.type === 'GRAPESJS';
          return (
            <div key={widget.id} style={{
              width: '100%',
              height: isGrapes ? '100vh' : 'auto',
              minHeight: isGrapes ? '100vh' : undefined,
            }}>
              {isGrapes ? (
                <GrapesIframe
                  html={widget.contentConfig?.html || ''}
                  css={widget.contentConfig?.css || ''}
                  title={`live-${widget.id}`}
                />
              ) : (
                <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={false} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveViewer;
