/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Database, MousePointerClick, Link, Lightbulb, Repeat, Sparkles, ExternalLink } from 'lucide-react';
import { Tooltip } from 'antd';

// ─── Color Picker ─────────────────────────────────────────────────────────────
const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();

interface ColorPickerProps { label: string; value: string; onChange: (hex: string) => void; }

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value || '#000000');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const gradientRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value || !/^#[0-9a-fA-F]{3,8}$/.test(value)) return;
    const h = value.toUpperCase();
    setHex(h);
    const r = hexToRgb(h);
    setRgb(r);
    const hsl = rgbToHsl(r.r, r.g, r.b);
    setHue(hsl.h); setSaturation(hsl.s); setLightness(hsl.l);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const applyHsl = useCallback((h: number, s: number, l: number) => {
    const newRgb = hslToRgb(h, s, l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setRgb(newRgb); setHex(newHex); setHue(h); setSaturation(s); setLightness(l);
    onChange(newHex);
  }, [onChange]);

  const handleGradientMouseDown = (e: React.MouseEvent) => {
    const update = (me: MouseEvent) => {
      if (!gradientRef.current) return;
      const rect = gradientRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height));
      applyHsl(hue, x * 100, (1 - y) * 50);
    };
    update(e.nativeEvent);
    const up = () => { document.removeEventListener('mousemove', update); };
    document.addEventListener('mousemove', update);
    document.addEventListener('mouseup', up, { once: true });
  };

  const dotX = saturation;
  const dotY = 100 - (lightness / 50) * 100;

  return (
    <div style={{ position: 'relative' }} ref={popRef}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: hex, border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{hex}</span>
        <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>{label}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 32, width: 216, background: '#1a2234', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, zIndex: 9999, boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
          {/* Gradient */}
          <div ref={gradientRef} onMouseDown={handleGradientMouseDown} style={{ width: '100%', height: 130, borderRadius: 6, marginBottom: 10, cursor: 'crosshair', position: 'relative', background: `linear-gradient(to bottom, white, black), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`, backgroundBlendMode: 'multiply' }}>
            <div style={{ position: 'absolute', left: `${dotX}%`, top: `${dotY}%`, width: 13, height: 13, borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.5)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', background: hex }} />
          </div>
          {/* Hue */}
          <input type="range" min={0} max={360} step={1} value={hue} onChange={e => applyHsl(Number(e.target.value), saturation, lightness)} style={{ width: '100%', height: 10, borderRadius: 5, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', marginBottom: 10, background: 'linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)', outline: 'none' }} />
          {/* Hex */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 3 }}>Hex</div>
            <input value={hex} onChange={e => {
              const v = e.target.value.toUpperCase(); setHex(v);
              if (/^#[0-9A-F]{6}$/.test(v)) {
                const r = hexToRgb(v); setRgb(r);
                const hsl = rgbToHsl(r.r, r.g, r.b);
                setHue(hsl.h); setSaturation(hsl.s); setLightness(hsl.l); onChange(v);
              }
            }} style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '5px 7px', color: '#F8FAFC', fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {/* RGB */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
            {(['r', 'g', 'b'] as const).map(c => (
              <div key={c}>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 3, textTransform: 'uppercase' }}>{c}</div>
                <input type="number" min={0} max={255} value={rgb[c]} onChange={e => {
                  const nr = { ...rgb, [c]: Number(e.target.value) };
                  const newHex = rgbToHex(nr.r, nr.g, nr.b);
                  setRgb(nr); setHex(newHex);
                  const hsl = rgbToHsl(nr.r, nr.g, nr.b);
                  setHue(hsl.h); setSaturation(hsl.s); setLightness(hsl.l); onChange(newHex);
                }} style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '4px 5px', color: '#F8FAFC', fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Number Input ─────────────────────────────────────────────────────────────
const NumInput: React.FC<{ label: string; value: number; unit?: string; onChange: (v: number) => void }> = ({ label, value, unit = 'px', onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
    <span style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>{label}</span>
    <div style={{ position: 'relative' }}>
      <input type="number" min={0} value={value || 0} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 26px 5px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
      <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#475569', pointerEvents: 'none' }}>{unit}</span>
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7, marginTop: 2 }}>
    {children}
  </div>
);

// ─── Wix-Style CMS Fields ─────────────────────────────────────────────────────
const CMS_FIELDS: Record<string, Array<{ label: string; value: string; type: 'text' | 'image' | 'link' | 'all' }>> = {
  products: [
    { label: '-- Select Product Field --', value: '', type: 'all' },
    { label: 'Title ({{ product.title }})', value: '{{ product.title }}', type: 'text' },
    { label: 'Price ({{ product.price }})', value: '{{ product.price }}', type: 'text' },
    { label: 'Original Price ({{ product.originalPrice }})', value: '{{ product.originalPrice }}', type: 'text' },
    { label: 'Category ({{ product.category }})', value: '{{ product.category }}', type: 'text' },
    { label: 'Short Excerpt ({{ product.excerpt }})', value: '{{ product.excerpt }}', type: 'text' },
    { label: 'Description ({{ product.description }})', value: '{{ product.description }}', type: 'text' },
    { label: 'SKU Code ({{ product.sku }})', value: '{{ product.sku }}', type: 'text' },
    { label: 'Main Image ({{ product.image }})', value: '{{ product.image }}', type: 'image' },
    { label: 'Hover Image ({{ product.hoverImage }})', value: '{{ product.hoverImage }}', type: 'image' },
    { label: 'Detail Page URL ({{ product.url }})', value: '{{ product.url }}', type: 'link' },
    { label: 'Add to Cart URL ({{ product.addToCartUrl }})', value: '{{ product.addToCartUrl }}', type: 'link' },
  ],
  blogs: [
    { label: '-- Select Article Field --', value: '', type: 'all' },
    { label: 'Article Title ({{ blog.title }})', value: '{{ blog.title }}', type: 'text' },
    { label: 'Short Excerpt ({{ blog.excerpt }})', value: '{{ blog.excerpt }}', type: 'text' },
    { label: 'Author ({{ blog.author }})', value: '{{ blog.author }}', type: 'text' },
    { label: 'Published Date ({{ blog.publishedDate }})', value: '{{ blog.publishedDate }}', type: 'text' },
    { label: 'Category ({{ blog.category }})', value: '{{ blog.category }}', type: 'text' },
    { label: 'Cover Image ({{ blog.image }})', value: '{{ blog.image }}', type: 'image' },
    { label: 'Detail Page URL ({{ blog.url }})', value: '{{ blog.url }}', type: 'link' },
  ],
  store: [
    { label: '-- Select Store Field --', value: '', type: 'all' },
    { label: 'Store Name ({{ store.name }})', value: '{{ store.name }}', type: 'text' },
    { label: 'Phone Hotline ({{ store.phone }})', value: '{{ store.phone }}', type: 'text' },
    { label: 'Support Email ({{ store.email }})', value: '{{ store.email }}', type: 'text' },
    { label: 'Store Address ({{ store.address }})', value: '{{ store.address }}', type: 'text' },
    { label: 'Working Hours ({{ store.workingHours }})', value: '{{ store.workingHours }}', type: 'text' },
    { label: 'Store Logo URL ({{ store.logo }})', value: '{{ store.logo }}', type: 'image' },
  ]
};

// ─── Props Panel ─────────────────────────────────────────────────────────────
interface EditRightPanelProps { isOpen: boolean; }

const EditRightPanel: React.FC<EditRightPanelProps> = ({ isOpen }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'cms'>('style');
  const [styles, setStyles] = useState<Record<string, any>>({});
  const [attrs, setAttrs] = useState<Record<string, any>>({});
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [compId, setCompId] = useState('');
  const statesRef = useRef<Record<string, any>>({});

  // Listen for GrapesJS events via custom DOM event
  useEffect(() => {
    const handler = (e: any) => {
      const { component } = e.detail || {};
      if (!component) {
        setStyles({});
        setAttrs({});
        setContent('');
        setTag('');
        setCompId('');
        return;
      }
      const s = component.getStyle?.() || {};
      const a = component.getAttributes?.() || {};
      const t = component.get?.('tagName') || component.getName?.() || 'element';
      const id = component.getId?.() || '';

      let cText = '';
      try {
        const comps = component.components();
        if (comps && comps.length === 1 && comps.at(0)?.is('textnode')) {
          cText = comps.at(0)?.get('content') || '';
        } else if (typeof component.get('content') === 'string') {
          cText = component.get('content') || '';
        } else {
          cText = component.getEl()?.innerText || '';
        }
      } catch (err) {}

      setStyles(s);
      statesRef.current = s;
      setAttrs(a);
      setContent(cText);
      setTag(t);
      setCompId(id);
    };
    window.addEventListener('genzite:grapes:select', handler);
    return () => window.removeEventListener('genzite:grapes:select', handler);
  }, []);

  const get = (key: string, fallback = '') => styles[key] || fallback;
  const getNum = (key: string, fallback = 0) => parseInt(get(key, String(fallback))) || fallback;

  const update = (patch: Record<string, string>) => {
    window.dispatchEvent(new CustomEvent('genzite:grapes:setstyle', { detail: patch }));
    setStyles(prev => ({ ...prev, ...patch }));
  };

  const updateAttr = (patch: Record<string, string>) => {
    window.dispatchEvent(new CustomEvent('genzite:grapes:setattr', { detail: patch }));
    setAttrs(prev => ({ ...prev, ...patch }));
  };

  const updateContent = (newText: string) => {
    window.dispatchEvent(new CustomEvent('genzite:grapes:setcontent', { detail: { content: newText } }));
    setContent(newText);
  };

  const bold = get('font-weight') === 'bold' || get('font-weight') === '700';
  const italic = get('font-style') === 'italic';
  const underline = get('text-decoration')?.includes('underline');
  const strikethrough = get('text-decoration')?.includes('line-through');
  const align = get('text-align', 'left');

  const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Poppins', 'Montserrat', 'Lato', 'Open Sans', 'Georgia', 'Source Code Pro'];
  const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double'];

  const pillBtn = (active: boolean, onClick: () => void, content: React.ReactNode, title?: string) => (
    <button title={title} onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, borderRadius: 6, background: active ? '#06B6D4' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`, color: active ? '#fff' : '#94A3B8', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 400, transition: 'all 0.15s', flexShrink: 0 }}>
      {content}
    </button>
  );

  return (
    <div style={{
      width: isOpen ? 280 : 0,
      minWidth: isOpen ? 280 : 0,
      height: '100%',
      background: '#0f172a',
      borderLeft: '1px solid #1E293B',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'clip',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#F8FAFC',
      zIndex: 10,
    }}>
      {/* Header exactly matching EditLeftPanel */}
      <div style={{ 
        padding: '16px 16px 12px', 
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: 14, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Properties
          </h3>
          {tag && (
            <span style={{ background: 'rgba(6,182,212,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)', textTransform: 'lowercase' }}>
              {tag}
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Tooltip title="Design" placement="bottom">
            <div 
              onClick={() => setActiveTab('style')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                color: activeTab === 'style' ? '#fff' : '#94A3B8',
                background: activeTab === 'style' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Palette size={18} />
            </div>
          </Tooltip>
          <Tooltip title="CMS" placement="bottom">
            <div 
              onClick={() => setActiveTab('cms')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                color: activeTab === 'cms' ? '#fff' : '#94A3B8',
                background: activeTab === 'cms' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={18} />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', boxSizing: 'border-box' }}>
        {!tag && (
          <div style={{ textAlign: 'center', color: '#475569', marginTop: 50, fontSize: 13, padding: '0 12px' }}>
            <MousePointerClick size={32} style={{ margin: '0 auto 12px', color: '#64748B' }} />
            <div style={{ fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>No element selected</div>
            <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>Click an element on the canvas to edit {activeTab === 'style' ? 'its styles & layout' : 'CMS data & properties'}.</p>
          </div>
        )}

        {tag && activeTab === 'style' && (
          <>
            {/* SIZE */}
            <SectionTitle>Size</SectionTitle>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <NumInput label="Width" value={getNum('width')} onChange={v => update({ width: v + 'px' })} />
              <NumInput label="Height" value={getNum('height')} onChange={v => update({ height: v + 'px' })} />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

            {/* PADDING */}
            <SectionTitle>Padding</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 14 }}>
              <NumInput label="Top" value={getNum('padding-top')} onChange={v => update({ 'padding-top': v + 'px' })} />
              <NumInput label="Right" value={getNum('padding-right')} onChange={v => update({ 'padding-right': v + 'px' })} />
              <NumInput label="Bottom" value={getNum('padding-bottom')} onChange={v => update({ 'padding-bottom': v + 'px' })} />
              <NumInput label="Left" value={getNum('padding-left')} onChange={v => update({ 'padding-left': v + 'px' })} />
            </div>

            {/* MARGIN */}
            <SectionTitle>Margin</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 14 }}>
              <NumInput label="Top" value={getNum('margin-top')} onChange={v => update({ 'margin-top': v + 'px' })} />
              <NumInput label="Right" value={getNum('margin-right')} onChange={v => update({ 'margin-right': v + 'px' })} />
              <NumInput label="Bottom" value={getNum('margin-bottom')} onChange={v => update({ 'margin-bottom': v + 'px' })} />
              <NumInput label="Left" value={getNum('margin-left')} onChange={v => update({ 'margin-left': v + 'px' })} />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

            {/* TEXT COLOR */}
            <SectionTitle>Text Color</SectionTitle>
            <div style={{ marginBottom: 14 }}>
              <ColorPicker label="Color" value={get('color', '#FFFFFF')} onChange={v => update({ color: v })} />
            </div>

            {/* TEXT / TYPOGRAPHY */}
            <SectionTitle>Text</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {/* Font family */}
              <div>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Font Family</div>
                <select value={get('font-family', 'Inter')} onChange={e => update({ 'font-family': e.target.value })} style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Style buttons */}
              <div>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>Style</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {pillBtn(bold, () => update({ 'font-weight': bold ? 'normal' : 'bold' }), <b>B</b>, 'Bold')}
                  {pillBtn(italic, () => update({ 'font-style': italic ? 'normal' : 'italic' }), <i>I</i>, 'Italic')}
                  {pillBtn(underline, () => update({ 'text-decoration': underline ? 'none' : 'underline' }), <u style={{ textDecoration: 'underline' }}>U</u>, 'Underline')}
                  {pillBtn(strikethrough, () => update({ 'text-decoration': strikethrough ? 'none' : 'line-through' }), <s>S</s>, 'Strikethrough')}
                </div>
              </div>

              {/* Align */}
              <div>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>Align</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {(['left', 'center', 'right', 'justify'] as const).map(a => (
                    <button key={a} onClick={() => update({ 'text-align': a })} title={`Align ${a}`} style={{ flex: 1, height: 28, borderRadius: 6, background: align === a ? '#06B6D4' : 'rgba(255,255,255,0.05)', border: `1px solid ${align === a ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`, color: align === a ? '#fff' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {a === 'left' && <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><rect y="0" width="14" height="2" rx="1"/><rect y="4" width="10" height="2" rx="1"/><rect y="8" width="12" height="2" rx="1"/></svg>}
                      {a === 'center' && <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><rect y="0" width="14" height="2" rx="1"/><rect x="2" y="4" width="10" height="2" rx="1"/><rect x="1" y="8" width="12" height="2" rx="1"/></svg>}
                      {a === 'right' && <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><rect y="0" width="14" height="2" rx="1"/><rect x="4" y="4" width="10" height="2" rx="1"/><rect x="2" y="8" width="12" height="2" rx="1"/></svg>}
                      {a === 'justify' && <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><rect y="0" width="14" height="2" rx="1"/><rect y="4" width="14" height="2" rx="1"/><rect y="8" width="14" height="2" rx="1"/></svg>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size + Line height */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                <NumInput label="Font size (px)" value={getNum('font-size', 14)} onChange={v => update({ 'font-size': v + 'px' })} />
                <NumInput label="Line height (px)" value={getNum('line-height', 20)} onChange={v => update({ 'line-height': String(v) })} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

            {/* BORDER COLOR */}
            <SectionTitle>Border Color</SectionTitle>
            <div style={{ marginBottom: 14 }}>
              <ColorPicker label="Color" value={get('border-color', '#1E293B')} onChange={v => update({ 'border-color': v })} />
            </div>

            {/* BORDER */}
            <SectionTitle>Border</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 5, fontWeight: 500 }}>Style</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {BORDER_STYLES.map(bs => (
                    <button key={bs} onClick={() => update({ 'border-style': bs })} style={{ padding: '3px 9px', borderRadius: 5, fontSize: 11, cursor: 'pointer', background: get('border-style', 'none') === bs ? '#06B6D4' : 'rgba(255,255,255,0.05)', border: `1px solid ${get('border-style', 'none') === bs ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`, color: get('border-style', 'none') === bs ? '#fff' : '#94A3B8', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                      {bs}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                <NumInput label="Width" value={getNum('border-width')} onChange={v => update({ 'border-width': v + 'px' })} />
                <NumInput label="Radius" value={getNum('border-radius')} onChange={v => update({ 'border-radius': v + 'px' })} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

            {/* BACKGROUND COLOR */}
            <SectionTitle>Background Color</SectionTitle>
            <div style={{ marginBottom: 14 }}>
              <ColorPicker label="Background" value={get('background-color', '#111827')} onChange={v => update({ 'background-color': v })} />
            </div>
          </>
        )}

        {tag && activeTab === 'cms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Section 1: CMS Data Source */}
            <div>
              <SectionTitle>Data Source (CMS)</SectionTitle>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8, lineHeight: 1.4 }}>
                Connect this element to Genzite CMS dynamic datasets.
              </div>
              <select
                value={attrs['data-gz-cms-source'] || 'static'}
                onChange={e => updateAttr({ 'data-gz-cms-source': e.target.value })}
                style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer', marginBottom: 10 }}
              >
                <option value="static">Unlinked (Static Data)</option>
                <option value="products">Products (Products CMS)</option>
                <option value="blogs">Articles (Blogs & News)</option>
                <option value="store">Store Information</option>
                <option value="custom">Custom API (Custom Variable)</option>
              </select>

              {attrs['data-gz-cms-source'] && attrs['data-gz-cms-source'] !== 'static' && (
                <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 8, padding: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#06B6D4', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
                    <Link size={13} /> Select Data Field (Wix Field Binding)
                  </div>
                  
                  {attrs['data-gz-cms-source'] !== 'custom' ? (
                    <select
                      value={attrs['data-gz-cms-field'] || ''}
                      onChange={e => updateAttr({ 'data-gz-cms-field': e.target.value })}
                      style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer', marginBottom: 8 }}
                    >
                      {(CMS_FIELDS[attrs['data-gz-cms-source']] || []).map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      placeholder="e.g. {{ custom.apiField }}"
                      value={attrs['data-gz-cms-field'] || ''}
                      onChange={e => updateAttr({ 'data-gz-cms-field': e.target.value })}
                      style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 10, color: '#94A3B8', lineHeight: 1.4 }}>
                    <Lightbulb size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
                    <span><strong>Wix Data Binding:</strong> Element content will be dynamically replaced by the selected field from <strong>{attrs['data-gz-cms-source']}</strong>.</span>
                  </div>
                </div>
              )}

              {/* Wix Repeater Mode Toggle */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 10, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: attrs['data-gz-cms-repeater'] === 'true' ? 8 : 0 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#F8FAFC' }}>
                      <Repeat size={14} style={{ color: '#06B6D4' }} /> List Repeater (Wix Repeater)
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Automatically repeat this block based on CMS items</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={attrs['data-gz-cms-repeater'] === 'true'}
                    onChange={e => updateAttr({ 'data-gz-cms-repeater': e.target.checked ? 'true' : 'false' })}
                    style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#06B6D4' }}
                  />
                </div>
                {attrs['data-gz-cms-repeater'] === 'true' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 10, color: '#06B6D4', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8, lineHeight: 1.4 }}>
                    <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>This element (and its inner components) will automatically duplicate to match the collection item count when published!</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

            {/* Section 2: Content / Media */}
            <div>
              <SectionTitle>Content & Media</SectionTitle>
              {tag === 'img' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Image URL</div>
                    <input
                      placeholder="https://..."
                      value={attrs.src || ''}
                      onChange={e => updateAttr({ src: e.target.value })}
                      style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Alt Text</div>
                    <input
                      placeholder="Image description..."
                      value={attrs.alt || ''}
                      onChange={e => updateAttr({ alt: e.target.value })}
                      style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              ) : (tag === 'a' || tag === 'button') ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#06B6D4', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
                      <ExternalLink size={13} /> Click Action
                    </div>
                    
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Action Type</div>
                    <select
                      value={attrs['data-gz-action-type'] || 'url'}
                      onChange={e => {
                        const type = e.target.value;
                        updateAttr({ 'data-gz-action-type': type });
                      }}
                      style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '6px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer', marginBottom: 8 }}
                    >
                      <option value="url">Open Website Link (URL / Href)</option>
                      <option value="page">Navigate to Another Page (Internal Page)</option>
                      <option value="scroll">Scroll to Section on Page (Scroll to ID)</option>
                    </select>

                    {attrs['data-gz-action-type'] === 'page' ? (
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Select Target Page</div>
                        <select
                          value={attrs.href || attrs['data-gz-href'] || '/products'}
                          onChange={e => {
                            const val = e.target.value;
                            if (tag === 'a') {
                              updateAttr({ href: val, 'data-gz-href': val });
                            } else {
                              updateAttr({ 'data-gz-href': val, onclick: `window.location.href='${val}'` });
                            }
                          }}
                          style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '6px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="/">Home Page (/)</option>
                          <option value="/products">Products Page (/products)</option>
                          <option value="/about">About Page (/about)</option>
                          <option value="/contact">Contact Page (/contact)</option>
                          <option value="/pricing">Pricing Page (/pricing)</option>
                          <option value="/login">Login Page (/login)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>
                          {attrs['data-gz-action-type'] === 'scroll' ? 'Section ID (e.g. #section-contact)' : 'Link URL (e.g. https://... or /path)'}
                        </div>
                        <input
                          placeholder={attrs['data-gz-action-type'] === 'scroll' ? '#section-id' : 'https://...'}
                          value={attrs.href || attrs['data-gz-href'] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (tag === 'a') {
                              updateAttr({ href: val, 'data-gz-href': val });
                            } else {
                              updateAttr({ 'data-gz-href': val, onclick: `window.location.href='${val}'` });
                            }
                          }}
                          style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '6px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Open Target</div>
                    <select
                      value={attrs.target || '_self'}
                      onChange={e => updateAttr({ target: e.target.value })}
                      style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="_self">Current Tab (_self)</option>
                      <option value="_blank">New Tab/Window (_blank)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Button Label</div>
                    <textarea
                      rows={2}
                      value={content}
                      onChange={e => updateContent(e.target.value)}
                      style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Element Text</div>
                  <textarea
                    rows={4}
                    placeholder="Enter text content for this element..."
                    value={content}
                    onChange={e => updateContent(e.target.value)}
                    style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.4 }}
                  />
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

            {/* Section 3: Element ID & Class */}
            <div>
              <SectionTitle>Element ID & Class</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Element ID</div>
                  <input
                    readOnly
                    value={compId}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '6px 8px', color: '#94A3B8', fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Technical Information</div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
                    Use the visual toolbar on the canvas to adjust positioning, layering, selection borders, and effects.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden GrapesJS slots */}
      <div style={{ display: 'none' }}>
        <div id="gjs-selectors" />
        <div id="gjs-styles" />
        <div id="gjs-traits" />
      </div>
    </div>
  );
};

export default EditRightPanel;
