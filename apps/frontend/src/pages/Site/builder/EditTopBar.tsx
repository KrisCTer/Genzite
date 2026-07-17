import React from 'react';
import { Smartphone, Tablet, Monitor, Save, Undo2, Redo2, ArrowLeft, Check, Hand, ZoomIn, ZoomOut, Maximize, MoveVertical, RefreshCcw } from 'lucide-react';
import { Button, Tooltip, Space, Dropdown } from 'antd';

interface EditTopBarProps {
  device: 'mobile' | 'tablet' | 'desktop' | 'full';
  setDevice: (device: 'mobile' | 'tablet' | 'desktop' | 'full') => void;
  siteName?: string;
  leftPanelOpen?: boolean;
  setLeftPanelOpen?: (open: boolean) => void;
  rightPanelOpen?: boolean;
  setRightPanelOpen?: (open: boolean) => void;
  onSave?: () => void;
  isSaving?: boolean;
  dragMode?: 'absolute' | '';
  onToggleDragMode?: (mode: 'absolute' | '') => void;
  siteId?: string;
}

const EditTopBar: React.FC<EditTopBarProps> = ({ 
  device, 
  setDevice, 
  siteName = 'Untitled Project',
  onSave,
  isSaving,
  siteId
}) => {
  const [justSaved, setJustSaved] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [isPanActive, setIsPanActive] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    const handleSaved = () => {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    };
    const handleZoomChanged = (e: any) => {
      if (e.detail && typeof e.detail.zoom === 'number') {
        setZoom(Math.round(e.detail.zoom));
      }
    };
    const handlePanChanged = (e: any) => {
      if (e.detail && typeof e.detail.active === 'boolean') {
        setIsPanActive(e.detail.active);
      }
    };
    
    const handleDirtyStatus = (e: any) => {
      if (e.detail && typeof e.detail.isDirty === 'boolean') {
        setIsDirty(e.detail.isDirty);
      }
    };
    
    window.addEventListener('genzite:builder:saved', handleSaved);
    window.addEventListener('genzite:builder:dirtyStatus', handleDirtyStatus);
    window.addEventListener('genzite:grapes:zoom:update', handleZoomChanged);
    window.addEventListener('genzite:grapes:pan:update', handlePanChanged);
    
    return () => {
      window.removeEventListener('genzite:builder:saved', handleSaved);
      window.removeEventListener('genzite:builder:dirtyStatus', handleDirtyStatus);
      window.removeEventListener('genzite:grapes:zoom:update', handleZoomChanged);
      window.removeEventListener('genzite:grapes:pan:update', handlePanChanged);
    };
  }, []);

  const zoomItems = [
    { key: '25', label: '25%' },
    { key: '50', label: '50%' },
    { key: '75', label: '75%' },
    { key: '100', label: '100%' },
    { key: '125', label: '125%' },
    { key: '150', label: '150%' },
    { key: '200', label: '200%' },
  ];

  const handleZoomMenuClick = (e: any) => {
    const newZoom = parseInt(e.key, 10);
    window.dispatchEvent(new CustomEvent('genzite:grapes:zoom-set', { detail: { zoom: newZoom } }));
  };

  return (
    <div className="canvas-toolbar">
      {/* Left: Logo & Project Name */}
      <div className="canvas-toolbar-left">
        <div 
          style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} 
          onClick={() => {
            if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
              return;
            }
            window.location.href = `/project/${siteId || ''}`;
          }}
        >
          <span style={{ color: '#fff' }}>Genzite</span>
          <span style={{ fontSize: 10, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, verticalAlign: 'middle', fontWeight: 600, color: '#a1a1aa' }}>EDIT</span>
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', marginLeft: 8, marginRight: 8 }} />
        
        <div
          className="canvas-project-title-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'default',
            padding: '4px 10px',
            borderRadius: 8,
            transition: 'all 0.2s ease',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          title={siteName}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '0.01em', fontFamily: 'var(--font-sans)' }}>
            {siteName}
          </span>
        </div>
      </div>

      {/* Center: Device Controls, Undo/Redo & Drag Mode Toggle */}
      <div className="canvas-toolbar-center" style={{ gap: 12 }}>
        {/* Device view buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: 8 }}>
          <Tooltip title="Desktop View (1440px)">
            <div onClick={() => setDevice('desktop')} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: device === 'desktop' ? 'rgba(255,255,255,0.15)' : 'transparent', color: device === 'desktop' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
              <Monitor size={16} />
            </div>
          </Tooltip>
          <Tooltip title="Tablet View (768px)">
            <div onClick={() => setDevice('tablet')} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: device === 'tablet' ? 'rgba(255,255,255,0.15)' : 'transparent', color: device === 'tablet' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
              <Tablet size={16} />
            </div>
          </Tooltip>
          <Tooltip title="Mobile View (390px)">
            <div onClick={() => setDevice('mobile')} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: device === 'mobile' ? 'rgba(255,255,255,0.15)' : 'transparent', color: device === 'mobile' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
              <Smartphone size={16} />
            </div>
          </Tooltip>
          <Tooltip title="Full Height View (100%)">
            <div onClick={() => setDevice('full')} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: device === 'full' ? 'rgba(255,255,255,0.15)' : 'transparent', color: device === 'full' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
              <MoveVertical size={16} />
            </div>
          </Tooltip>
        </div>

        {/* Undo, Redo & Reload buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: 8 }}>
          <Tooltip title="Undo (Ctrl + Z)">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:undo'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Undo2 size={16} />
            </div>
          </Tooltip>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <Tooltip title="Redo (Ctrl + Y)">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:redo'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Redo2 size={16} />
            </div>
          </Tooltip>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <Tooltip title="Reload Page (If stuck)">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:reload'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <RefreshCcw size={16} />
            </div>
          </Tooltip>
        </div>

        {/* Zoom & Pan controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: 8 }}>
          <Tooltip title={isPanActive ? "Disable Pan (Hand Tool)" : "Enable Pan (Hand Tool)"}>
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:pan:toggle'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: isPanActive ? '#38BDF8' : '#cbd5e1', background: isPanActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = isPanActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = isPanActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent')}
            >
              <Hand size={16} />
            </div>
          </Tooltip>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <Tooltip title="Zoom Out">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:zoom-out'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ZoomOut size={16} />
            </div>
          </Tooltip>
          <Dropdown 
            menu={{ items: zoomItems, onClick: handleZoomMenuClick }} 
            trigger={['click']}
            placement="bottom"
          >
            <div style={{ color: '#fff', fontSize: 13, minWidth: 40, textAlign: 'center', fontWeight: 600, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.2s' }}
                 onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                 onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {zoom}%
            </div>
          </Dropdown>
          <Tooltip title="Zoom In">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:zoom-in'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ZoomIn size={16} />
            </div>
          </Tooltip>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <Tooltip title="Fit to Screen">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('genzite:grapes:zoom-fit'))} 
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, color: '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Maximize size={16} />
            </div>
          </Tooltip>
        </div>
        {/* Free Drag Mode active (Flow mode removed) */}
      </div>

      {/* Right: Back to Project & Save */}
      <div className="canvas-toolbar-right" style={{ gap: 12 }}>
        <Space size={10}>
          <Button 
            icon={<ArrowLeft size={16} />} 
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                return;
              }
              window.location.href = `/project/${siteId || ''}`;
            }}
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              color: '#e2e8f0', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            Back to Project
          </Button>
          <Button 
            icon={justSaved ? <Check size={16} /> : <Save size={16} />} 
            onClick={onSave} 
            loading={isSaving} 
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: justSaved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
              borderColor: justSaved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)',
              color: justSaved ? '#10B981' : '#06B6D4',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: justSaved ? '0 0 16px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
              transform: justSaved ? 'scale(1.04)' : undefined,
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {justSaved ? 'Saved Successfully!' : 'Save Changes'}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default EditTopBar;
