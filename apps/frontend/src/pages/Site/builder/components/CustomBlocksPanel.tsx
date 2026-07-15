import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Box,
  Type,
  Image as ImageIcon,
  Video,
  Columns,
  MousePointerClick,
  Plus,
  Search,
  CreditCard,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { Input, message, Tooltip } from 'antd';

interface CustomBlocksPanelProps {
  editor: any | null;
}

interface BlockItem {
  id: string;
  category: 'layout' | 'typography' | 'media' | 'interactive';
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string | Record<string, any>;
}

export const CURATED_BLOCKS: BlockItem[] = [
  // LAYOUT & STRUCTURE
  {
    id: 'section-container',
    category: 'layout',
    title: 'Section Wrapper',
    description: 'Full-width padding container for grouping components',
    icon: <LayoutGrid size={18} color="#06B6D4" />,
    content: `<section style="padding: 60px 20px; background-color: #0F172A; min-height: 200px; display: flex; flex-direction: column; gap: 20px;">
  <div style="max-width: 1200px; margin: 0 auto; width: 100%;">
    <h2 style="color: #F8FAFC; font-size: 32px; font-weight: 700; margin-bottom: 12px;">New Section Headline</h2>
    <p style="color: #94A3B8; font-size: 16px;">Add your content inside this container section.</p>
  </div>
</section>`,
  },
  {
    id: 'grid-2-cols',
    category: 'layout',
    title: '2 Columns Grid',
    description: 'Responsive 50/50 two-column layout grid',
    icon: <Columns size={18} color="#3B82F6" />,
    content: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; width: 100%; padding: 20px 0;">
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px;">
    <h3 style="color: #F8FAFC; font-size: 20px; font-weight: 600; margin-bottom: 8px;">Column 1</h3>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Left column text content goes here.</p>
  </div>
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px;">
    <h3 style="color: #F8FAFC; font-size: 20px; font-weight: 600; margin-bottom: 8px;">Column 2</h3>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Right column text content goes here.</p>
  </div>
</div>`,
  },
  {
    id: 'grid-3-cols',
    category: 'layout',
    title: '3 Columns Grid',
    description: 'Triple column feature layout card grid',
    icon: <Columns size={18} color="#8B5CF6" />,
    content: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; width: 100%; padding: 20px 0;">
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
    <h4 style="color: #F8FAFC; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Feature One</h4>
    <p style="color: #94A3B8; font-size: 13px;">Highlight first key capability or benefit.</p>
  </div>
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
    <h4 style="color: #F8FAFC; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Feature Two</h4>
    <p style="color: #94A3B8; font-size: 13px;">Highlight second key capability or benefit.</p>
  </div>
  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
    <h4 style="color: #F8FAFC; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Feature Three</h4>
    <p style="color: #94A3B8; font-size: 13px;">Highlight third key capability or benefit.</p>
  </div>
</div>`,
  },
  {
    id: 'box-container',
    category: 'layout',
    title: 'Flex Box Container',
    description: 'Generic flexible container for aligning elements',
    icon: <Box size={18} color="#E2E8F0" />,
    content: `<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px;">
  <span style="color: #E2E8F0; font-weight: 500;">Container Box Text</span>
</div>`,
  },

  // TYPOGRAPHY
  {
    id: 'heading-1',
    category: 'typography',
    title: 'Main Headline (H1)',
    description: 'Primary page hero heading text',
    icon: <Type size={18} color="#EC4899" />,
    content: `<h1 style="color: #FFFFFF; font-size: 48px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 16px;">
  Stunning Next-Gen Digital Experience
</h1>`,
  },
  {
    id: 'heading-2',
    category: 'typography',
    title: 'Section Title (H2)',
    description: 'Bold sub-section title heading',
    icon: <Type size={18} color="#A855F7" />,
    content: `<h2 style="color: #F8FAFC; font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 12px;">
  Empowering Modern Businesses
</h2>`,
  },
  {
    id: 'paragraph-text',
    category: 'typography',
    title: 'Body Paragraph',
    description: 'Standard readable multi-line text block',
    icon: <Type size={18} color="#94A3B8" />,
    content: `<p style="color: #94A3B8; font-size: 16px; line-height: 1.6; margin-bottom: 16px; max-width: 680px;">
  Craft dynamic content and visual interfaces with ease. Our architecture provides high speed, scalability, and intuitive design freedom right out of the box.
</p>`,
  },

  // MEDIA & ASSETS
  {
    id: 'responsive-image',
    category: 'media',
    title: 'Responsive Image Card',
    description: 'Optimized image box with rounded corners and shadow',
    icon: <ImageIcon size={18} color="#10B981" />,
    content: `<div style="overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); max-width: 100%;">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" alt="Hero Asset" style="width: 100%; height: auto; display: block; object-fit: cover;" />
</div>`,
  },
  {
    id: 'video-embed',
    category: 'media',
    title: 'Video Player Box',
    description: 'HTML5 video responsive embed frame',
    icon: <Video size={18} color="#14B8A6" />,
    content: `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; background: #000;">
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
</div>`,
  },

  // INTERACTIVE & SECTIONS
  {
    id: 'hero-banner',
    category: 'interactive',
    title: 'Full Hero Section',
    description: 'Complete high-converting banner with headline & CTA',
    icon: <Compass size={18} color="#F59E0B" />,
    content: `<section style="padding: 80px 24px; text-align: center; background: radial-gradient(circle at 50% 20%, rgba(6,182,212,0.15) 0%, rgba(15,23,42,1) 70%); min-height: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
  <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #06B6D4; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
    🚀 NEXT-GEN BUILDER ENGINE
  </span>
  <h1 style="color: #FFFFFF; font-size: 56px; font-weight: 800; line-height: 1.15; max-width: 800px; margin-bottom: 20px;">
    Build Stunning Websites at Lightning Speed
  </h1>
  <p style="color: #94A3B8; font-size: 18px; max-width: 620px; margin-bottom: 32px; line-height: 1.6;">
    Unleash complete design freedom with real-time visual editing and instant CMS data binding.
  </p>
  <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
    <a href="#get-started" style="padding: 14px 32px; background: #06B6D4; color: #000; font-weight: 700; border-radius: 10px; text-decoration: none; box-shadow: 0 10px 25px rgba(6,182,212,0.3);">
      Get Started Now
    </a>
    <a href="#learn-more" style="padding: 14px 32px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #FFFFFF; font-weight: 600; border-radius: 10px; text-decoration: none;">
      Explore Capabilities
    </a>
  </div>
</section>`,
  },
  {
    id: 'cta-button',
    category: 'interactive',
    title: 'Call to Action Button',
    description: 'Sleek rounded primary interactive button',
    icon: <MousePointerClick size={18} color="#EF4444" />,
    content: `<a href="#" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 28px; background: #3B82F6; color: #FFFFFF; font-weight: 600; font-size: 15px; border-radius: 10px; text-decoration: none; box-shadow: 0 8px 20px rgba(59,130,246,0.3); transition: all 0.2s;">
  Click Here to Continue
</a>`,
  },
  {
    id: 'pricing-card',
    category: 'interactive',
    title: 'Pricing Plan Card',
    description: 'SaaS subscription tier presentation card',
    icon: <CreditCard size={18} color="#10B981" />,
    content: `<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; max-width: 360px; display: flex; flex-direction: column; gap: 20px;">
  <div>
    <span style="font-size: 13px; font-weight: 700; color: #10B981; text-transform: uppercase;">PRO PLAN</span>
    <div style="font-size: 40px; font-weight: 800; color: #FFFFFF; margin-top: 8px;">$49 <span style="font-size: 16px; font-weight: 500; color: #64748B;">/ month</span></div>
  </div>
  <p style="color: #94A3B8; font-size: 14px; margin: 0;">Ideal for scaling startups and dynamic web creators.</p>
  <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; color: #E2E8F0; font-size: 14px;">
    <li>✔ Unlimited Visual Pages</li>
    <li>✔ Custom Media Service (Port 3004)</li>
    <li>✔ Dynamic CMS Data Binding</li>
    <li>✔ Priority 24/7 Support</li>
  </ul>
  <a href="#subscribe" style="margin-top: 10px; text-align: center; padding: 14px; background: #10B981; color: #000; font-weight: 700; border-radius: 10px; text-decoration: none;">
    Upgrade to Pro
  </a>
</div>`,
  },
  {
    id: 'faq-accordion',
    category: 'interactive',
    title: 'FAQ Box Item',
    description: 'Clean question & answer collapsible card',
    icon: <MessageSquare size={18} color="#A855F7" />,
    content: `<div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; width: 100%; max-width: 720px;">
  <h4 style="color: #F8FAFC; font-size: 17px; font-weight: 600; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
    <span>Can I bind dynamic content from Genzite CMS?</span>
    <span style="color: #06B6D4;">+</span>
  </h4>
  <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0;">
    Yes! You can connect text headers, paragraphs, and images directly to your Products, Blogs, or Store items using our Dynamic Binding Control.
  </p>
</div>`,
  },
];

export const CustomBlocksPanel: React.FC<CustomBlocksPanelProps> = ({ editor }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const activeDragBlockRef = useRef<BlockItem | null>(null);

  const categories = [
    { key: 'all', label: 'All Blocks' },
    { key: 'layout', label: 'Layout' },
    { key: 'typography', label: 'Typography' },
    { key: 'media', label: 'Media' },
    { key: 'interactive', label: 'Interactive' },
  ];

  // Combine CURATED_BLOCKS with any dynamic blocks registered inside GrapesJS BlockManager
  const allBlocks = useMemo(() => {
    const combined = [...CURATED_BLOCKS];
    const existingIds = new Set(combined.map((b) => b.id));

    if (editor?.BlockManager) {
      try {
        const bmBlocks = editor.BlockManager.getAll() || [];
        bmBlocks.forEach((b: any) => {
          const id = b.getId?.() || b.get?.('id') || b.id;
          if (id && !existingIds.has(id)) {
            const label = b.getLabel?.() || b.get?.('label') || id;
            const catLabel = b.getCategory?.()?.get?.('label') || b.get?.('category') || 'layout';
            const categoryStr = String(catLabel).toLowerCase();
            const content = b.getContent?.() || b.get?.('content') || '';

            let mappedCat: 'layout' | 'typography' | 'media' | 'interactive' = 'layout';
            if (categoryStr.includes('text') || categoryStr.includes('typo')) mappedCat = 'typography';
            else if (categoryStr.includes('image') || categoryStr.includes('video') || categoryStr.includes('media')) mappedCat = 'media';
            else if (categoryStr.includes('section') || categoryStr.includes('cta') || categoryStr.includes('template') || categoryStr.includes('interactive')) mappedCat = 'interactive';

            let titleStr = typeof label === 'string' && !label.includes('<div') ? label : id.toUpperCase();
            let descStr = 'Custom GrapesJS block item';
            if (typeof label === 'string' && label.includes('gz-block-title')) {
              const matchTitle = label.match(/<div class="gz-block-title">(.*?)<\/div>/);
              if (matchTitle?.[1]) titleStr = matchTitle[1];
              const matchDesc = label.match(/<div class="gz-block-desc">(.*?)<\/div>/);
              if (matchDesc?.[1]) descStr = matchDesc[1];
            }

            combined.push({
              id,
              category: mappedCat,
              title: titleStr,
              description: descStr,
              icon: <Box size={18} color="#06B6D4" />,
              content,
            });
            existingIds.add(id);
          }
        });
      } catch (e) {
        console.error('Error fetching dynamic BlockManager items:', e);
      }
    }
    return combined;
  }, [editor]);

  const filteredBlocks = allBlocks.filter((block) => {
    const matchesCategory = activeCategory === 'all' || block.category === activeCategory;
    const matchesSearch =
      block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInsertBlock = (block: BlockItem) => {
    if (!editor) {
      message.error('Trình chỉnh sửa GrapesJS chưa sẵn sàng');
      return;
    }

    try {
      const selected = editor.getSelected();
      if (selected) {
        selected.append(block.content);
      } else {
        const wrapper = editor.getWrapper();
        if (wrapper) {
          wrapper.append(block.content);
        }
      }
    } catch (err: any) {
      console.error('Failed to append block:', err);
      message.error('Không thể chèn khối vào Canvas');
    }
  };

  const handleDragStart = (e: React.DragEvent, block: BlockItem) => {
    if (!editor) return;
    activeDragBlockRef.current = block;
    try {
      const contentStr = typeof block.content === 'string'
        ? block.content
        : JSON.stringify(block.content);

      e.dataTransfer.setData('text/plain', contentStr);
      e.dataTransfer.setData('text/html', contentStr);
      e.dataTransfer.effectAllowed = 'copyMove';

      // Connect with GrapesJS internal BlockManager drag state so Sorter guide line shows on canvas
      const bm = editor.BlockManager;
      if (bm) {
        let gjsBlock = bm.get(block.id);
        if (!gjsBlock) {
          gjsBlock = bm.add(block.id, {
            label: block.title,
            content: block.content,
          });
        }
        if (typeof bm.__dragStart === 'function') {
          bm.__dragStart(gjsBlock, e.nativeEvent);
        } else if (typeof bm.dragStart === 'function') {
          bm.dragStart(gjsBlock);
        }
      }
    } catch (err) {
      console.error('Drag start error:', err);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    activeDragBlockRef.current = null;
    if (!editor) return;
    try {
      const bm = editor.BlockManager;
      if (bm) {
        if (typeof bm.__dragEnd === 'function') {
          bm.__dragEnd(e.nativeEvent);
        } else if (typeof bm.dragEnd === 'function') {
          bm.dragEnd();
        }
      }
    } catch (err) {
      console.error('Drag end error:', err);
    }
  };

  // Fallback drop listener on Canvas body to guarantee drag-and-drop works reliably even if Sorter misses
  useEffect(() => {
    if (!editor) return;
    try {
      const canvasBody = editor.Canvas?.getBody?.();
      if (!canvasBody) return;

      const handleDragOver = (e: DragEvent) => {
        if (activeDragBlockRef.current) {
          e.preventDefault();
        }
      };

      const handleDrop = (e: DragEvent) => {
        if (activeDragBlockRef.current) {
          e.preventDefault();
          const block = activeDragBlockRef.current;
          activeDragBlockRef.current = null;
          try {
            const bm = editor.BlockManager;
            if (bm && typeof bm.__dragEnd === 'function') {
              bm.__dragEnd(e);
            } else {
              const selected = editor.getSelected();
              if (selected) {
                selected.append(block.content);
              } else {
                const wrapper = editor.getWrapper();
                if (wrapper) {
                  wrapper.append(block.content);
                }
              }
            }
          } catch (err) {
            console.error('Canvas drop error:', err);
          }
        }
      };

      canvasBody.addEventListener('dragover', handleDragOver);
      canvasBody.addEventListener('drop', handleDrop);

      return () => {
        canvasBody.removeEventListener('dragover', handleDragOver);
        canvasBody.removeEventListener('drop', handleDrop);
      };
    } catch (e) {
      console.error('Error attaching canvas drop listener:', e);
    }
  }, [editor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingRight: 4 }}>
      {/* Search Input */}
      <div style={{ marginBottom: 12 }}>
        <Input
          placeholder="Tìm kiếm block..."
          prefix={<Search size={14} color="#64748B" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            color: '#F8FAFC',
            fontSize: 13,
          }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: activeCategory === cat.key ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeCategory === cat.key ? '#06B6D4' : '#94A3B8',
              border: activeCategory === cat.key ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Blocks Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredBlocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 12px', color: '#64748B', fontSize: 13 }}>
            Không tìm thấy component nào phù hợp.
          </div>
        ) : (
          filteredBlocks.map((block) => (
            <div
              key={block.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, block)}
              onDragEnd={(e) => handleDragEnd(e)}
              onClick={() => handleInsertBlock(block)}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 10,
                cursor: 'grab',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#06B6D4';
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Kéo thả trực tiếp vào Canvas hoặc bấm nút + để chèn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {block.icon}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {block.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {block.description}
                  </div>
                </div>
              </div>

              <Tooltip title="Bấm để chèn ngay vào Canvas">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertBlock(block);
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#06B6D4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#06B6D4';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                    e.currentTarget.style.color = '#06B6D4';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus size={16} />
                </button>
              </Tooltip>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
