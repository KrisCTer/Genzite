import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Smartphone, Tablet, Monitor, Share2, RotateCw, ExternalLink, QrCode, Info, X } from 'lucide-react';
import { UserPopover } from '@genzite/shared-ui';
import { useAuthStore } from '../../store/auth';
import { Modal, Switch, message } from 'antd';
import './CanvasBuilder.css';

const PreviewViewer: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const canvasCenterRef = useRef<HTMLDivElement>(null);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CANVAS_MOUSE_MOVE' && canvasCenterRef.current && iframeWrapperRef.current) {
        const centerRect = canvasCenterRef.current.getBoundingClientRect();
        const iframeRect = iframeWrapperRef.current.getBoundingClientRect();
        
        const parentX = iframeRect.left + e.data.clientX;
        const parentY = iframeRect.top + e.data.clientY;
        
        canvasCenterRef.current.style.setProperty('--mouse-x', `${parentX - centerRect.left}px`);
        canvasCenterRef.current.style.setProperty('--mouse-y', `${parentY - centerRect.top}px`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetWidth = 1440;
    if (device === 'mobile') targetWidth = 390;
    else if (device === 'tablet') targetWidth = 768;

    const updateScale = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - 64;
      setScale(availableWidth < targetWidth ? availableWidth / targetWidth : 1);
    };

    // ResizeObserver fires reliably right after layout, unlike 'resize'
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    updateScale();
    return () => ro.disconnect();
  }, [device]);

  const handleReload = () => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
    
    const el = document.getElementById('preview-viewer-canvas-wrapper');
    if (el) {
      el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.transform = `scale(${scale * 0.98})`;
      el.style.opacity = '0.7';
      el.style.filter = 'brightness(1.1)';
      
      setTimeout(() => {
        el.style.transform = `scale(${scale})`;
        el.style.opacity = '1';
        el.style.filter = 'brightness(1)';
        
        setTimeout(() => {
          el.style.transition = 'width 0.3s ease, transform 0.3s ease';
          el.style.transform = `scale(${scale})`;
          el.style.filter = '';
        }, 300);
      }, 200);
    }
  };

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 390;
      case 'tablet': return 768;
      case 'desktop': return 1440;
    }
  };

  return (
    <div className="canvas-builder" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <div className="canvas-toolbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <span style={{ color: '#fff' }}>Genzite</span>
            <span style={{ fontSize: 10, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, verticalAlign: 'middle', fontWeight: 600, color: '#a1a1aa' }}>BETA</span>
          </div>
        </div>

        {/* Center: Device Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 8 }}>
            <div onClick={() => setDevice('mobile')} style={{ cursor: 'pointer', padding: 6, borderRadius: 6, background: device === 'mobile' ? 'rgba(255,255,255,0.1)' : 'transparent', opacity: device === 'mobile' ? 1 : 0.6 }}><Smartphone size={16} /></div>
            <div onClick={() => setDevice('tablet')} style={{ cursor: 'pointer', padding: 6, borderRadius: 6, background: device === 'tablet' ? 'rgba(255,255,255,0.1)' : 'transparent', opacity: device === 'tablet' ? 1 : 0.6 }}><Tablet size={16} /></div>
            <div onClick={() => setDevice('desktop')} style={{ cursor: 'pointer', padding: 6, borderRadius: 6, background: device === 'desktop' ? 'rgba(255,255,255,0.1)' : 'transparent', opacity: device === 'desktop' ? 1 : 0.6 }}><Monitor size={16} /></div>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="canvas-header-btn-icon" onClick={() => window.open(`/live/${siteId}${pageId ? `?pageId=${pageId}` : ''}`, '_blank')} title="Open Live"><ExternalLink size={16} /></button>
            <button className="canvas-header-btn-icon" onClick={handleReload} title="Reload Preview"><RotateCw size={16} /></button>
            <button className="canvas-header-btn-icon" onClick={() => setIsQrModalOpen(true)} title="QR Code"><QrCode size={16} /></button>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="canvas-header-btn-pill" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={14} /> Share
          </button>
          
          <div style={{ position: 'relative' }}>
            <div 
              ref={avatarRef}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
              title={user?.name || 'User Profile'}
            >
              {user?.name ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#38bdf8', color: '#fff', fontWeight: 600, fontSize: 14 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img src={user?.avatarUrl || "https://i.pravatar.cc/150?img=33"} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>

            {isUserMenuOpen && (
              <UserPopover
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={logout}
                user={user as any}
                menuRef={menuRef as any}
                style={{ top: 40, right: 0 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div 
        ref={(el) => {
          containerRef.current = el;
          canvasCenterRef.current = el;
        }}
        className="canvas-center"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '32px',
          position: 'relative'
        }}
      >
        {/* Canvas wrapper: fixed at device width, then CSS-scaled to fit the available space.
             The iframe always renders at the true device width so its responsive breakpoints
             fire correctly — scale() only affects visual presentation, not viewport geometry. */}
        <div
          ref={iframeWrapperRef}
          id="preview-viewer-canvas-wrapper"
          style={{
            width: getWidth(),
            height: '100%',
            maxHeight: 800,
            background: '#fff',
            borderRadius: 24,
            border: '6px solid rgba(148, 163, 184, 0.4)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transition: 'transform 0.3s ease, width 0.3s ease, min-width 0.3s ease',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {/* Security Banner */}
          {showBanner && (
            <div style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '10px 16px',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 500,
              borderBottom: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexShrink: 0,
              position: 'relative'
            }}>
              <Info size={16} />
              <span>This content was created by a Genzite user. Do not enter sensitive information as the owner can view it.</span>
              <X
                size={16}
                style={{ position: 'absolute', right: 16, cursor: 'pointer', opacity: 0.6 }}
                onClick={() => setShowBanner(false)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              />
            </div>
          )}
          {/* The iframe is given an EXPLICIT width matching the device target.
               This guarantees its internal viewport is always the correct width
               regardless of when React computes the scale value. */}
          <iframe
            src={`/live/${siteId}${pageId ? `?pageId=${pageId}` : ''}`}
            style={{ 
              width: getWidth(), 
              minWidth: getWidth(), 
              flex: 1, 
              border: 'none', 
              display: 'block',
              transition: 'width 0.3s ease, min-width 0.3s ease'
            }}
            title="Preview"
          />
        </div>
      </div>

      <Modal
        title={null}
        open={isQrModalOpen}
        onCancel={() => setIsQrModalOpen(false)}
        footer={null}
        width={380}
        centered
        styles={{
          mask: { backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.45)' },
          content: { background: '#222327', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 24px 32px 24px', borderRadius: 12 },
        }}
        closeIcon={<span style={{ fontSize: 20, color: '#A1A1AA', fontWeight: 300 }}>×</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 500, margin: '0 0 24px 0', textAlign: 'center' }}>
            QR Code
          </h2>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.origin + '/live/' + siteId + (pageId ? `?pageId=${pageId}` : ''))}&margin=0`} 
              alt="QR Code" 
              style={{ width: 220, height: 220, display: 'block' }} 
            />
          </div>
          <div style={{ color: '#A1A1AA', textAlign: 'center', fontSize: 13.5, lineHeight: 1.6, fontWeight: 400 }}>
            Scan this code with a mobile device to<br/>see a live preview.
          </div>
        </div>
      </Modal>

      <Modal
        title={null}
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={null}
        width={400}
        centered
        styles={{
          mask: { backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.45)' },
          content: { background: '#222327', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: 12 },
        }}
        closeIcon={<span style={{ fontSize: 18, color: '#A1A1AA', fontWeight: 300 }}>×</span>}
      >
        <div>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, margin: '0 0 24px 0' }}>
            Share Project
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Allow sharing and remixing</span>
            <Switch checked={isShareEnabled} onChange={setIsShareEnabled} />
          </div>
          <div style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 24 }}>
            {isShareEnabled ? 'Anyone with the link can view this project' : 'Only you can access this project'}
          </div>

          <div style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <div style={{ color: '#A1A1AA', fontSize: 13, lineHeight: 1.5 }}>
              When making a project public, you allow anyone with the link to view and remix the designs and generated code of this project. You can revoke public access at any time but remixed designs will not be deleted.
            </div>
          </div>

          <button 
            disabled={!isShareEnabled}
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/live/' + siteId);
              message.success('Project share link copied!');
            }}
            style={{ 
              width: '100%', 
              background: isShareEnabled ? '#333' : 'rgba(255,255,255,0.05)', 
              color: isShareEnabled ? '#fff' : 'rgba(255,255,255,0.3)', 
              border: 'none', 
              padding: '12px', 
              borderRadius: 8, 
              fontSize: 14, 
              fontWeight: 600, 
              cursor: isShareEnabled ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Copy link
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PreviewViewer;
