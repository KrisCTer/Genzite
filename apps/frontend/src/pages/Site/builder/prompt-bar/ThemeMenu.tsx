import { forwardRef } from 'react';
import { Palette, Plus, Check } from 'lucide-react';
import { THEME_OPTIONS } from './constants';

interface ThemeMenuProps {
  theme?: string;
  onSelectTheme: (themeId: string) => void;
  onCreateNewTheme?: () => void;
}

const ThemeMenu = forwardRef<HTMLDivElement, ThemeMenuProps>(({ theme, onSelectTheme, onCreateNewTheme }, ref) => {
  return (
    <div className="ai-theme-menu" ref={ref}>
      <div className="ai-theme-header">
        <Palette size={16} className="ai-theme-header-icon" />
        <span>DESIGN.md</span>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 4 }} className="custom-scrollbar">
        <button
          onClick={() => onCreateNewTheme?.()}
          style={{ width: '100%', background: 'transparent', border: 'none', color: '#E2E8F0', padding: '10px 0', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: 13, gap: 12 }}
        >
          <Plus size={16} style={{ opacity: 0.7 }} /> Create New
        </button>

        <div style={{ marginTop: 16, marginBottom: 8, fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
          Genzite Presets
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {THEME_OPTIONS.map(themeOpt => (
            <div
              key={themeOpt.id}
              onClick={() => onSelectTheme(themeOpt.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 12px', cursor: 'pointer', borderRadius: 6,
                background: theme === themeOpt.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if (theme !== themeOpt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { if (theme !== themeOpt.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>{themeOpt.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 500, color: '#fff' }}>Aa</span>

                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)',
                    background: `radial-gradient(circle at 30% 30%, ${themeOpt.colors[0]}, ${themeOpt.colors[1]} 60%, ${themeOpt.colors[2]} 100%)`
                  }} />

                  <div style={{ background: themeOpt.colors[1], color: '#fff', fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 4 }}>
                    Button
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: '#64748B', gap: 8 }}>
                {theme === themeOpt.id && <Check size={16} color="#fff" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ThemeMenu.displayName = 'ThemeMenu';

export default ThemeMenu;
