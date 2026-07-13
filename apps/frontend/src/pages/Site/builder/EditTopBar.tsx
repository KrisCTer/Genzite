import React from 'react';
import { Smartphone, Tablet, Monitor, Save, Undo2, Redo2, ArrowLeft, Move, LayoutGrid, Check, Hand, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button, Tooltip, Space } from 'antd';

interface EditTopBarProps {
  device: 'mobile' | 'tablet' | 'desktop';
  setDevice: (device: 'mobile' | 'tablet' | 'desktop') => void;
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
  dragMode = 'absolute',
  onToggleDragMode,
  siteId
}) => {
  const [justSaved, setJustSaved] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [isPanActive, setIsPanActive] = React.useState(false);

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
    
    window.addEventListener('genzite:builder:saved', handleSaved);
    window.addEventListener('genzite:grapes:zoom:update', handleZoomChanged);
    window.addEventListener('genzite:grapes:pan:update', handlePanChanged);
    
    return () => {
      window.removeEventListener('genzite:builder:saved', handleSaved);
      window.removeEventListener('genzite:grapes:zoom:update', handleZoomChanged);
      window.removeEventListener('genzite:grapes:pan:update', handlePanChanged);
    };
  }, []);

  return (
    <div style={{ 
      height: 60, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#07090f',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      color: '#fff',
      zIndex: 100
    }}>
      {/* Left: Logo & Project Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div 
          style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} 
          onClick={() => window.location.href = `/project/${siteId || ''}`}
        >
          <span style={{ color: '#fff' }}>Genzite</span>
          <span style={{ fontSize: 10, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, verticalAlign: 'middle', fontWeight: 600, color: '#a1a1aa' }}>EDIT</span>
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500 }}>{siteName}</span>
      </div>

      {/* Center: Device Controls, Undo/Redo & Drag Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <Tooltip title="Mobile View (320px)">
            <div onClick={() => setDevice('mobile')} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: device === 'mobile' ? 'rgba(255,255,255,0.15)' : 'transparent', color: device === 'mobile' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
              <Smartphone size={16} />
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
          <div style={{ color: '#fff', fontSize: 13, minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
            {zoom}%
          </div>
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

        {/* Drag Mode Toggle */}
        {onToggleDragMode && (
          <>
            <style>{`
              @keyframes gz-drag-pop {
                0% { transform: scale(0.8); opacity: 0.7; }
                50% { transform: scale(1.25); filter: brightness(1.4); }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
            <Tooltip title={dragMode === 'absolute' ? "Current: Free Drag (X/Y Coordinates). Click to switch to Flow Layout." : "Current: Flow Layout (Standard Document Flow). Click to switch to Free Drag."}>
              <div 
                key={dragMode}
                onClick={() => onToggleDragMode(dragMode === 'absolute' ? '' : 'absolute')} 
                style={{ 
                  cursor: 'pointer', 
                  padding: '6px 12px', 
                  borderRadius: 8, 
                  background: dragMode === 'absolute' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.4))' : 'linear-gradient(135deg, rgba(52, 211, 153, 0.25), rgba(16, 185, 129, 0.4))', 
                  color: dragMode === 'absolute' ? '#38BDF8' : '#34D399',
                  border: dragMode === 'absolute' ? '1px solid #38BDF8' : '1px solid #34D399',
                  boxShadow: dragMode === 'absolute' ? '0 0 12px rgba(56, 189, 248, 0.5)' : '0 0 12px rgba(52, 211, 153, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  animation: 'gz-drag-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {dragMode === 'absolute' ? <Move size={16} /> : <LayoutGrid size={16} />}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dragMode === 'absolute' ? '#38BDF8' : '#34D399', boxShadow: dragMode === 'absolute' ? '0 0 8px #38BDF8' : '0 0 8px #34D399' }} />
              </div>
            </Tooltip>
          </>
        )}
      </div>

      {/* Right: Back to Project & Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Space size={10}>
          <Button 
            icon={<ArrowLeft size={16} />} 
            onClick={() => window.location.href = `/project/${siteId || ''}`}
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
            type="primary" 
            icon={justSaved ? <Check size={16} /> : <Save size={16} />} 
            onClick={onSave} 
            loading={isSaving} 
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: justSaved ? '#10B981' : undefined,
              borderColor: justSaved ? '#10B981' : undefined,
              boxShadow: justSaved ? '0 0 16px rgba(16, 185, 129, 0.6)' : undefined,
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
