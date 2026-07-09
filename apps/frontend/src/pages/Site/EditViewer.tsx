import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Spin } from 'antd';
import { fetchPagesApi, fetchWidgetsApi, replaceWidgetsApi, fetchSiteByIdApi, type Widget } from '../../api/sites';
import EditTopBar from './builder/EditTopBar';
import EditLeftPanel from './builder/EditLeftPanel';
import EditRightPanel from './builder/EditRightPanel';
import GrapesEditor, { type GrapesEditorRef } from './builder/GrapesEditor';
import './CanvasBuilder.css';

const EditViewer: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [dragMode, setDragMode] = useState<'absolute' | ''>('absolute');
  const editorRef = useRef<GrapesEditorRef>(null);
  const queryClient = useQueryClient();

  // Fetch site info
  const { data: site } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId
  });

  // Fetch pages to get the first page or active page
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId
  });

  const activePage = pages?.[0];

  // Fetch widgets for active page
  const { data: widgets, isLoading: widgetsLoading } = useQuery({
    queryKey: ['widgets', activePage?.id],
    queryFn: () => fetchWidgetsApi(activePage!.id),
    enabled: !!activePage?.id
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedWidgets: Partial<Widget>[]) => {
      if (!activePage?.id) throw new Error('No active page');
      return replaceWidgetsApi(activePage.id, updatedWidgets);
    },
    onSuccess: () => {
      message.error('Error saving changes!');
    }
  });

  const handleSave = () => {
    if (!editorRef.current || !pageId) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    // Find GRAPESJS widget and update it
    const grapesWidget = widgets.find(w => w.type === 'GRAPESJS');
    if (!grapesWidget) {
      message.warning('Could not find GrapesJS page to save!');
      return;
    }

    const updatedWidget = {
      ...grapesWidget,
      contentConfig: {
        ...(grapesWidget.contentConfig || {}),
        html,
        css
      }
    };

    const newWidgets = widgets.map(w => w.id === grapesWidget.id ? updatedWidget : w);
    saveMutation.mutate(newWidgets);
  };

  const grapesWidget = widgets.find(w => w.type === 'GRAPESJS');
  const isLoading = loadingPages || loadingWidgets;
=======
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
>>>>>>> 286da66eeeaa26c6d3586ab9398d6b1bc192ea8d

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 390;
      case 'tablet': return 768;
      case 'desktop': return '100%';
    }
  };

  return (
    <div className="canvas-builder" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#07090f',
      overflow: 'hidden'
    }}>
      <EditTopBar 
        device={device}
        setDevice={setDevice}
        siteName={site?.name || 'Untitled Project'}
        leftPanelOpen={leftPanelOpen}
        setLeftPanelOpen={setLeftPanelOpen}
        rightPanelOpen={rightPanelOpen}
        setRightPanelOpen={setRightPanelOpen}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
        dragMode={dragMode}
        onToggleDragMode={(mode) => {
          setDragMode(mode);
          editorRef.current?.setDragMode(mode);
        }}
        siteId={siteId}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <EditLeftPanel isOpen={leftPanelOpen} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
           {/* Center Area */}
           <div style={{
              flex: 1,
              display: 'flex',
              padding: 0,
              overflow: 'hidden',
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
              backgroundSize: '24px 24px',
           }}>
              {isLoading ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" />
                </div>
              ) : grapesWidget ? (
                <div style={{ 
                  width: '100%', 
                  height: '100%',
                  overflow: 'hidden',
                }}>
                  <GrapesEditor 
                    ref={editorRef} 
                    htmlContent={grapesWidget.contentConfig?.html || ''} 
                    cssContent={grapesWidget.contentConfig?.css || ''}
                    initialDragMode={dragMode}
                  />
                </div>
              ) : (
                <div style={{ color: '#fff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 16 }}>Builder Mode</h2>
                    <p style={{ color: '#94a3b8' }}>This page does not use GrapesJS engine. Please use standard drag-and-drop mode.</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        <EditRightPanel isOpen={rightPanelOpen} />
      </div>
=======
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <div className="canvas-toolbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => window.location.href = '/home'}>
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
            <button className="canvas-header-btn-icon" onClick={() => window.open(`/live/${siteId}`, '_blank')} title="Open Live"><ExternalLink size={16} /></button>
            <button className="canvas-header-btn-icon" onClick={() => window.location.reload()} title="Reload Preview"><RotateCw size={16} /></button>
            <button className="canvas-header-btn-icon" onClick={() => setIsQrModalOpen(true)} title="QR Code"><QrCode size={16} /></button>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="canvas-header-btn-pill" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={14} /> Chia sẻ
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
                user={user}
                menuRef={menuRef}
                style={{ top: 40, right: 0 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div 
        ref={canvasCenterRef}
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
          overflow: 'auto',
          padding: '100px 18vw 48px 18vw',
          position: 'relative'
        }}
      >
        <div 
          ref={iframeWrapperRef}
          style={{
          width: getWidth(),
          height: '100%',
          maxWidth: '1440px',
          background: '#fff',
          borderRadius: 24,
          border: '6px solid rgba(148, 163, 184, 0.4)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          transition: 'width 0.3s ease',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1
        }}>
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
              <span>Nội dung này do một người dùng Genzite tạo. Đừng nhập thông tin nhạy cảm vì chủ sở hữu có thể xem được thông tin đó.</span>
              <X 
                size={16} 
                style={{ position: 'absolute', right: 16, cursor: 'pointer', opacity: 0.6 }} 
                onClick={() => setShowBanner(false)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              />
            </div>
          )}
          <iframe 
            src={`/live/${siteId}`} 
            style={{ width: '100%', flex: 1, border: 'none' }} 
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
            Quét mã QR
          </h2>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.origin + '/live/' + siteId)}&margin=0`} 
              alt="QR Code" 
              style={{ width: 220, height: 220, display: 'block' }} 
            />
          </div>
          <div style={{ color: '#A1A1AA', textAlign: 'center', fontSize: 13.5, lineHeight: 1.6, fontWeight: 400 }}>
            Quét mã này bằng thiết bị di động để<br/>xem bản xem trước.
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
            Chia sẻ dự án
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Cho phép chia sẻ và phối lại</span>
            <Switch checked={isShareEnabled} onChange={setIsShareEnabled} />
          </div>
          <div style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 24 }}>
            {isShareEnabled ? 'Bất cứ ai có liên kết đều có thể xem dự án này' : 'Chỉ bạn mới có thể truy cập vào dự án này'}
          </div>

          <div style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <div style={{ color: '#A1A1AA', fontSize: 13, lineHeight: 1.5 }}>
              Khi công khai dự án, bạn cho phép bất cứ ai có đường liên kết có thể xem và phối lại các bản thiết kế và mã đã tạo của dự án này. Bạn có thể thu hồi quyền truy cập công khai bất cứ lúc nào nhưng các bản thiết kế đã được phối lại sẽ không bị xoá.
            </div>
          </div>

          <button 
            disabled={!isShareEnabled}
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/live/' + siteId);
              message.success('Đã sao chép liên kết chia sẻ dự án!');
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
            Sao chép đường liên kết
          </button>
        </div>
      </Modal>
>>>>>>> 286da66eeeaa26c6d3586ab9398d6b1bc192ea8d
    </div>
  );
};

export default EditViewer;
