import React from 'react';

export interface CanvaIconProps {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}

const BaseIcon: React.FC<CanvaIconProps & { children: React.ReactNode }> = ({
  className = '',
  size = 18,
  style,
  children,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`inline-block shrink-0 ${className}`}
    style={style}
    fill="currentColor"
  >
    {children}
  </svg>
);

// --- Core Actions & Toolbar Icons ---
export const IconComment: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </BaseIcon>
);

export const IconLock: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9-2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </BaseIcon>
);

export const IconUnlock: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v1.9h2V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9-2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
  </BaseIcon>
);

export const IconParent: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 4l-8 8h6v8h4v-8h6z" />
  </BaseIcon>
);

export const IconMove: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
  </BaseIcon>
);

export const IconDuplicate: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9-2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </BaseIcon>
);

export const IconDelete: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </BaseIcon>
);

export const IconMenu: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </BaseIcon>
);

export const IconGroup: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 4h4v4H4V4zm0 12h4v4H4v-4zm12 0h4v4h-4v-4zm0-12h4v4h-4V4zM2 2v8h8V2H2zm0 12v8h8v-8H2zm12-12v8h8V2h-8zm0 12v8h8v-8h-8z" />
  </BaseIcon>
);

export const IconUngroup: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 4h4v4H4V4zm12 12h4v4h-4v-4zM2 2v8h8V2H2zm12 12v8h8v-8h-8z" />
  </BaseIcon>
);

// --- Context Menu Specific Icons ---
export const IconCopy: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9-2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
  </BaseIcon>
);

export const IconCopyStyle: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z" />
  </BaseIcon>
);

export const IconPaste: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9-2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 14H7v-2h10v2zm0-4H7v-2h10v2zm-3-4H7V8h7v2z" />
  </BaseIcon>
);

export const IconLayer: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
  </BaseIcon>
);

export const IconAlign: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 19h16v2H4v-2zm0-4h11v2H4v-2zm0-4h16v2H4v-2zm0-4h11v2H4V7zm0-4h16v2H4V3z" />
  </BaseIcon>
);

export const IconLink: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
  </BaseIcon>
);

export const IconAltText: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </BaseIcon>
);

export const IconBgColor: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.08 2.34 5.64C7.9 20.84 9.95 21.64 12 21.64s4.1-.8 5.66-2.36C19.22 17.72 20 15.64 20 13.64S19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z" />
  </BaseIcon>
);

export const IconPageColor: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </BaseIcon>
);

export const IconInfo: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </BaseIcon>
);

// --- Submenu Icons ---
export const IconBringToFront: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z" />
  </BaseIcon>
);

export const IconBringForward: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
  </BaseIcon>
);

export const IconSendBackward: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
  </BaseIcon>
);

export const IconSendToBack: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z" />
  </BaseIcon>
);

export const IconAlignLeft: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
  </BaseIcon>
);

export const IconAlignCenter: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
  </BaseIcon>
);

export const IconAlignRight: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
  </BaseIcon>
);

export const IconAlignTop: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z" />
  </BaseIcon>
);

export const IconAlignMiddle: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M22 11h-5V6h-2v5h-6V6H7v5H2v2h5v5h2v-5h6v5h2v-5h5z" />
  </BaseIcon>
);

export const IconAlignBottom: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z" />
  </BaseIcon>
);

export const IconChevronRight: React.FC<CanvaIconProps> = (props) => (
  <BaseIcon size={14} {...props}>
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </BaseIcon>
);

// --- Raw SVG strings for GrapesJS Toolbar ---
export const CANVA_SVG_STRINGS = {
  comment: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9-2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
  parent: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4l-8 8h6v8h4v-8h6z"/></svg>',
  move: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>',
  duplicate: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9-2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
  delete: '<svg viewBox="0 0 24 24" width="18" height="18" style="color: #F87171;"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
};
