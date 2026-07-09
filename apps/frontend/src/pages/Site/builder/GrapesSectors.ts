export const CUSTOM_SECTORS = [
  {
    name: 'Layout & Spacing',
    open: true,
    buildProps: ['width', 'max-width', 'height', 'min-height', 'padding', 'margin', 'display', 'flex-direction', 'justify-content', 'align-items', 'gap'],
    properties: [
      { property: 'width', name: 'Width' },
      {
        property: 'max-width',
        name: 'Max Width',
        type: 'select',
        defaults: 'none',
        options: [
          { id: 'none', label: 'Full-width (100%)' },
          { id: '1440px', label: '1440px (Desktop Large)' },
          { id: '1200px', label: '1200px (Desktop Standard)' },
          { id: '1024px', label: '1024px (Tablet Landscape)' },
          { id: '768px', label: '768px (Tablet Portrait)' },
          { id: '480px', label: '480px (Mobile)' },
        ]
      },
      { property: 'height', name: 'Height' },
      { property: 'min-height', name: 'Min Height' },
      { property: 'padding', name: 'Padding (Inner)' },
      { property: 'margin', name: 'Margin (Outer)' },
      {
        property: 'display',
        name: 'Display',
        type: 'select',
        options: [
          { id: 'block', label: 'Block' },
          { id: 'flex', label: 'Flexbox' },
          { id: 'grid', label: 'Grid' },
          { id: 'inline-block', label: 'Inline Block' },
          { id: 'inline', label: 'Inline' },
          { id: 'none', label: 'None (Hidden)' },
        ]
      },
      {
        property: 'flex-direction',
        name: 'Flex Direction',
        type: 'select',
        options: [
          { id: 'row', label: 'Row' },
          { id: 'column', label: 'Column' },
          { id: 'row-reverse', label: 'Row Reverse' },
          { id: 'column-reverse', label: 'Column Reverse' },
        ]
      },
      {
        property: 'justify-content',
        name: 'Justify Content',
        type: 'select',
        options: [
          { id: 'flex-start', label: 'Start (Left/Top)' },
          { id: 'center', label: 'Center' },
          { id: 'flex-end', label: 'End (Right/Bottom)' },
          { id: 'space-between', label: 'Space Between' },
          { id: 'space-around', label: 'Space Around' },
        ]
      },
      {
        property: 'align-items',
        name: 'Align Items',
        type: 'select',
        options: [
          { id: 'flex-start', label: 'Start' },
          { id: 'center', label: 'Center' },
          { id: 'flex-end', label: 'End' },
          { id: 'stretch', label: 'Stretch' },
        ]
      },
      { property: 'gap', name: 'Child Gap' },
    ]
  },
  {
    name: 'Typography',
    open: true,
    buildProps: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'text-decoration'],
    properties: [
      {
        property: 'font-family',
        name: 'Font Family',
        type: 'select',
        options: [
          { id: 'Inter, sans-serif', label: 'Inter (Modern)' },
          { id: 'Roboto, sans-serif', label: 'Roboto (Clean)' },
          { id: 'Outfit, sans-serif', label: 'Outfit (Geometric)' },
          { id: 'Arial, sans-serif', label: 'Arial (Standard)' },
          { id: 'Georgia, serif', label: 'Georgia (Serif)' },
          { id: '"Courier New", monospace', label: 'Courier (Monospace)' },
          { id: 'inherit', label: 'Inherit' },
        ]
      },
      { property: 'font-size', name: 'Font Size' },
      {
        property: 'font-weight',
        name: 'Font Weight',
        type: 'select',
        options: [
          { id: '100', label: '100 - Thin' },
          { id: '300', label: '300 - Light' },
          { id: '400', label: '400 - Regular' },
          { id: '500', label: '500 - Medium' },
          { id: '600', label: '600 - Semi-Bold' },
          { id: '700', label: '700 - Bold' },
          { id: '800', label: '800 - Extra-Bold' },
          { id: '900', label: '900 - Black' },
        ]
      },
      { property: 'line-height', name: 'Line Height' },
      { property: 'letter-spacing', name: 'Letter Spacing' },
      {
        property: 'text-align',
        name: 'Text Alignment',
        type: 'radio',
        options: [
          { id: 'left', label: 'Left' },
          { id: 'center', label: 'Center' },
          { id: 'right', label: 'Right' },
          { id: 'justify', label: 'Justify' },
        ]
      },
      {
        property: 'text-decoration',
        name: 'Text Decoration',
        type: 'select',
        options: [
          { id: 'none', label: 'None' },
          { id: 'underline', label: 'Underline' },
          { id: 'line-through', label: 'Line-through' },
        ]
      },
    ]
  },
  {
    name: 'Colors & Background',
    open: true,
    buildProps: ['color', 'background-color', 'background'],
    properties: [
      { property: 'color', name: 'Text Color', type: 'color' },
      { property: 'background-color', name: 'Background Color', type: 'color' },
      { property: 'background', name: 'Background (Gradient/Image)' },
    ]
  },
  {
    name: 'Borders & Effects',
    open: true,
    buildProps: ['border-radius', 'box-shadow', 'border', 'opacity'],
    properties: [
      { property: 'border-radius', name: 'Border Radius' },
      { property: 'box-shadow', name: 'Box Shadow' },
      { property: 'border', name: 'Border' },
      {
        property: 'opacity',
        name: 'Opacity',
        type: 'slider',
        defaults: '1',
        min: 0,
        max: 1,
        step: 0.05
      },
    ]
  },
  {
    name: 'Transitions & Interactions',
    open: true,
    buildProps: ['transition', 'transform', 'cursor'],
    properties: [
      { property: 'transition', name: 'Hover Transition' },
      { property: 'transform', name: 'Transform' },
      {
        property: 'cursor',
        name: 'Cursor',
        type: 'select',
        options: [
          { id: 'default', label: 'Default' },
          { id: 'pointer', label: 'Pointer (Clickable)' },
          { id: 'move', label: 'Move' },
          { id: 'not-allowed', label: 'Not Allowed' },
        ]
      },
    ]
  }
];
