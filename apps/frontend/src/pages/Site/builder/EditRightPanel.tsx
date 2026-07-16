/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, MousePointerClick, Link, ExternalLink, Settings, ChevronDown, ChevronRight, Layout, Box, Type, Image as ImageIcon } from 'lucide-react';
import { Tooltip, Select } from 'antd';
import { StopOutlined, FileTextOutlined, GlobalOutlined, AimOutlined, SettingOutlined } from '@ant-design/icons';
import { DynamicBindingControl } from './components/DynamicBindingControl';

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

// ─── Accordion Header (Instatic Style) ────────────────────────────────────────
const AccordionHeader: React.FC<{ title: string; icon: React.ReactNode; isOpen: boolean; onToggle: () => void; badge?: string }> = ({ title, icon, isOpen, onToggle, badge }) => (
  <div onClick={onToggle} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', background: isOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer',
    userSelect: 'none', transition: 'all 0.15s', marginBottom: isOpen ? 12 : 6
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: isOpen ? '#F8FAFC' : '#CBD5E1' }}>
      <span style={{ color: isOpen ? '#06B6D4' : '#64748B', display: 'flex' }}>{icon}</span>
      <span>{title}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {badge && <span style={{ fontSize: 10, background: 'rgba(6,182,212,0.15)', color: '#06B6D4', padding: '1px 6px', borderRadius: 4 }}>{badge}</span>}
      {isOpen ? <ChevronDown size={14} color="#94A3B8" /> : <ChevronRight size={14} color="#64748B" />}
    </div>
  </div>
);

// ─── Interactive Box Model (Webflow/Instatic Style) ───────────────────────────
const SpacingBoxModel: React.FC<{ getNum: (k: string) => number; update: (p: Record<string, string>) => void; width: string; height: string }> = ({ getNum, update, width, height }) => {
  const inputStyle = (isPadding = false): React.CSSProperties => ({
    width: '100%',
    height: 22,
    background: isPadding ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.05)',
    border: isPadding ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 11,
    color: isPadding ? '#06B6D4' : '#F8FAFC',
    padding: '0 2px',
    outline: 'none',
    fontWeight: isPadding ? 600 : 400,
  });

  return (
    <div style={{ background: '#0B0F19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '22px 6px 6px 6px', position: 'relative', userSelect: 'none', marginBottom: 14, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', letterSpacing: 1, position: 'absolute', top: 5, left: 8 }}>MARGIN</div>
      
      {/* Margin Top */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <input type="number" title="Margin Top" value={getNum('margin-top')} onChange={e => update({ 'margin-top': (parseInt(e.target.value) || 0) + 'px' })} style={{ ...inputStyle(), width: 38 }} />
      </div>
      
      {/* Middle Row Grid: [Margin Left] [Padding Box (minmax 0, 1fr)] [Margin Right] */}
      <div style={{ display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr) 36px', alignItems: 'center', gap: 5, width: '100%' }}>
        <input type="number" title="Margin Left" value={getNum('margin-left')} onChange={e => update({ 'margin-left': (parseInt(e.target.value) || 0) + 'px' })} style={inputStyle()} />
        
        {/* Padding Box */}
        <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px dashed rgba(6,182,212,0.35)', borderRadius: 6, padding: '18px 4px 4px 4px', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: '#06B6D4', letterSpacing: 0.8, position: 'absolute', top: 3, left: 6 }}>PADDING</div>
          
          {/* Padding Top */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <input type="number" title="Padding Top" value={getNum('padding-top')} onChange={e => update({ 'padding-top': (parseInt(e.target.value) || 0) + 'px' })} style={{ ...inputStyle(true), width: 36 }} />
          </div>
          
          {/* Inner Grid: [Padding Left] [Center Size Box] [Padding Right] */}
          <div style={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) 34px', alignItems: 'center', gap: 4, width: '100%' }}>
            <input type="number" title="Padding Left" value={getNum('padding-left')} onChange={e => update({ 'padding-left': (parseInt(e.target.value) || 0) + 'px' })} style={inputStyle(true)} />
            
            {/* Center Size Box */}
            <div
              title={`${width || 'auto'} × ${height || 'auto'}`}
              style={{
                height: 24, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9.5, color: '#E2E8F0', fontWeight: 600, overflow: 'hidden',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '0 2px'
              }}
            >
              {width && width !== 'auto' ? Math.round(parseFloat(width)) + 'px' : 'auto'} × {height && height !== 'auto' ? Math.round(parseFloat(height)) + 'px' : 'auto'}
            </div>
            
            <input type="number" title="Padding Right" value={getNum('padding-right')} onChange={e => update({ 'padding-right': (parseInt(e.target.value) || 0) + 'px' })} style={inputStyle(true)} />
          </div>
          
          {/* Padding Bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <input type="number" title="Padding Bottom" value={getNum('padding-bottom')} onChange={e => update({ 'padding-bottom': (parseInt(e.target.value) || 0) + 'px' })} style={{ ...inputStyle(true), width: 36 }} />
          </div>
        </div>
        
        <input type="number" title="Margin Right" value={getNum('margin-right')} onChange={e => update({ 'margin-right': (parseInt(e.target.value) || 0) + 'px' })} style={inputStyle()} />
      </div>
      
      {/* Margin Bottom */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <input type="number" title="Margin Bottom" value={getNum('margin-bottom')} onChange={e => update({ 'margin-bottom': (parseInt(e.target.value) || 0) + 'px' })} style={{ ...inputStyle(), width: 38 }} />
      </div>
    </div>
  );
};

// ─── Quick Color Tokens (Design Tokens Swatches) ──────────────────────────────
const QuickColorSwatches: React.FC<{ value: string; onChange: (hex: string) => void }> = ({ value, onChange }) => {
  const SWATCHES = ['#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#0F172A', '#FFFFFF'];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {SWATCHES.map(s => (
        <div
          key={s}
          onClick={() => onChange(s)}
          title={s}
          style={{
            width: 18, height: 18, borderRadius: 4, background: s, cursor: 'pointer',
            border: value.toUpperCase() === s ? '2px solid #06B6D4' : '1px solid rgba(255,255,255,0.2)',
            boxShadow: value.toUpperCase() === s ? '0 0 8px rgba(6,182,212,0.6)' : 'none',
            transition: 'all 0.15s'
          }}
        />
      ))}
    </div>
  );
};

// ─── Wix-Style CMS Fields ─────────────────────────────────────────────────────

// ─── Props Panel ─────────────────────────────────────────────────────────────
interface EditRightPanelProps { 
  isOpen: boolean; 
  selectedWidget?: any; 
  onUpdateWidgetContent?: (cfg: any) => void; 
  isGrapesPage?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const EditRightPanel: React.FC<EditRightPanelProps> = ({ isOpen, selectedWidget, onUpdateWidgetContent, isGrapesPage = false, setIsOpen }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'content'>('style');
  const [styles, setStyles] = useState<Record<string, any>>({});
  const [attrs, setAttrs] = useState<Record<string, any>>({});
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [compId, setCompId] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layout: true,
    spacing: true,
    typography: true,
    appearance: true,
  });
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
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

      const computed: Record<string, string> = {};
      try {
        const el = component.getEl?.();
        if (el) {
          const compStyle = el.ownerDocument?.defaultView?.getComputedStyle(el);
          if (compStyle) {
            const keys = [
              'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
              'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'color', 'background-color',
              'font-family', 'font-size', 'line-height', 'text-align', 'font-weight', 'font-style', 'text-decoration',
              'border-color', 'border-style', 'border-width', 'border-radius', 'display', 'flex-direction', 'justify-content', 'align-items', 'gap'
            ];
            keys.forEach(k => {
              const val = compStyle.getPropertyValue(k);
              if (val) computed[k] = val;
            });
          }
        }
      } catch (err) {}

      const mergedStyles = { ...computed, ...s };
      setStyles(mergedStyles);
      statesRef.current = mergedStyles;
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
    <div className="canvas-sidebar-right" style={{
      position: 'absolute',
      right: 20,
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
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#F8FAFC',
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
              <Settings size={isOpen ? 18 : 24} color="#38bdf8" />
            </button>
          {isOpen && (
            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: 14, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Properties
            </h3>
          )}
          </div>
          {tag && isOpen && (
            <span style={{ background: 'rgba(6,182,212,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)', textTransform: 'lowercase' }}>
              {tag}
            </span>
          )}
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
          <Tooltip title="Edit Appearance & Style" placement="bottom">
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
                justifyContent: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600
              }}
            >
              <Palette size={15} />
              <span>Appearance</span>
            </div>
          </Tooltip>
          <Tooltip title="Click Events & Navigation Links" placement="bottom">
            <div 
              onClick={() => setActiveTab('content')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                color: activeTab === 'content' ? '#fff' : '#94A3B8',
                background: activeTab === 'content' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600
              }}
            >
              <Link size={15} />
              <span>Events & Links</span>
            </div>
          </Tooltip>
        </div>
      )}
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease'
      }}>
        {!isGrapesPage ? (
          selectedWidget ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Section Type</div>
                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#06B6D4' }}>
                  {selectedWidget.type.replace(/_/g, ' ')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Section Title / Heading</div>
                <input
                  type="text"
                  value={selectedWidget.contentConfig?.title || selectedWidget.contentConfig?.headline || ''}
                  onChange={(e) => {
                    const cfg = { ...(selectedWidget.contentConfig || {}) };
                    if (cfg.headline !== undefined) cfg.headline = e.target.value;
                    else cfg.title = e.target.value;
                    onUpdateWidgetContent?.(cfg);
                  }}
                  placeholder="Enter section title..."
                  style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Subtitle / Description</div>
                <textarea
                  rows={3}
                  value={selectedWidget.contentConfig?.subtitle || selectedWidget.contentConfig?.description || ''}
                  onChange={(e) => {
                    const cfg = { ...(selectedWidget.contentConfig || {}) };
                    if (cfg.description !== undefined) cfg.description = e.target.value;
                    else cfg.subtitle = e.target.value;
                    onUpdateWidgetContent?.(cfg);
                  }}
                  placeholder="Enter subtitle or description..."
                  style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Raw JSON Configuration</div>
                <textarea
                  rows={8}
                  value={JSON.stringify(selectedWidget.contentConfig || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      onUpdateWidgetContent?.(parsed);
                    } catch (err) {
                      // ignore parse errors while typing
                    }
                  }}
                  style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 10px', color: '#A5B4FC', fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', marginTop: 50, fontSize: 13, padding: '0 12px' }}>
              <MousePointerClick size={32} style={{ margin: '0 auto 12px', color: '#64748B' }} />
              <div style={{ fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>No section selected</div>
              <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>Click any section on the canvas or in the Layers tab to edit its content & properties.</p>
            </div>
          )
        ) : (
          <>
            {!tag && (
              <div style={{ textAlign: 'center', color: '#475569', marginTop: 50, fontSize: 13, padding: '0 12px' }}>
                <MousePointerClick size={32} style={{ margin: '0 auto 12px', color: '#64748B' }} />
                <div style={{ fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>No element selected</div>
                <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>Click an element on the canvas to edit {activeTab === 'style' ? 'its styles & layout' : 'CMS data & properties'}.</p>
              </div>
            )}

            {tag && activeTab === 'style' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* 1. LAYOUT & DIMENSIONS ACCORDION */}
                <div>
                  <AccordionHeader
                    title="Layout & Dimensions"
                    icon={<Layout size={15} />}
                    isOpen={openSections.layout || false}
                    onToggle={() => toggleSection('layout')}
                    badge={get('display', 'block')}
                  />
                  {openSections.layout && (
                    <div style={{ padding: '4px 6px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Width & Height */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <NumInput label="Width" value={getNum('width')} onChange={v => update({ width: v + 'px' })} />
                        <NumInput label="Height" value={getNum('height')} onChange={v => update({ height: v + 'px' })} />
                      </div>

                      {/* Display Mode */}
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Display Mode</div>
                        <select
                          value={get('display', 'block')}
                          onChange={e => update({ display: e.target.value })}
                          style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="block">Block (Default)</option>
                          <option value="flex">Flexbox Container</option>
                          <option value="grid">Grid Container</option>
                          <option value="inline-block">Inline Block</option>
                          <option value="none">Hidden (None)</option>
                        </select>
                      </div>

                      {/* Flex Controls if display === flex */}
                      {get('display') === 'flex' && (
                        <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#06B6D4', textTransform: 'uppercase' }}>Flexbox Properties</div>
                          
                          <div>
                            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Direction</div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {(['row', 'column'] as const).map(dir => (
                                <button
                                  key={dir}
                                  onClick={() => update({ 'flex-direction': dir })}
                                  style={{ flex: 1, padding: '4px 8px', borderRadius: 5, fontSize: 11, cursor: 'pointer', background: get('flex-direction', 'row') === dir ? '#06B6D4' : 'rgba(255,255,255,0.05)', border: `1px solid ${get('flex-direction', 'row') === dir ? '#06B6D4' : 'rgba(255,255,255,0.08)'}`, color: get('flex-direction', 'row') === dir ? '#fff' : '#94A3B8', textTransform: 'capitalize' }}
                                >
                                  {dir}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Justify</div>
                              <select
                                value={get('justify-content', 'flex-start')}
                                onChange={e => update({ 'justify-content': e.target.value })}
                                style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '4px 6px', color: '#F8FAFC', fontSize: 11 }}
                              >
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="space-between">Space Between</option>
                                <option value="flex-end">End</option>
                              </select>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Align</div>
                              <select
                                value={get('align-items', 'stretch')}
                                onChange={e => update({ 'align-items': e.target.value })}
                                style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '4px 6px', color: '#F8FAFC', fontSize: 11 }}
                              >
                                <option value="stretch">Stretch</option>
                                <option value="center">Center</option>
                                <option value="flex-start">Start</option>
                                <option value="flex-end">End</option>
                              </select>
                            </div>
                          </div>

                          <NumInput label="Gap (px)" value={getNum('gap')} onChange={v => update({ gap: v + 'px' })} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. SPACING BOX MODEL ACCORDION */}
                <div>
                  <AccordionHeader
                    title="Spacing Box Model"
                    icon={<Box size={15} />}
                    isOpen={openSections.spacing || false}
                    onToggle={() => toggleSection('spacing')}
                    badge="Margin/Padding"
                  />
                  {openSections.spacing && (
                    <div style={{ padding: '4px 4px 6px' }}>
                      <SpacingBoxModel
                        getNum={getNum}
                        update={update}
                        width={get('width', 'auto')}
                        height={get('height', 'auto')}
                      />
                    </div>
                  )}
                </div>

                {/* 3. TYPOGRAPHY & TEXT ACCORDION */}
                <div>
                  <AccordionHeader
                    title="Typography & Text"
                    icon={<Type size={15} />}
                    isOpen={openSections.typography || false}
                    onToggle={() => toggleSection('typography')}
                    badge={get('font-family', 'Inter')}
                  />
                  {openSections.typography && (
                    <div style={{ padding: '4px 6px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Font family */}
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Font Family</div>
                        <select value={get('font-family', 'Inter')} onChange={e => update({ 'font-family': e.target.value })} style={{ width: '100%', background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 8px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>

                      {/* Style buttons */}
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>Font Style</div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {pillBtn(bold, () => update({ 'font-weight': bold ? 'normal' : 'bold' }), <b>B</b>, 'Bold')}
                          {pillBtn(italic, () => update({ 'font-style': italic ? 'normal' : 'italic' }), <i>I</i>, 'Italic')}
                          {pillBtn(underline, () => update({ 'text-decoration': underline ? 'none' : 'underline' }), <u style={{ textDecoration: 'underline' }}>U</u>, 'Underline')}
                          {pillBtn(strikethrough, () => update({ 'text-decoration': strikethrough ? 'none' : 'line-through' }), <s>S</s>, 'Strikethrough')}
                        </div>
                      </div>

                      {/* Align */}
                      <div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>Text Alignment</div>
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

                      {/* Text Color + Quick Tokens */}
                      <div>
                        <SectionTitle>Text Color</SectionTitle>
                        <ColorPicker label="Color" value={get('color', '#FFFFFF')} onChange={v => update({ color: v })} />
                        <QuickColorSwatches value={get('color', '#FFFFFF')} onChange={v => update({ color: v })} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. APPEARANCE & COLORS ACCORDION */}
                <div>
                  <AccordionHeader
                    title="Appearance & Borders"
                    icon={<Palette size={15} />}
                    isOpen={openSections.appearance || false}
                    onToggle={() => toggleSection('appearance')}
                    badge="Colors/Border"
                  />
                  {openSections.appearance && (
                    <div style={{ padding: '4px 6px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Background Color + Quick Swatches */}
                      <div>
                        <SectionTitle>Background Color</SectionTitle>
                        <ColorPicker label="Background" value={get('background-color', '#111827')} onChange={v => update({ 'background-color': v })} />
                        <QuickColorSwatches value={get('background-color', '#111827')} onChange={v => update({ 'background-color': v })} />
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

                      {/* Border Color */}
                      <div>
                        <SectionTitle>Border Color</SectionTitle>
                        <ColorPicker label="Border Color" value={get('border-color', '#1E293B')} onChange={v => update({ 'border-color': v })} />
                        <QuickColorSwatches value={get('border-color', '#1E293B')} onChange={v => update({ 'border-color': v })} />
                      </div>

                      {/* Border Style / Width / Radius */}
                      <div>
                        <SectionTitle>Border Style</SectionTitle>
                        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                          {BORDER_STYLES.map(bs => {
                            const isActive = get('border-style', 'none') === bs;
                            return (
                              <button
                                key={bs}
                                onClick={() => update({ 'border-style': bs })}
                                title={bs.charAt(0).toUpperCase() + bs.slice(1)}
                                style={{
                                  flex: 1, height: 30, borderRadius: 6, cursor: 'pointer',
                                  background: isActive ? '#06B6D4' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${isActive ? '#06B6D4' : 'rgba(255,255,255,0.1)'}`,
                                  color: isActive ? '#fff' : '#94A3B8',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {bs === 'none' && (
                                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid currentColor', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: 13, height: 1.5, background: 'currentColor', transform: 'rotate(-45deg)' }} />
                                  </div>
                                )}
                                {bs === 'solid' && <div style={{ width: 18, borderBottom: '2px solid currentColor' }} />}
                                {bs === 'dashed' && <div style={{ width: 18, borderBottom: '2px dashed currentColor' }} />}
                                {bs === 'dotted' && <div style={{ width: 18, borderBottom: '2.5px dotted currentColor' }} />}
                                {bs === 'double' && <div style={{ width: 18, borderBottom: '3.5px double currentColor' }} />}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                          <NumInput label="Border Width (px)" value={getNum('border-width')} onChange={v => update({ 'border-width': v + 'px' })} />
                          <NumInput label="Border Radius (px)" value={getNum('border-radius')} onChange={v => update({ 'border-radius': v + 'px' })} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

        {tag && activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Section 1: Universal Click Action / Navigation Control */}
            <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#06B6D4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <ExternalLink size={14} /> Click Events & Navigation
                </div>
                <span style={{ fontSize: 9.5, background: 'rgba(6,182,212,0.2)', color: '#06B6D4', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                  &lt;{tag}&gt;
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                Attach a website link or navigation action when clicking on this <b>{tag.toUpperCase()}</b> element.
              </p>

              <div style={{ fontSize: 10, color: '#CBD5E1', marginBottom: 5, fontWeight: 600 }}>Action Type</div>
              <Select
                value={attrs['data-gz-action-type'] || (attrs.onclick ? (attrs.onclick.includes('scrollIntoView') ? 'scroll' : attrs.onclick.includes('location.href') ? (attrs.onclick.includes('http') ? 'url' : 'page') : 'none') : attrs.href ? (attrs.href.startsWith('#') ? 'scroll' : attrs.href.startsWith('http') ? 'url' : 'page') : 'none')}
                onChange={type => {
                  const target = attrs['data-gz-href'] || attrs.href || '';
                  if (type === 'none') {
                    updateAttr({
                      'data-gz-action-type': 'none',
                      'data-gz-href': '',
                      onclick: '',
                      href: '',
                    });
                  } else if (type === 'page') {
                    const pageTarget = target || '/products';
                    if (tag === 'a') {
                      updateAttr({ 'data-gz-action-type': 'page', href: pageTarget, 'data-gz-href': pageTarget });
                    } else {
                      updateAttr({
                        'data-gz-action-type': 'page',
                        'data-gz-href': pageTarget,
                        onclick: `window.location.href='${pageTarget}'`,
                      });
                    }
                  } else if (type === 'url') {
                    const urlTarget = target || 'https://';
                    if (tag === 'a') {
                      updateAttr({ 'data-gz-action-type': 'url', href: urlTarget, 'data-gz-href': urlTarget });
                    } else {
                      updateAttr({
                        'data-gz-action-type': 'url',
                        'data-gz-href': urlTarget,
                        onclick: `window.location.href='${urlTarget}'`,
                      });
                    }
                  } else if (type === 'scroll') {
                    const scrollTarget = target || '#section-id';
                    updateAttr({
                      'data-gz-action-type': 'scroll',
                      'data-gz-href': scrollTarget,
                      onclick: `document.querySelector('${scrollTarget}')?.scrollIntoView({ behavior: 'smooth' })`,
                    });
                  }
                }}
                style={{ width: '100%', marginBottom: 12 }}
                dropdownStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)' }}
                options={[
                  {
                    value: 'none',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontSize: 12 }}>
                        <StopOutlined style={{ color: '#EF4444', fontSize: 13 }} />
                        <span>No Click Action (None)</span>
                      </div>
                    )
                  },
                  {
                    value: 'page',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontSize: 12 }}>
                        <FileTextOutlined style={{ color: '#3B82F6', fontSize: 13 }} />
                        <span>Internal Page Navigation</span>
                      </div>
                    )
                  },
                  {
                    value: 'url',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontSize: 12 }}>
                        <GlobalOutlined style={{ color: '#06B6D4', fontSize: 13 }} />
                        <span>Open Website Link (URL / Href)</span>
                      </div>
                    )
                  },
                  {
                    value: 'scroll',
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontSize: 12 }}>
                        <AimOutlined style={{ color: '#F59E0B', fontSize: 13 }} />
                        <span>Scroll to Section (Element ID)</span>
                      </div>
                    )
                  }
                ]}
              />

              {(attrs['data-gz-action-type'] === 'page' || (!attrs['data-gz-action-type'] && attrs.onclick?.includes('location.href'))) && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#CBD5E1', marginBottom: 5, fontWeight: 600 }}>Select Target Page Path</div>
                  <Select
                    value={attrs['data-gz-href'] || attrs.href || (attrs.onclick?.match(/href='([^']+)'/)?.[1]) || '/products'}
                    onChange={val => {
                      if (tag === 'a') {
                        updateAttr({ 'data-gz-action-type': 'page', href: val, 'data-gz-href': val });
                      } else {
                        updateAttr({ 'data-gz-action-type': 'page', 'data-gz-href': val, onclick: `window.location.href='${val}'` });
                      }
                    }}
                    style={{ width: '100%' }}
                    dropdownStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)' }}
                    options={[
                      { value: '/', label: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F8FAFC', fontSize: 12 }}><FileTextOutlined style={{ color: '#3B82F6' }} /><span>Home Page (/)</span></div> },
                      { value: '/products', label: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F8FAFC', fontSize: 12 }}><FileTextOutlined style={{ color: '#3B82F6' }} /><span>Products Page (/products)</span></div> },
                      { value: '/about', label: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F8FAFC', fontSize: 12 }}><FileTextOutlined style={{ color: '#3B82F6' }} /><span>About Page (/about)</span></div> },
                      { value: '/contact', label: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F8FAFC', fontSize: 12 }}><FileTextOutlined style={{ color: '#3B82F6' }} /><span>Contact Page (/contact)</span></div> },
                      { value: '/pricing', label: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F8FAFC', fontSize: 12 }}><FileTextOutlined style={{ color: '#3B82F6' }} /><span>Pricing Page (/pricing)</span></div> },
                      { value: '/login', label: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F8FAFC', fontSize: 12 }}><FileTextOutlined style={{ color: '#3B82F6' }} /><span>Login Page (/login)</span></div> },
                    ]}
                  />
                </div>
              )}

              {(attrs['data-gz-action-type'] === 'url' || attrs['data-gz-action-type'] === 'scroll' || (!attrs['data-gz-action-type'] && attrs.href)) && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#CBD5E1', marginBottom: 5, fontWeight: 600 }}>
                    {attrs['data-gz-action-type'] === 'scroll' ? 'Target Element ID (e.g., #section-id)' : 'Link URL / Href'}
                  </div>
                  <input
                    placeholder={attrs['data-gz-action-type'] === 'scroll' ? '#section-id' : 'https://... or /path'}
                    value={attrs['data-gz-href'] || attrs.href || (attrs.onclick?.match(/href='([^']+)'/)?.[1]) || ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (attrs['data-gz-action-type'] === 'scroll') {
                        updateAttr({ 'data-gz-href': val, onclick: `document.querySelector('${val}')?.scrollIntoView({ behavior: 'smooth' })` });
                      } else if (tag === 'a') {
                        updateAttr({ 'data-gz-action-type': 'url', href: val, 'data-gz-href': val });
                      } else {
                        updateAttr({
                          'data-gz-action-type': 'url',
                          'data-gz-href': val,
                          onclick: `window.location.href='${val}'`,
                        });
                      }
                    }}
                    style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, padding: '8px 10px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {(attrs['data-gz-action-type'] === 'url' || attrs['data-gz-action-type'] === 'page' || (tag === 'a')) && attrs['data-gz-action-type'] !== 'none' && (
                <div>
                  <div style={{ fontSize: 10, color: '#CBD5E1', marginBottom: 5, fontWeight: 600 }}>Open Target</div>
                  <select
                    value={attrs.target || '_self'}
                    onChange={e => updateAttr({ target: e.target.value })}
                    style={{ width: '100%', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, padding: '8px 10px', color: '#F8FAFC', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="_self">Open in current tab (_self)</option>
                    <option value="_blank">Open in new tab / window (_blank)</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

            {/* Section 2: Content / Media */}
            <div>
              <SectionTitle>Content & Media</SectionTitle>
              {tag === 'img' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Image URL (Media Service Port 3004)</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        placeholder="https://..."
                        value={attrs.src || ''}
                        onChange={e => updateAttr({ src: e.target.value })}
                        style={{ flex: 1, background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#F8FAFC', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('genzite:open-media-modal', {
                            detail: { onSelect: (url: string) => updateAttr({ src: url }) }
                          }));
                        }}
                        style={{ background: '#06B6D4', border: 'none', borderRadius: 6, padding: '0 10px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ImageIcon size={13} /> Browse
                      </button>
                    </div>
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

            {/* Section 3: Optional Collapsed Dynamic CMS */}
            <details style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10 }}>
              <summary style={{ fontSize: 10.5, fontWeight: 600, color: '#94A3B8', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <SettingOutlined /> Dynamic CMS Data (Advanced)
              </summary>
              <div style={{ marginTop: 12 }}>
                <DynamicBindingControl
                  tag={tag}
                  attrs={attrs}
                  updateAttr={updateAttr}
                  updateContent={updateContent}
                />
              </div>
            </details>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

            {/* Section 4: Element ID */}
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
              </div>
            </div>
          </div>
        )}
        </>
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
