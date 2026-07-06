import React, { forwardRef } from 'react';
import { Palette, Plus, Check } from 'lucide-react';
import { THEME_OPTIONS } from './constants';

interface ThemeMenuProps {
  theme?: string;
  onSelectTheme: (themeId: string) => void;
}

const ThemeMenu = forwardRef<HTMLDivElement, ThemeMenuProps>(({ theme, onSelectTheme }, ref) => {
  return (
    <div className="ai-theme-menu" ref={ref}>
      <div className="ai-theme-header">
        <Palette size={16} className="ai-theme-header-icon" />
        <span>DESIGN.md</span>
      </div>
      <p className="ai-theme-desc">
        Genzite will automatically select based on your prompt, unless you choose a specific Design System.
      </p>
      <button className="ai-theme-add-btn">
        <Plus size={16} /> Start with your design
      </button>
      
      <div className="ai-theme-section">
        <div className="ai-theme-section-title">Genzite Presets</div>
        <div className="ai-theme-list">
          {THEME_OPTIONS.map(themeOpt => (
            <button 
              key={themeOpt.id}
              className={`ai-theme-item ${theme === themeOpt.id ? 'selected' : ''}`}
              onClick={() => onSelectTheme(themeOpt.id)}
            >
              <div 
                className="ai-theme-swatch"
                style={{ background: `radial-gradient(circle at 30% 30%, ${themeOpt.colors[0]}, ${themeOpt.colors[1]} 60%, ${themeOpt.colors[2]} 100%)` }}
              ></div>
              <span>{themeOpt.label}</span>
              {theme === themeOpt.id && <Check size={16} className="ai-theme-item-check" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

ThemeMenu.displayName = 'ThemeMenu';

export default ThemeMenu;
