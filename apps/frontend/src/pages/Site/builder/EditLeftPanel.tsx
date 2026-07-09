import React, { useState } from 'react';
import { LayoutGrid, Layers } from 'lucide-react';
import { Tooltip } from 'antd';

interface EditLeftPanelProps {
  isOpen: boolean;
}

const EditLeftPanel: React.FC<EditLeftPanelProps> = ({ isOpen }) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');

  return (
    <div style={{
      width: isOpen ? 280 : 0,
      minWidth: isOpen ? 280 : 0,
      height: '100%',
      background: '#0f172a',
      borderRight: '1px solid #1E293B',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'clip',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 16px 12px', 
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0,
      }}>
        <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: 14, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Structure
        </h3>
        
        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Tooltip title="Blocks" placement="bottom">
            <div 
              onClick={() => setActiveTab('blocks')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                color: activeTab === 'blocks' ? '#fff' : '#94A3B8',
                background: activeTab === 'blocks' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LayoutGrid size={18} />
            </div>
          </Tooltip>
          <Tooltip title="Layers" placement="bottom">
            <div 
              onClick={() => setActiveTab('layers')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                color: activeTab === 'layers' ? '#fff' : '#94A3B8',
                background: activeTab === 'layers' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={18} />
            </div>
          </Tooltip>
        </div>
      </div>
      
      {/* Content Area
          Both tabs stay mounted in the DOM so GrapesJS Sorter stays initialized.
          We toggle visibility via display rather than unmounting. */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        {/* Blocks tab */}
        <div 
          style={{ 
            position: 'absolute',
            inset: 0,
            overflowY: 'auto', 
            padding: '16px 12px',
            display: activeTab === 'blocks' ? 'flex' : 'none',
            flexDirection: 'column'
          }} 
        >
          <div id="gjs-blocks" style={{ flex: 1 }} />
        </div>

        {/* Layers tab — NEVER unmounted, display:none only hides visually.
            GrapesJS Sorter needs the DOM to stay alive to track drag events. */}
        <div 
          id="gjs-layers" 
          style={{ 
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            display: activeTab === 'layers' ? 'block' : 'none',
          }} 
        />
      </div>
    </div>
  );
};

export default EditLeftPanel;
