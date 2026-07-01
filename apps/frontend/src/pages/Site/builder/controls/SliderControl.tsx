import React from 'react';
import { Slider } from 'antd';
import './Controls.css';

interface SliderControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = 'px',
  onChange,
}) => {
  return (
    <div className="canvas-control-group">
      <div className="canvas-control-header">
        <span className="canvas-control-label">{label}</span>
        <span className="canvas-control-value">{value}{unit}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        tooltip={{ formatter: null }}
        className="canvas-control-slider"
      />
    </div>
  );
};

export default SliderControl;
