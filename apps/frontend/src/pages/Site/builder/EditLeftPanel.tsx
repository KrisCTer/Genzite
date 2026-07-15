import React, { useState } from 'react';
import { LayoutGrid, Layers, Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Tooltip } from 'antd';
import type { Widget } from '../../../api/sites';
import { CustomLayersTree } from './components/CustomLayersTree';
import { CustomBlocksPanel } from './components/CustomBlocksPanel';

interface EditLeftPanelProps {
  isOpen: boolean;
  widgets?: Widget[];
  selectedId?: string | null;
  onSelectWidget?: (id: string | null) => void;
  onAddWidget?: (type: string) => void;
  onDeleteWidget?: (id: string) => void;
  onMoveWidget?: (id: string, direction: 'up' | 'down') => void;
  isGrapesPage?: boolean;
  setIsOpen?: (open: boolean) => void;
  editor?: any | null;
}

const COMPONENT_BLOCKS = [
  { type: 'HEADER', label: 'Header Navigation', desc: 'Top bar with logo & navigation links' },
  { type: 'HERO_SECTION', label: 'Hero Banner', desc: 'Large headline, subtitle & CTA buttons' },
  { type: 'PRODUCT_GRID', label: 'Product Grid', desc: 'Display featured or catalog items' },
  { type: 'FEATURES', label: 'Features Section', desc: 'Highlight key benefits in columns' },
  { type: 'PRICING', label: 'Pricing Table', desc: 'Show plans and subscription options' },
  { type: 'TESTIMONIAL', label: 'Testimonials', desc: 'Customer reviews and social proof' },
  { type: 'FAQ', label: 'FAQ Accordion', desc: 'Answer common questions clearly' },
  { type: 'CONTACT', label: 'Contact Section', desc: 'Contact info and submission form' },
  { type: 'CTA', label: 'Call to Action', desc: 'High conversion banner section' },
  { type: 'FOOTER', label: 'Footer Links', desc: 'Bottom links, newsletter & copyright' },
];

const EditLeftPanel: React.FC<EditLeftPanelProps> = ({
  isOpen,
  widgets = [],
  selectedId,
  onSelectWidget,
  onAddWidget,
  onDeleteWidget,
  onMoveWidget,
  isGrapesPage = false,
  setIsOpen,
  editor = null,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');

  return (
    <div className="canvas-sidebar-left" style={{
      position: 'absolute',
      left: 20,
      top: 80,
      bottom: isOpen ? 20 : 'auto',
      width: isOpen ? 280 : 56,
      height: isOpen ? 'auto' : 56,
      background: isOpen 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(17, 24, 39, 0.6)' 
        : 'rgba(17, 24, 39, 0.6)',
      border: isOpen ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: 16,
      boxShadow: isOpen ? '0 20px 50px rgba(0,0,0,0.6)' : '0 8px 30px rgba(56, 189, 248, 0.15)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s, background 0.3s, border 0.3s, box-shadow 0.3s',
      overflow: 'clip',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
    }}>
      {/* Header & Toggle */}
      <div style={{ 
        display: 'flex', alignItems: 'center', 
        justifyContent: isOpen ? 'space-between' : 'center', 
        padding: isOpen ? '16px 16px 12px' : '0', 
        height: isOpen ? 'auto' : '100%',
        width: isOpen ? 'auto' : '100%',
        background: isOpen ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        borderBottom: isOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        flexShrink: 0,
        flexDirection: isOpen ? 'column' : 'row',
        gap: isOpen ? '12px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: isOpen ? 'auto' : '100%', height: isOpen ? 'auto' : '100%', justifyContent: isOpen ? 'space-between' : 'center', alignSelf: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setIsOpen?.(!isOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                width: isOpen ? 'auto' : '100%',
                height: isOpen ? 'auto' : '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              title={isOpen ? "Thu gọn (Collapse)" : "Mở rộng (Expand)"}
            >
              <LayoutGrid size={isOpen ? 18 : 24} color="#38bdf8" />
            </button>

            {isOpen && (
              <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: 14, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Structure
              </h3>
            )}
          </div>
        </div>
        
        {/* Tab switcher */}
        {isOpen && (
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)',
          width: '100%'
        }}>
          <Tooltip title="Thành phần (Blocks)" placement="bottom">
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
                justifyContent: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600
              }}
            >
              <LayoutGrid size={15} />
              <span>Block</span>
            </div>
          </Tooltip>
          <Tooltip title="Cấu trúc (Layers)" placement="bottom">
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
                justifyContent: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600
              }}
            >
              <Layers size={15} />
              <span>Layer</span>
            </div>
          </Tooltip>
        </div>
        )}
      </div>
      
      {/* Content Area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        {isGrapesPage ? (
          <>
            {/* Hidden fallback containers so GrapesJS initialization does not complain or fail */}
            <div style={{ display: 'none' }}>
              <div id="gjs-blocks" />
              <div id="gjs-layers" />
            </div>

            <div 
              style={{ 
                position: 'absolute',
                inset: 0,
                overflowY: 'auto', 
                padding: '12px 10px',
                display: activeTab === 'blocks' ? 'flex' : 'none',
                flexDirection: 'column'
              }} 
            >
              <CustomBlocksPanel editor={editor} />
            </div>

            <div 
              style={{ 
                position: 'absolute',
                inset: 0,
                overflowY: 'auto',
                padding: '12px 10px',
                display: activeTab === 'layers' ? 'flex' : 'none',
                flexDirection: 'column'
              }} 
            >
              <CustomLayersTree editor={editor} />
            </div>
          </>
        ) : (
          /* Component-Driven Mode */
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '12px' }}>
            {activeTab === 'blocks' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                  Available Component Blocks
                </div>
                {COMPONENT_BLOCKS.map(block => (
                  <div 
                    key={block.type}
                    onClick={() => onAddWidget?.(block.type)}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#06B6D4'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>{block.label}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{block.desc}</div>
                    </div>
                    <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', padding: '6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                      <Plus size={16} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                  Page Layers ({widgets.length})
                </div>
                {widgets.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#64748B', padding: '30px 10px', fontSize: 12 }}>
                    No layers yet. Switch to Blocks to add sections.
                  </div>
                )}
                {widgets.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((w, index) => {
                  const wid = (w as any)._id || w.id;
                  const isSelected = selectedId === wid;
                  return (
                    <div
                      key={wid}
                      onClick={() => onSelectWidget?.(wid)}
                      style={{
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ overflow: 'hidden', marginRight: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#C4B5FD' : '#F8FAFC', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {index + 1}. {w.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Move Up">
                          <button
                            onClick={() => onMoveWidget?.(wid, 'up')}
                            disabled={index === 0}
                            style={{ background: 'transparent', border: 'none', color: index === 0 ? '#334155' : '#94A3B8', cursor: index === 0 ? 'default' : 'pointer', padding: 4 }}
                          >
                            <ArrowUp size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Move Down">
                          <button
                            onClick={() => onMoveWidget?.(wid, 'down')}
                            disabled={index === widgets.length - 1}
                            style={{ background: 'transparent', border: 'none', color: index === widgets.length - 1 ? '#334155' : '#94A3B8', cursor: index === widgets.length - 1 ? 'default' : 'pointer', padding: 4 }}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete Layer">
                          <button
                            onClick={() => onDeleteWidget?.(wid)}
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLeftPanel;
