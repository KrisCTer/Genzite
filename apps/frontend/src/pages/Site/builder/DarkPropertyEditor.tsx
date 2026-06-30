import React, { useEffect, useState } from 'react';
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
      // Guard: width/height may be 0 or undefined during initial load
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

  return (
    <>
      <div className="canvas-props-header">
        Properties
        <span className="canvas-props-type">{widget.type}</span>
      </div>
      <div className="canvas-props-body">
        {/* Size inputs */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="canvas-props-label">Dimensions</div>
          <div className="canvas-size-inputs">
            <div className="canvas-size-input-group">
              <div style={{ fontSize: 10, color: '#8B949E', marginBottom: 4 }}>Width (px)</div>
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
              <div style={{ fontSize: 10, color: '#8B949E', marginBottom: 4 }}>Height (px)</div>
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

        {/* Visual Content Config Editor */}
        <div style={{ marginBottom: 24 }}>
          <div className="canvas-props-label" style={{ marginBottom: 12 }}>Content Settings</div>
          
          {Object.entries(widget.contentConfig || {}).map(([key, val]) => {
            if (typeof val === 'string' || typeof val === 'number') {
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#8B949E', marginBottom: 6, textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  {String(val).length > 40 || key.toLowerCase().includes('desc') || key.toLowerCase().includes('subtitle') ? (
                    <textarea
                      className="canvas-textarea-dark"
                      style={{ minHeight: '80px', padding: '8px' }}
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
              );
            }
            return null; // Arrays/objects still need JSON editor for now
          })}
        </div>

        {/* Fallback JSON Config */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="canvas-props-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Advanced (JSON)
            {jsonError && (
              <span style={{ color: '#F87171', fontSize: 10, fontWeight: 400 }}>Invalid JSON</span>
            )}
          </div>
          <textarea
            className="canvas-textarea-dark"
            style={{ borderColor: jsonError ? 'rgba(239,68,68,0.5)' : undefined, minHeight: 120 }}
            value={jsonText}
            onChange={handleJsonChange}
            spellCheck={false}
          />
        </div>
      </div>
    </>
  );
};

export default DarkPropertyEditor;
