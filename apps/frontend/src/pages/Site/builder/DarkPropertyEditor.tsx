import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import ColorPicker from './controls/ColorPicker';
import SliderControl from './controls/SliderControl';
import SpacingEditor from './controls/SpacingEditor';
import '../CanvasBuilder.css';

interface DarkPropertyEditorProps {
  widget: { _id: string; type: string; contentConfig: Record<string, any>; width: number; height: number } | null;
  onChange: (newConfig: Record<string, any>) => void;
  onSizeChange: (width: number, height: number) => void;
}

const DarkPropertyEditor: React.FC<DarkPropertyEditorProps> = ({ widget, onChange, onSizeChange }) => {
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(false);

  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');

  // Sync from widget prop
  useEffect(() => {
    if (widget) {
      setJsonText(JSON.stringify(widget.contentConfig ?? {}, null, 2));
      setJsonError(false);
      setWidthInput(widget.width ? String(Math.round(widget.width)) : '');
      setHeightInput(widget.height ? String(Math.round(widget.height)) : '');
    }
  }, [widget]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setJsonError(false);
      onChange(parsed);
    } catch {
      setJsonError(true);
    }
  };

  const handleSizeApply = () => {
    const w = parseInt(widthInput);
    const h = parseInt(heightInput);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      onSizeChange(w, h);
    }
  };

  if (!widget) {
    return (
      <>
        <div className="canvas-props-header">Properties</div>
        <div className="canvas-props-empty">
          <div className="canvas-props-empty-icon">✦</div>
          <div>Select a widget on the canvas to edit its properties.</div>
        </div>
      </>
    );
  }

  // Group properties
  const contentProps = Object.entries(widget.contentConfig || {}).filter(
    ([_, val]) => typeof val === 'string' || typeof val === 'number'
  );

  return (
    <>
      <div className="canvas-props-header">
        Properties
        <span className="canvas-props-type">{widget.type}</span>
      </div>
      <div className="canvas-props-body">
        
        {/* Layout & Size */}
        <div style={{ marginBottom: 24 }}>
          <div className="canvas-props-label" style={{ marginBottom: 12 }}>Dimensions</div>
          <div className="canvas-size-inputs">
            <div className="canvas-size-input-group">
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Width (W)</div>
              <input
                className="canvas-input-dark"
                type="number"
                value={widthInput}
                onChange={e => setWidthInput(e.target.value)}
                onBlur={handleSizeApply}
                onKeyDown={e => e.key === 'Enter' && handleSizeApply()}
              />
            </div>
            <div className="canvas-size-input-group">
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Height (H)</div>
              <input
                className="canvas-input-dark"
                type="number"
                value={heightInput}
                onChange={e => setHeightInput(e.target.value)}
                onBlur={handleSizeApply}
                onKeyDown={e => e.key === 'Enter' && handleSizeApply()}
              />
            </div>
          </div>
        </div>

        <Collapse 
          defaultActiveKey={['content', 'style']} 
          ghost 
          expandIconPosition="end"
          className="canvas-props-collapse"
        >
          {/* Content Settings */}
          <Collapse.Panel header={<span className="canvas-props-label">Content</span>} key="content">
            {contentProps.map(([key, val]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                {String(val).length > 40 || key.toLowerCase().includes('desc') || key.toLowerCase().includes('subtitle') ? (
                  <textarea
                    className="canvas-textarea-dark"
                    style={{ minHeight: '60px', padding: '8px' }}
                    value={String(val)}
                    onChange={(e) => onChange({ ...widget.contentConfig, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className="canvas-input-dark"
                    type="text"
                    value={String(val)}
                    onChange={(e) => onChange({ ...widget.contentConfig, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </Collapse.Panel>

          {/* Style Controls (Mocked visually for now) */}
          <Collapse.Panel header={<span className="canvas-props-label">Style</span>} key="style">
            <ColorPicker 
              label="Background Color" 
              color={widget.contentConfig.bgColor || 'transparent'} 
              onChange={(c) => onChange({ ...widget.contentConfig, bgColor: c })} 
            />
            <ColorPicker 
              label="Text Color" 
              color={widget.contentConfig.textColor || '#d4d4d8'} 
              onChange={(c) => onChange({ ...widget.contentConfig, textColor: c })} 
            />
            <SliderControl 
              label="Border Radius" 
              value={widget.contentConfig.borderRadius || 8} 
              max={32} 
              onChange={(v) => onChange({ ...widget.contentConfig, borderRadius: v })} 
            />
          </Collapse.Panel>

          {/* Layout Controls */}
          <Collapse.Panel header={<span className="canvas-props-label">Layout</span>} key="layout">
            <SpacingEditor 
              label="Padding" 
              value={widget.contentConfig.padding || '24px 24px 24px 24px'} 
              onChange={(v) => onChange({ ...widget.contentConfig, padding: v })} 
            />
          </Collapse.Panel>

          {/* Advanced / JSON */}
          <Collapse.Panel header={<span className="canvas-props-label">Advanced (JSON)</span>} key="advanced">
            {jsonError && <div style={{ color: 'var(--gz-error)', fontSize: 10, marginBottom: 8 }}>Invalid JSON</div>}
            <textarea
              className="canvas-textarea-dark"
              style={{ borderColor: jsonError ? 'var(--gz-error)' : undefined, minHeight: 180 }}
              value={jsonText}
              onChange={handleJsonChange}
              spellCheck={false}
            />
          </Collapse.Panel>
        </Collapse>
      </div>
    </>
  );
};

export default DarkPropertyEditor;
