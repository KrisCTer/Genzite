import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Sparkles } from 'lucide-react';
import AgentLogSidebar from '../AgentLogSidebar';

export interface LeftSidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
}) => {
  return (
    <div className="canvas-sidebar-left" style={{ 
      position: 'absolute', 
      left: 24, 
      top: 80, 
      bottom: isSidebarExpanded ? 24 : 'auto', 
      width: isSidebarExpanded ? 310 : 56, 
      height: isSidebarExpanded ? 'auto' : 56,
      zIndex: 10,
      background: isSidebarExpanded 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(17, 24, 39, 0.6)' 
        : 'rgba(17, 24, 39, 0.6)', 
      borderRadius: 16, 
      boxShadow: isSidebarExpanded ? '0 20px 50px rgba(0,0,0,0.6)' : '0 8px 30px rgba(56, 189, 248, 0.15)', 
      display: 'flex', flexDirection: 'column', overflow: 'hidden', 
      border: isSidebarExpanded ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(56, 189, 248, 0.3)', 
      backdropFilter: 'blur(24px)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, border 0.3s, box-shadow 0.3s'
    }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', 
        justifyContent: isSidebarExpanded ? 'space-between' : 'center', 
        padding: isSidebarExpanded ? '14px 16px' : '0', 
        height: isSidebarExpanded ? 'auto' : '100%',
        width: isSidebarExpanded ? 'auto' : '100%',
        background: isSidebarExpanded ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        borderBottom: isSidebarExpanded ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: isSidebarExpanded ? 'auto' : '100%', height: isSidebarExpanded ? 'auto' : '100%', justifyContent: isSidebarExpanded ? 'flex-start' : 'center' }}>
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              width: isSidebarExpanded ? 'auto' : '100%',
              height: isSidebarExpanded ? 'auto' : '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.9,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
            title={isSidebarExpanded ? "Thu gọn (Collapse)" : "Mở rộng (Expand)"}
          >
            <Sparkles size={isSidebarExpanded ? 18 : 24} color="#38bdf8" />
          </button>

          {isSidebarExpanded && (
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
              Gemini
            </span>
          )}
        </div>

        {isSidebarExpanded && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16
              }}
              title="Cuộc trò chuyện mới"
            >
              <PlusOutlined />
            </button>
          </div>
        )}
      </div>
      
      <div style={{ 
        flex: 1, 
        opacity: isSidebarExpanded ? 1 : 0, 
        visibility: isSidebarExpanded ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease',
        overflow: 'hidden' 
      }}>
        <div id="portal-left-sidebar" style={{ width: 310, height: '100%', overflowY: 'auto' }}>
          <AgentLogSidebar />
        </div>
      </div>
    </div>
  );
};
