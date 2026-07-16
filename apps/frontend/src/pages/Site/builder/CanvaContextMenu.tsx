/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  IconCopy,
  IconPaste,
  IconDuplicate,
  IconDelete,
  IconLayer,
  IconAlign,
  IconLock,
  IconUnlock,
  IconInfo,
  IconBringToFront,
  IconBringForward,
  IconSendBackward,
  IconSendToBack,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignTop,
  IconAlignMiddle,
  IconAlignBottom,
  IconChevronRight,
  IconCopyStyle,
  IconGroup,
  IconUngroup,
} from './CanvaIcons';

export type CanvaActionType =
  | 'copy'
  | 'copyStyle'
  | 'paste'
  | 'duplicate'
  | 'delete'
  | 'group'
  | 'ungroup'
  | 'bringToFront'
  | 'sendToBack'
  | 'bringForward'
  | 'sendBackward'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignTop'
  | 'alignMiddle'
  | 'alignBottom'
  | 'createComponent'
  | 'comment'
  | 'lock'
  | 'unlock'
  | 'link'
  | 'timing'
  | 'altText'
  | 'changeBackground'
  | 'pageColor'
  | 'info';

export interface CanvaContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  isLocked?: boolean;
  onClose: () => void;
  onAction: (action: CanvaActionType) => void;
}

export const CanvaContextMenu: React.FC<CanvaContextMenuProps> = ({
  open,
  x,
  y,
  isLocked = false,
  onClose,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });
  const [maxHeight, setMaxHeight] = useState<number>(520);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuRects, setSubmenuRects] = useState<{ [key: string]: { top: number, right: number, left: number, bottom: number, width: number, height: number } }>({});
  const [submenuPos, setSubmenuPos] = useState<'right' | 'left'>('right');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterItem = (submenu: 'layer' | 'align' | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    if (submenu) {
      // Immediately open the hovered submenu
      setActiveSubmenu(submenu);
    } else {
      // Delay closing or switching when hovering over non-submenu items
      // so diagonal mouse movement across items towards the submenu doesn't close it
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveSubmenu(null);
      }, 250);
    }
  };


  // Smart Positioning: Auto-flip X, clamp Y, and compute maxHeight from remaining space
  const updatePosition = useCallback(() => {
    if (!open) return;
    const menuWidth = 280;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const MARGIN = 12; // safe gap from screen edges

    let newLeft = x;
    let newTop = y;
    let newSubmenuPos: 'right' | 'left' = 'right';

    // Flip X if too close to right screen edge
    if (x + menuWidth > windowWidth - MARGIN) {
      newLeft = Math.max(MARGIN, x - menuWidth);
      newSubmenuPos = 'left';
    } else if (x + menuWidth + 220 > windowWidth - MARGIN) {
      newSubmenuPos = 'left';
    }

    // Clamp top — don't let menu start above the top edge
    if (newTop < MARGIN) newTop = MARGIN;

    // Compute available height below the click point
    const spaceBelow = windowHeight - newTop - MARGIN;
    // Allow at most 72% viewport height but at least 200px
    const computedMax = Math.max(200, Math.min(spaceBelow, windowHeight * 0.72));

    setPosition({ left: newLeft, top: newTop });
    setMaxHeight(computedMax);
    setSubmenuPos(newSubmenuPos);
  }, [open, x, y]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Handle outside click & Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleItemClick = (action: CanvaActionType) => {
    onAction(action);
    onClose();
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    label: string,
    shortcut: string | null,
    action?: CanvaActionType,
    hasSubmenu?: 'layer' | 'align',
    isSubmenuItem: boolean = false
  ) => {
    const isSubmenuActive = activeSubmenu === hasSubmenu;

    return (
      <div
        className={`group min-h-[40px] flex items-center justify-between pl-3 pr-5 py-2.5 cursor-pointer text-[14px] transition-all duration-150 rounded-full mx-2 my-0.5 ${
          isSubmenuActive
            ? 'bg-slate-100 text-[#06B6D4] font-semibold shadow-sm'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        }`}
        onMouseEnter={(e) => {
          if (!isSubmenuItem) {
            handleMouseEnterItem(hasSubmenu || null);
            if (hasSubmenu) {
              const rect = e.currentTarget.getBoundingClientRect();
              setSubmenuRects(prev => ({ 
                ...prev, 
                [hasSubmenu]: { top: rect.top, right: rect.right, left: rect.left, bottom: rect.bottom, width: rect.width, height: rect.height } 
              }));
            }
          }
        }}
        onClick={() => {
          if (hasSubmenu) return; // Clicking item with submenu doesn't trigger action immediately
          if (action) handleItemClick(action);
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-slate-700 group-hover:text-slate-900 flex items-center justify-center w-6 h-6 shrink-0 transition-colors">
            {icon}
          </span>
          <span className="truncate font-normal group-hover:font-medium transition-all">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[12px] ml-3 shrink-0">
          {shortcut && (
            <span
              className={`px-2.5 py-1 rounded-md font-medium font-sans text-[12px] transition-colors ${
                isSubmenuActive
                  ? 'bg-slate-200/80 text-slate-700'
                  : 'bg-slate-100 group-hover:bg-slate-200/80 text-slate-600 group-hover:text-slate-700'
              }`}
            >
              {shortcut}
            </span>
          )}
          {hasSubmenu && (
            <IconChevronRight className="text-slate-500 group-hover:text-slate-800 w-4 h-4 ml-0.5 transition-colors" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        zIndex: 9999,
      }}
      className="animate-in fade-in zoom-in-95 duration-150"
      onMouseLeave={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          setActiveSubmenu(null);
        }, 300);
      }}
    >
      <div
        ref={menuRef}
        style={{
          maxHeight: `${maxHeight}px`,
        }}
        className="w-[280px] bg-white/98 backdrop-blur-md border-2 border-white ring-1 ring-slate-200/50 rounded-2xl shadow-2xl py-2.5 select-none font-sans text-slate-800 overflow-y-auto scrollbar-thin"
        onScroll={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setActiveSubmenu(null);
        }}
      >
      {/* Group 1: Clipboard & Operations */}
      {renderMenuItem(<IconCopy />, 'Copy', 'Ctrl+C', 'copy')}
      {renderMenuItem(<IconCopyStyle />, 'Copy Style', 'Ctrl+Alt+C', 'copyStyle')}
      {renderMenuItem(<IconPaste />, 'Paste', 'Ctrl+V', 'paste')}
      {renderMenuItem(<IconDuplicate />, 'Duplicate', 'Ctrl+D', 'duplicate')}
      {renderMenuItem(<IconDelete className="text-red-500" />, 'Delete', 'DELETE', 'delete')}

      <div className="h-[1px] bg-slate-100 my-1.5 mx-2.5" />

      {/* Group 2: Grouping */}
      {renderMenuItem(<IconGroup />, 'Group', 'Ctrl+G', 'group')}
      {renderMenuItem(<IconUngroup />, 'Ungroup', 'Ctrl+Shift+G', 'ungroup')}

      <div className="h-[1px] bg-slate-100 my-1.5 mx-2.5" />

      {/* Group 3: Layer & Alignment (Submenus) */}
      {renderMenuItem(<IconLayer />, 'Layer', null, undefined, 'layer')}
      {renderMenuItem(<IconAlign />, 'Align to Page', null, undefined, 'align')}

      <div className="h-[1px] bg-slate-100 my-1.5 mx-2" />

      {/* Group 3: Features & Info */}
      {renderMenuItem(
        isLocked ? <IconUnlock className="text-[#06B6D4]" /> : <IconLock />,
        isLocked ? 'Unlock' : 'Lock',
        'Alt+Shift+L',
        isLocked ? 'unlock' : 'lock'
      )}
      {renderMenuItem(<IconInfo />, 'Info', null, 'info')}
      </div>

      {/* Submenus (rendered outside the overflow-y-auto container to prevent clipping and scrolling) */}
      {activeSubmenu === 'layer' && submenuRects['layer'] && (
        <div
          style={{
            position: 'absolute',
            top: submenuRects['layer'].top - position.top - 8,
            left: submenuPos === 'right' ? 280 - 16 : -230 - 16,
          }}
          className={`z-50 ${submenuPos === 'right' ? 'pl-[22px]' : 'pr-[22px]'}`}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setActiveSubmenu('layer');
          }}
        >
          <div className="w-[230px] bg-white/98 backdrop-blur-md border-2 border-white ring-1 ring-slate-200/50 rounded-2xl shadow-2xl py-2 text-slate-800">
            {renderMenuItem(<IconBringToFront />, 'Bring to Front', null, 'bringToFront', undefined, true)}
            {renderMenuItem(<IconBringForward />, 'Bring Forward', 'Ctrl+]', 'bringForward', undefined, true)}
            {renderMenuItem(<IconSendBackward />, 'Send Backward', 'Ctrl+[', 'sendBackward', undefined, true)}
            {renderMenuItem(<IconSendToBack />, 'Send to Back', null, 'sendToBack', undefined, true)}
          </div>
        </div>
      )}

      {activeSubmenu === 'align' && submenuRects['align'] && (
        <div
          style={{
            position: 'absolute',
            top: submenuRects['align'].top - position.top - 8,
            left: submenuPos === 'right' ? 280 - 16 : -230 - 16,
          }}
          className={`z-50 ${submenuPos === 'right' ? 'pl-[22px]' : 'pr-[22px]'}`}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setActiveSubmenu('align');
          }}
        >
          <div className="w-[230px] bg-white/98 backdrop-blur-md border-2 border-white ring-1 ring-slate-200/50 rounded-2xl shadow-2xl py-2 text-slate-800">
            {renderMenuItem(<IconAlignLeft />, 'Align Left', null, 'alignLeft', undefined, true)}
            {renderMenuItem(<IconAlignCenter />, 'Align Center', null, 'alignCenter', undefined, true)}
            {renderMenuItem(<IconAlignRight />, 'Align Right', null, 'alignRight', undefined, true)}
            <div className="h-[1px] bg-slate-100 my-1 mx-2" />
            {renderMenuItem(<IconAlignTop />, 'Align Top', null, 'alignTop', undefined, true)}
            {renderMenuItem(<IconAlignMiddle />, 'Align Middle', null, 'alignMiddle', undefined, true)}
            {renderMenuItem(<IconAlignBottom />, 'Align Bottom', null, 'alignBottom', undefined, true)}
          </div>
        </div>
      )}
    </div>
  );
};
