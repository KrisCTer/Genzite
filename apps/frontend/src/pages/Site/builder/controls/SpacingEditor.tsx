import React from 'react';
import './Controls.css';

interface SpacingEditorProps {
  label: string;
  value: string; // e.g. "10px 20px" or "10px"
  onChange: (val: string) => void;
}

const parseSpacing = (val: string = '') => {
  const parts = val.split(' ').filter(Boolean);
  if (parts.length === 0) return { top: '', right: '', bottom: '', left: '' };
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
};

const SpacingEditor: React.FC<SpacingEditorProps> = ({ label, value, onChange }) => {
  const current = parseSpacing(value);

  const updatePart = (part: 'top'|'right'|'bottom'|'left', newVal: string) => {
    const updated = { ...current, [part]: newVal };
    // Simplified serialization for this mock (just output 4 parts)
    const out = `${updated.top || '0px'} ${updated.right || '0px'} ${updated.bottom || '0px'} ${updated.left || '0px'}`;
    onChange(out);
  };

  return (
    <div className="canvas-control-group">
      <span className="canvas-control-label">{label}</span>
      <div className="canvas-spacing-editor">
        <div className="canvas-spacing-row">
          <input 
            className="canvas-input-dark canvas-spacing-input" 
            placeholder="T" 
            value={current.top} 
            onChange={e => updatePart('top', e.target.value)} 
          />
        </div>
        <div className="canvas-spacing-row middle">
          <input 
            className="canvas-input-dark canvas-spacing-input" 
            placeholder="L" 
            value={current.left} 
            onChange={e => updatePart('left', e.target.value)} 
          />
          <div className="canvas-spacing-center-box" />
          <input 
            className="canvas-input-dark canvas-spacing-input" 
            placeholder="R" 
            value={current.right} 
            onChange={e => updatePart('right', e.target.value)} 
          />
        </div>
        <div className="canvas-spacing-row">
          <input 
            className="canvas-input-dark canvas-spacing-input" 
            placeholder="B" 
            value={current.bottom} 
            onChange={e => updatePart('bottom', e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
};

export default SpacingEditor;
