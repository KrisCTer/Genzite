import React, { useState } from 'react';
import { Popover } from 'antd';
import './Controls.css';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  'transparent',
  '#0B0F19', '#111827', '#1E293B', '#475569', '#94A3B8', // Grays
  '#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', // Whites
  '#06B6D4', '#10B981', '#0ea5e9', '#8b5cf6', '#ec4899', // Accents
  '#22c55e', '#f59e0b', '#ef4444'                        // Status
];

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  const [open, setOpen] = useState(false);

  const content = (
    <div className="canvas-color-picker-popup">
      <div className="canvas-color-grid">
        {PRESET_COLORS.map(c => (
          <div
            key={c}
            className="canvas-color-swatch"
            style={{ 
              background: c, 
              border: c === 'transparent' ? '1px dashed var(--color-border)' : '1px solid rgba(255,255,255,0.1)' 
            }}
            onClick={() => { onChange(c); setOpen(false); }}
            title={c}
          />
        ))}
      </div>
      <input
        type="text"
        className="canvas-input-dark"
        style={{ marginTop: 12 }}
        value={color}
        onChange={e => onChange(e.target.value)}
        placeholder="#HEX or rgb()"
      />
    </div>
  );

  return (
    <div className="canvas-control-group">
      <span className="canvas-control-label">{label}</span>
      <Popover 
        content={content} 
        trigger="click" 
        open={open} 
        onOpenChange={setOpen}
        placement="bottomRight"
        arrow={false}
        overlayInnerStyle={{ padding: 12 }}
      >
        <div className="canvas-color-trigger">
          <div 
            className="canvas-color-preview"
            style={{ 
              background: color || 'transparent',
              border: color === 'transparent' || !color ? '1px dashed var(--color-border)' : '1px solid rgba(255,255,255,0.1)' 
            }} 
          />
          <span className="canvas-color-value">{color || 'None'}</span>
        </div>
      </Popover>
    </div>
  );
};

export default ColorPicker;
