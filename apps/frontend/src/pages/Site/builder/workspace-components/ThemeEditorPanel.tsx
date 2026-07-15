import React from 'react';
import { ColorPicker, Popover, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ChevronRight, Palette, X, Plus, MoreVertical } from 'lucide-react';

export interface ThemeEditorPanelProps {
  detailThemeId: string | null;
  setDetailThemeId: (id: string | null) => void;
  detailThemeTab: 'Theme' | 'DESIGN.md';
  setDetailThemeTab: (tab: 'Theme' | 'DESIGN.md') => void;
  themeColorOverrides: Record<string, string>;
  setThemeColorOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  themeFonts: Record<string, string>;
  setThemeFonts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  expandedFontRole: string | null;
  setExpandedFontRole: (role: string | null) => void;
  fontSearch: string;
  setFontSearch: (search: string) => void;
  themeScheme: string;
  setThemeScheme: (scheme: string) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  themeRadius: number;
  setThemeRadius: (radius: number) => void;
  isThemeSchemeOpen: boolean;
  setIsThemeSchemeOpen: (open: boolean) => void;
  handleApplyThemeToSelection: () => void;
  isApplyingTheme: boolean;
  selectedId: string | null;
  setIsStylesOpen: (open: boolean) => void;
}

export const THEMES = [
  { id: 'bauhaus', name: 'Bauhaus', font: 'Aa', colors: ['#171717', '#DC2626', '#2563EB'], buttonBg: '#171717', buttonColor: '#F8FAFC' },
  { id: 'glacier', name: 'Glacier', font: 'Aa', colors: ['#38BDF8', '#A78BFA', '#F472B6'], buttonBg: '#38BDF8', buttonColor: '#0F172A' },
  { id: 'carbon', name: 'Carbon', font: 'Aa', colors: ['#2563EB', '#27272A', '#22C55E'], buttonBg: '#2563EB', buttonColor: '#F8FAFC' },
  { id: 'neon-tokyo', name: 'Neon Tokyo', font: 'Aa', colors: ['#F43F5E', '#FBBF24', '#2DD4BF'], buttonBg: '#F43F5E', buttonColor: '#F8FAFC' },
  { id: 'terra', name: 'Terra', font: 'Aa', colors: ['#78716C', '#92400E', '#166534'], buttonBg: '#166534', buttonColor: '#F8FAFC' },
  { id: 'obsidian', name: 'Obsidian', font: 'Aa', colors: ['#8B5CF6', '#3F3F46', '#10B981'], buttonBg: '#8B5CF6', buttonColor: '#F8FAFC' },
  { id: 'sahara', name: 'Sahara', font: 'Aa', colors: ['#F97316', '#451A03', '#B45309'], buttonBg: '#F97316', buttonColor: '#F8FAFC' }
];

export const generateDesignMd = (
  activeTheme: any,
  themeColorOverrides: Record<string, string>,
  themeFonts: Record<string, string>,
  themeMode: 'light' | 'dark',
  themeRadius: number,
  customPrompt?: string
): string => {
  const primaryColor = themeColorOverrides['palette-0'] || activeTheme?.colors?.[0] || '#0052FF';
  const secondaryColor = themeColorOverrides['palette-1'] || activeTheme?.colors?.[1] || '#64748B';
  const bgColor = themeMode === 'dark' ? '#0F172A' : '#FAF8FF';
  const onBgColor = themeMode === 'dark' ? '#F8FAFC' : '#131B2E';
  const headlineFont = themeFonts['Headline'] || 'Hanken Grotesk';
  const bodyFont = themeFonts['Body'] || 'Inter';
  const labelFont = themeFonts['Label'] || 'Inter';
  const radius = themeRadius || 4;

  const promptSection = customPrompt && customPrompt !== 'No design prompt specified.' && customPrompt !== 'No design prompt specified for this project.'
    ? `\n\n## Custom Project Design Requirements\n${customPrompt}`
    : '';

  return `---
name: ${activeTheme?.name || 'Standard Clean'}
colors:
  surface: '${bgColor}'
  surface-dim: '${themeMode === 'dark' ? '#1E293B' : '#d2d9f4'}'
  surface-bright: '${bgColor}'
  surface-container-lowest: '${themeMode === 'dark' ? '#020617' : '#ffffff'}'
  surface-container-low: '${themeMode === 'dark' ? '#0F172A' : '#f2f3ff'}'
  surface-container: '${themeMode === 'dark' ? '#1E293B' : '#eaedff'}'
  surface-container-high: '${themeMode === 'dark' ? '#334155' : '#e2e7ff'}'
  surface-container-highest: '${themeMode === 'dark' ? '#475569' : '#dae2fd'}'
  on-surface: '${onBgColor}'
  on-surface-variant: '${themeMode === 'dark' ? '#94A3B8' : '#434656'}'
  inverse-surface: '${themeMode === 'dark' ? '#F8FAFC' : '#283044'}'
  inverse-on-surface: '${themeMode === 'dark' ? '#0F172A' : '#eef0ff'}'
  outline: '${themeMode === 'dark' ? '#475569' : '#737688'}'
  outline-variant: '${themeMode === 'dark' ? '#334155' : '#c3c5d9'}'
  surface-tint: '${primaryColor}'
  primary: '${primaryColor}'
  on-primary: '#ffffff'
  primary-container: '${themeMode === 'dark' ? '#1E3A8A' : '#0052ff'}'
  on-primary-container: '${themeMode === 'dark' ? '#DBEAFE' : '#dfe3ff'}'
  inverse-primary: '${themeMode === 'dark' ? '#3B82F6' : '#b7c4ff'}'
  secondary: '${secondaryColor}'
  on-secondary: '#ffffff'
  secondary-container: '${themeMode === 'dark' ? '#334155' : '#d0e1fb'}'
  on-secondary-container: '${themeMode === 'dark' ? '#F8FAFC' : '#54647a'}'
  tertiary: '#952200'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf3003'
  on-tertiary-container: '#ffddd5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#891e00'
  background: '${bgColor}'
  on-background: '${onBgColor}'
  surface-variant: '${themeMode === 'dark' ? '#1E293B' : '#dae2fd'}'
typography:
  headline-lg:
    fontFamily: ${headlineFont}
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: ${headlineFont}
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: ${headlineFont}
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: ${bodyFont}
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: ${bodyFont}
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: ${bodyFont}
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: ${labelFont}
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: ${labelFont}
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: ${Math.max(2, radius - 4)}px
  DEFAULT: ${radius}px
  md: ${radius + 2}px
  lg: ${radius + 4}px
  xl: ${radius + 8}px
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  container-max: 1200px
---

## Brand & Style
The design system is anchored in a philosophy of "Standard Clean"—an aesthetic that prioritizes clarity, professional rigor, and high-utility minimalism. It is designed for mobile-first web applications where efficiency and trust are paramount.

The brand personality is authoritative yet approachable, utilizing heavy whitespace to reduce cognitive load. The visual style leans into **Corporate Minimalism**, characterized by high-contrast information hierarchies, sharp execution of details, and a rejection of unnecessary ornamentation. The emotional goal is to evoke a sense of organized calm and institutional reliability.

## Colors
The palette is built on a "Functional Neutral" foundation. The primary color is a high-chroma blue, used purposefully for calls to action and critical interactive states.

- **Primary (${primaryColor}):** A vibrant, accessible blue used for primary buttons, active states, and focus indicators.
- **Secondary (${secondaryColor}):** A muted slate for secondary information, icons, and supporting text.
- **Neutral (${onBgColor}):** A deep navy-black for headings and primary text to ensure maximum contrast and readability.
- **Surface:** The background utilizes pure white (${bgColor}), while subtle greys are used to delineate sections without introducing heavy borders.

## Typography
The typographic system uses a pairing of **${headlineFont}** for headlines and **${bodyFont}** for body and UI elements. This combination ensures a sharp, contemporary edge for branding while maintaining industry-standard legibility for functional data.

Headlines should utilize tight letter-spacing and bold weights to create a strong visual anchor. Body text adheres to a generous line height (1.5x) to facilitate comfortable reading on mobile screens. All labels and captions use ${labelFont} with slightly increased letter-spacing to maintain clarity at small scales.

## Layout & Spacing
This design system employs a **Fluid Grid** model with a base-8 spacing scale. For mobile web, a 4-column grid is standard, moving to an 8-column grid for tablets and a 12-column grid for desktop.

- **Mobile:** 20px outer margins with 16px gutters.
- **Desktop:** The content is centered within a max-width container, using 24px gutters.
- **Rhythm:** Vertical spacing between sections should favor \`lg\` (24px) or \`xl\` (32px) increments to maintain the "Clean" aesthetic through intentional whitespace.

## Elevation & Depth
Elevation is expressed through **Tonal Layers** and extremely subtle **Ambient Shadows**. To maintain a flat, modern profile, avoid heavy dropshadows.

- **Level 0 (Base):** Pure white background (${bgColor}).
- **Level 1 (Cards/Containers):** A 1px border of #E2E8F0. No shadow.
- **Level 2 (Interactive/Floating):** A soft, diffused shadow: \`0 4px 12px rgba(15, 23, 42, 0.05)\`.
- **Level 3 (Modals/Overlays):** A more pronounced shadow: \`0 12px 32px rgba(15, 23, 42, 0.1)\`.

Depth is primarily used to separate functional layers (like a floating navigation bar) from the content stream.

## Shapes
The design system uses a **Soft (1)** roundedness profile. This ${radius}px base radius provides a professional, "engineered" look that is less aggressive than sharp corners but more serious than highly rounded "bubbly" designs.

- **Standard Elements:** ${radius}px (Buttons, Inputs).
- **Large Elements:** ${radius + 4}px (Cards, Modals).
- **Interactive Pill:** Reserved exclusively for tags or status indicators.

## Components
Components are designed for high touch-accuracy and visual clarity.

- **Buttons:** Primary buttons use the ${primaryColor} background with white text. Height is fixed at 48px for mobile accessibility. Secondary buttons use a ghost style with a 1px border of #E2E8F0.
- **Input Fields:** Use a 48px height with a 1px border (#E2E8F0). Focus states transition the border to Primary Blue with a subtle 2px outer glow.
- **Cards:** Cards should have no background fill (white) and a 1px #E2E8F0 border. Internal padding is strictly 20px.
- **Chips/Tags:** Small 28px height elements using a light tint of the primary color or neutral grey for categorical data.
- **Lists:** List items are separated by a 1px hair-line divider (#F1F5F9). Use 16px padding on the Y-axis to ensure comfortable tap targets.
- **Checkboxes & Radios:** Use the Primary Blue for the active state. The "Off" state is a 1px grey ring to keep the UI quiet when inactive.${promptSection}`;
};

const FONT_OPTIONS = [
  'Anton', 'Anybody', 'Archivo Narrow', 'Arimo', 
  'Atkinson Hyperlegible Next', 'Barlow Condensed', 
  'Inter', 'Noto Serif', 'Public Sans', 'Roboto', 'Open Sans'
];

export const ThemeEditorPanel: React.FC<ThemeEditorPanelProps> = ({
  detailThemeId,
  setDetailThemeId,
  detailThemeTab,
  setDetailThemeTab,
  themeColorOverrides,
  setThemeColorOverrides,
  themeFonts,
  setThemeFonts,
  expandedFontRole,
  setExpandedFontRole,
  fontSearch,
  setFontSearch,
  themeScheme,
  setThemeScheme,
  themeMode,
  setThemeMode,
  themeRadius,
  setThemeRadius,
  isThemeSchemeOpen,
  setIsThemeSchemeOpen,
  handleApplyThemeToSelection,
  isApplyingTheme,
  selectedId,
  setIsStylesOpen,
}) => {
  const activeTheme = detailThemeId === 'custom' 
    ? { id: 'custom', name: 'Tùy chỉnh', font: 'Aa', colors: ['#1976D2', '#E65100'], buttonBg: '#1976D2', buttonColor: '#FFFFFF' }
    : detailThemeId ? THEMES.find(t => t.id === detailThemeId) : null;

  if (activeTheme) {
    const getDynamicDesignMd = () => {
      return generateDesignMd(activeTheme, themeColorOverrides, themeFonts, themeMode, themeRadius);
    };

    return (
      <div style={{
        position: 'absolute',
        top: 80, 
        right: 70, 
        bottom: 90, 
        width: 320,
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        color: '#F8FAFC',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => { setDetailThemeId(null); setThemeColorOverrides({}); }}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}
          >
            <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> {activeTheme.name}
          </button>
          <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
            <EditOutlined />
          </button>
        </div>
        
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 16px' }}>
          <button 
            style={{ flex: 1, textAlign: 'center', background: 'transparent', border: 'none', color: detailThemeTab === 'Theme' ? '#fff' : '#94A3B8', padding: '12px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', position: 'relative' }}
            onClick={() => setDetailThemeTab('Theme')}
          >
            Theme
            {detailThemeTab === 'Theme' && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#fff' }} />}
          </button>
          <button 
            style={{ flex: 1, textAlign: 'center', background: 'transparent', border: 'none', color: detailThemeTab === 'DESIGN.md' ? '#fff' : '#94A3B8', padding: '12px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', position: 'relative' }}
            onClick={() => setDetailThemeTab('DESIGN.md')}
          >
            DESIGN.md
            {detailThemeTab === 'DESIGN.md' && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#fff' }} />}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} className="custom-scrollbar">
          {detailThemeTab === 'Theme' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Mode</span>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 4 }}>
                  <button 
                    onClick={() => setThemeMode('light')}
                    style={{ flex: 1, background: themeMode === 'light' ? 'rgba(255,255,255,0.1)' : 'transparent', color: themeMode === 'light' ? '#fff' : '#94A3B8', border: 'none', padding: '6px 0', borderRadius: 16, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    ☀ Light
                  </button>
                  <button 
                    onClick={() => setThemeMode('dark')}
                    style={{ flex: 1, background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent', color: themeMode === 'dark' ? '#fff' : '#94A3B8', border: 'none', padding: '6px 0', borderRadius: 16, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    ☾ Dark
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Seed Color</span>
                <ColorPicker 
                  value={themeColorOverrides['seed'] || activeTheme.colors[0]} 
                  onChange={(c) => setThemeColorOverrides(prev => ({ ...prev, 'seed': c.toHexString() }))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: themeColorOverrides['seed'] || activeTheme.colors[0] }} />
                      <span style={{ fontSize: 14, color: '#e2e8f0' }}>{(themeColorOverrides['seed'] || activeTheme.colors[0]).toUpperCase()}</span>
                    </div>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                </ColorPicker>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Color theme</span>
                <Popover 
                  open={isThemeSchemeOpen}
                  onOpenChange={setIsThemeSchemeOpen}
                  trigger="click"
                  placement="bottomRight"
                  arrow={false}
                  overlayInnerStyle={{ padding: 4, background: '#22272B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 200 }}
                  content={
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 300, overflowY: 'auto' }} className="custom-scrollbar">
                      {THEMES.map(scheme => (
                        <div 
                          key={scheme.name}
                          onClick={() => { setThemeScheme(scheme.name); setIsThemeSchemeOpen(false); }}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer',
                            background: themeScheme === scheme.name ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: 6
                          }}
                          onMouseEnter={(e) => { if (themeScheme !== scheme.name) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                          onMouseLeave={(e) => { if (themeScheme !== scheme.name) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ 
                            width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)',
                            background: `radial-gradient(circle at 30% 30%, ${scheme.colors[0]}, ${scheme.colors[1]} 60%, ${scheme.colors[2]} 100%)` 
                          }} />
                          <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{scheme.name}</span>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)',
                        background: `radial-gradient(circle at 30% 30%, 
                          ${themeColorOverrides['palette-0'] || activeTheme.colors[0] || '#171717'}, 
                          ${themeColorOverrides['palette-1'] || activeTheme.colors[1] || '#475569'} 60%, 
                          ${themeColorOverrides['palette-2'] || activeTheme.colors[2] || '#8b5cf6'} 100%)`
                      }} />
                      <span style={{ fontSize: 14, color: '#e2e8f0' }}>{themeScheme}</span>
                    </div>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                </Popover>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Color Palette</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { name: 'Primary', color: activeTheme.colors[0] },
                    { name: 'Secondary', color: activeTheme.colors[1] || '#475569' },
                    { name: 'Tertiary', color: activeTheme.colors[2] || '#8b5cf6' },
                    { name: 'Neutral', color: '#1e293b' }
                  ].map((item, i) => (
                    <ColorPicker 
                      key={i} 
                      value={themeColorOverrides[`palette-${i}`] || item.color}
                      onChange={(c) => setThemeColorOverrides(prev => ({ ...prev, [`palette-${i}`]: c.toHexString() }))}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: themeColorOverrides[`palette-${i}`] || item.color }} />
                          <span style={{ fontSize: 14, color: '#e2e8f0' }}>{item.name}</span>
                        </div>
                        <ChevronRight size={14} color="#94A3B8" />
                      </div>
                    </ColorPicker>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Typography</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { name: 'Noto Serif', role: 'Headline' },
                    { name: 'Inter', role: 'Body' },
                    { name: 'Public Sans', role: 'Label' }
                  ].map((font, i) => {
                    const isExpanded = expandedFontRole === font.role;
                    const currentFont = themeFonts[font.role] || font.name;

                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', cursor: 'pointer' }}
                          onClick={() => {
                            if (isExpanded) { setExpandedFontRole(null); setFontSearch(''); }
                            else { setExpandedFontRole(font.role); setFontSearch(''); }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 16, color: '#fff', fontFamily: currentFont }}>Aa</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 14, color: '#fff', fontWeight: 500, fontFamily: currentFont }}>{currentFont}</span>
                              <span style={{ fontSize: 12, color: '#94A3B8' }}>{font.role}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} color="#94A3B8" style={{ transform: isExpanded ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                        {isExpanded && (
                          <div style={{ paddingBottom: 12 }}>
                            <input 
                              type="text" 
                              placeholder="Search font..." 
                              value={fontSearch}
                              onChange={e => setFontSearch(e.target.value)}
                              style={{ 
                                width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', 
                                borderRadius: 6, padding: '8px 12px', color: '#fff', outline: 'none', marginBottom: 8,
                                fontSize: 13
                              }}
                            />
                            <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 4 }} className="custom-scrollbar">
                              {FONT_OPTIONS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())).map(f => (
                                <div 
                                  key={f}
                                  onClick={() => {
                                    setThemeFonts(prev => ({ ...prev, [font.role]: f }));
                                    setExpandedFontRole(null);
                                  }}
                                  style={{ 
                                    padding: '10px 12px', cursor: 'pointer', fontFamily: f, 
                                    fontSize: 14, color: currentFont === f ? '#fff' : '#e2e8f0', 
                                    background: currentFont === f ? 'rgba(255,255,255,0.05)' : 'transparent', 
                                    borderRadius: 6,
                                    fontWeight: f === 'Anton' || f === 'Anybody' ? 600 : 400 
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.background = currentFont === f ? 'rgba(255,255,255,0.05)' : 'transparent'}
                                >
                                  {f}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Bán kính góc</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[4, 8, 12, 16].map((rad, i) => (
                    <button 
                      key={i} 
                      onClick={() => setThemeRadius(rad)}
                      style={{ flex: 1, background: themeRadius === rad ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: themeRadius === rad ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: 24, height: 24, border: '1px solid #94A3B8', borderBottom: 'none', borderRight: 'none', borderTopLeftRadius: rad }}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: 12 }}>
                DESIGN.md ⓘ
              </div>
              <pre style={{ padding: 12, margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: '"Inter", sans-serif', fontSize: 13, lineHeight: 1.5, color: '#e2e8f0' }}>
                {getDynamicDesignMd()}
              </pre>
            </div>
          )}

          <button
            onClick={handleApplyThemeToSelection}
            disabled={isApplyingTheme || !selectedId || selectedId.length === 0}
            style={{
              marginTop: 16,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 24,
              padding: '10px 16px',
              color: '#e2e8f0',
              fontSize: 14,
              fontWeight: 600,
              cursor: (isApplyingTheme || !selectedId || selectedId.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: (isApplyingTheme || !selectedId || selectedId.length === 0) ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isApplyingTheme && selectedId && selectedId.length > 0) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isApplyingTheme && selectedId && selectedId.length > 0) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            {isApplyingTheme && <Spin size="small" />}
            Apply to Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 80, 
      right: 70, 
      bottom: 90, 
      width: 320,
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 16,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      color: '#F8FAFC',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 600 }}>
          <Palette size={16} style={{ marginRight: 8, opacity: 0.8 }} /> DESIGN.md
        </div>
        <button 
          onClick={() => setIsStylesOpen(false)} 
          style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
        >
          <X size={16} />
        </button>
      </div>
      
      <div style={{ padding: '0 20px 20px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
        <button 
          onClick={() => setDetailThemeId('custom')}
          style={{ width: '100%', background: 'transparent', border: 'none', color: '#E2E8F0', padding: '10px 0', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: 13, gap: 12 }}
        >
          <Plus size={16} style={{ opacity: 0.7 }} /> Tạo mới
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {THEMES.map((theme, i) => (
            <div 
              key={i} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', cursor: 'pointer' }}
              onClick={() => setDetailThemeId(theme.id)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>{theme.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 500 }}>Aa</span>
                  
                  <div style={{ 
                    width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)',
                    background: `radial-gradient(circle at 30% 30%, ${theme.colors[0]}, ${theme.colors[1]} 60%, ${theme.colors[2]} 100%)` 
                  }} />

                  <div style={{ background: theme.buttonBg, color: theme.buttonColor, fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 4 }}>
                    Button
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', color: '#64748B', gap: 8 }}>
                <MoreVertical size={16} />
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
