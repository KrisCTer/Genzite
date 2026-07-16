import React, { useState } from 'react';
import { Database, Link2, Unlink, Sparkles, ImageIcon, CheckCircle2, Repeat, FileText, DollarSign, Calendar, Globe } from 'lucide-react';
import { ShoppingOutlined, ReadOutlined, BankOutlined, AppstoreOutlined } from '@ant-design/icons';

export interface CmsFieldOption {
  label: string;
  value: string;
  type: 'text' | 'number' | 'image' | 'link' | 'date' | 'rich-text';
  sample?: string;
}

export const CMS_COLLECTIONS: Record<string, { name: string; icon: React.ReactNode; description: string; fields: CmsFieldOption[] }> = {
  products: {
    name: 'Products Catalog',
    icon: <ShoppingOutlined style={{ color: '#06B6D4' }} />,
    description: 'Dynamic eCommerce products dataset',
    fields: [
      { label: 'Product Title', value: '{{ product.title }}', type: 'text', sample: 'Genzite Pro Hoodie' },
      { label: 'Price (Formatted)', value: '{{ product.price_formatted }}', type: 'number', sample: '450,000 VND' },
      { label: 'Short Description', value: '{{ product.description }}', type: 'rich-text', sample: 'High quality cotton hoodie with modern fit.' },
      { label: 'Main Thumbnail', value: '{{ product.image }}', type: 'image', sample: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80' },
      { label: 'Category Name', value: '{{ product.category.name }}', type: 'text', sample: 'Streetwear' },
      { label: 'Product Detail Link', value: '{{ product.url }}', type: 'link', sample: '/products/genzite-pro-hoodie' },
      { label: 'SKU Code', value: '{{ product.sku }}', type: 'text', sample: 'GZ-HOODIE-01' },
    ],
  },
  blogs: {
    name: 'Articles & News',
    icon: <ReadOutlined style={{ color: '#A855F7' }} />,
    description: 'Blog posts and news updates collection',
    fields: [
      { label: 'Article Headline', value: '{{ article.title }}', type: 'text', sample: 'Top 10 Web Design Trends for 2026' },
      { label: 'Excerpt / Summary', value: '{{ article.excerpt }}', type: 'text', sample: 'Discover how AI page builders and modern visual tools are reshaping web development.' },
      { label: 'Cover Image', value: '{{ article.cover_image }}', type: 'image', sample: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80' },
      { label: 'Author Name', value: '{{ article.author.name }}', type: 'text', sample: 'Alex Nguyen' },
      { label: 'Author Avatar', value: '{{ article.author.avatar }}', type: 'image', sample: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { label: 'Publish Date', value: '{{ article.published_at }}', type: 'date', sample: '14/07/2026' },
      { label: 'Article URL', value: '{{ article.url }}', type: 'link', sample: '/blog/web-design-trends-2026' },
    ],
  },
  store: {
    name: 'Store Settings',
    icon: <BankOutlined style={{ color: '#10B981' }} />,
    description: 'Global site identity and contact info',
    fields: [
      { label: 'Store Name', value: '{{ store.name }}', type: 'text', sample: 'Genzite Studio' },
      { label: 'Support Email', value: '{{ store.email }}', type: 'text', sample: 'support@genzite.io' },
      { label: 'Hotline / Phone', value: '{{ store.phone }}', type: 'text', sample: '1900 8888 99' },
      { label: 'Address Text', value: '{{ store.address }}', type: 'text', sample: 'Bitexco Financial Tower, District 1, HCMC' },
      { label: 'Store Logo URL', value: '{{ store.logo }}', type: 'image', sample: 'https://cdn.genzite.io/logo.png' },
    ],
  },
};

interface DynamicBindingControlProps {
  tag: string;
  attrs: Record<string, any>;
  updateAttr: (attrs: Record<string, any>) => void;
  updateContent?: (content: string) => void;
}

export const DynamicBindingControl: React.FC<DynamicBindingControlProps> = ({ tag, attrs, updateAttr, updateContent }) => {
  const currentSource = attrs['data-gz-cms-source'] || 'static';
  const currentField = attrs['data-gz-cms-field'] || '';
  const isRepeater = attrs['data-gz-cms-repeater'] === 'true';

  const [selectedCollection, setSelectedCollection] = useState<string>(currentSource !== 'static' ? currentSource : 'products');

  const isConnected = currentSource !== 'static' && Boolean(currentField);
  const isImageElement = tag === 'img';

  const availableCollection = CMS_COLLECTIONS[selectedCollection] || CMS_COLLECTIONS.products;

  // Filter fields based on element type (show images primarily for img tag, text primarily for text tags, or all)
  const filteredFields = availableCollection.fields.filter(f => {
    if (isImageElement) return f.type === 'image' || f.type === 'text' || f.type === 'link';
    return true;
  });

  const handleConnect = (fieldVal: string, fieldType: string, fieldSample?: string) => {
    updateAttr({
      'data-gz-cms-source': selectedCollection,
      'data-gz-cms-field': fieldVal,
    });

    // If text element and updateContent is available, update canvas text to show data binding tag
    if (!isImageElement && updateContent && fieldSample) {
      updateContent(`[CMS: ${fieldVal}]`);
    } else if (isImageElement && fieldSample && fieldType === 'image') {
      updateAttr({
        src: fieldSample,
        'data-gz-cms-source': selectedCollection,
        'data-gz-cms-field': fieldVal,
      });
    }
  };

  const handleDisconnect = () => {
    updateAttr({
      'data-gz-cms-source': 'static',
      'data-gz-cms-field': '',
    });
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={13} color="#EC4899" />;
      case 'number': return <DollarSign size={13} color="#10B981" />;
      case 'date': return <Calendar size={13} color="#F59E0B" />;
      case 'link': return <Globe size={13} color="#3B82F6" />;
      default: return <FileText size={13} color="#06B6D4" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Info */}
      <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <Database size={15} /> Dynamic CMS Binding
          </div>
          {isConnected ? (
            <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '2px 8px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} /> Connected
            </span>
          ) : (
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', color: '#94A3B8', padding: '2px 8px', borderRadius: 12 }}>
              Unbound
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
          Connect this <strong>&lt;{tag}&gt;</strong> element directly to Genzite collections. When published, real data from the database will automatically replace this element's content.
        </p>
      </div>

      {/* Connected State Banner */}
      {isConnected && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: 12, position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Active Data Binding</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            {CMS_COLLECTIONS[currentSource]?.icon || <AppstoreOutlined style={{ color: '#06B6D4' }} />} {CMS_COLLECTIONS[currentSource]?.name || currentSource}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#34D399', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 10 }}>
            {currentField}
          </div>
          
          <button
            onClick={handleDisconnect}
            style={{
              width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#EF4444', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s'
            }}
          >
            <Unlink size={13} /> Disconnect Binding (Revert to Static)
          </button>
        </div>
      )}

      {/* Collection Selector */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          1. Select CMS Collection
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
          {Object.entries(CMS_COLLECTIONS).map(([key, col]) => {
            const isSelected = selectedCollection === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedCollection(key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                  background: isSelected ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.07)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{col.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#fff' : '#E2E8F0' }}>
                      {col.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>{col.description}</div>
                  </div>
                </div>
                {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06B6D4' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Picker */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          2. Select Field to Bind ({isImageElement ? 'Image Fields' : 'Text / Data Fields'})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {filteredFields.map(f => {
            const isFieldActive = currentField === f.value;
            return (
              <div
                key={f.value}
                onClick={() => handleConnect(f.value, f.type, f.sample)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  background: isFieldActive ? '#06B6D4' : 'rgba(255,255,255,0.04)',
                  border: isFieldActive ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.08)',
                  color: isFieldActive ? '#fff' : '#CBD5E1',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{getFieldIcon(f.type)}</span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: isFieldActive ? 700 : 500 }}>{f.label}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: isFieldActive ? 'rgba(255,255,255,0.85)' : '#64748B' }}>
                      {f.value}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isFieldActive ? (
                    <CheckCircle2 size={15} color="#fff" />
                  ) : (
                    <Link2 size={14} style={{ color: '#64748B' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repeater / Collection List Option */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 12, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Repeat size={15} style={{ color: '#06B6D4' }} />
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#F8FAFC' }}>Collection List Repeater</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Repeat this container for each item in collection</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isRepeater}
            onChange={e => updateAttr({ 'data-gz-cms-repeater': e.target.checked ? 'true' : 'false' })}
            style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#06B6D4' }}
          />
        </div>
        {isRepeater && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 10, color: '#06B6D4', borderTop: '1px dashed rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 8, lineHeight: 1.4 }}>
            <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>This element will automatically clone and populate each item from <strong>{selectedCollection}</strong> when rendered!</span>
          </div>
        )}
      </div>
    </div>
  );
};
