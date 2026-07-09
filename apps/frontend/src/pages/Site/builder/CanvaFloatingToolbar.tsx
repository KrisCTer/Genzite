import React, { useRef } from 'react';
import { Tooltip } from 'antd';
import type { CanvaActionType } from './CanvaContextMenu';
import {
  IconLock,
  IconUnlock,
  IconBringForward,
  IconMove,
  IconDuplicate,
  IconDelete,
  IconMenu,
} from './CanvaIcons';

export interface CanvaFloatingToolbarProps {
  widgetId: string;
  label: string;
  isLocked?: boolean;
  selectionTimestamp?: number;
  onAction: (action: CanvaActionType) => void;
  onOpenMenu: (e: React.MouseEvent) => void;
  onPointerDownMove?: (e: React.PointerEvent) => void;
}

export const CanvaFloatingToolbar: React.FC<CanvaFloatingToolbarProps> = ({
  widgetId,
  label,
  isLocked = false,
  selectionTimestamp = 0,
  onAction,
  onOpenMenu,
  onPointerDownMove,
}) => {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const lastWidgetIdRef = useRef<string>(widgetId);

  // Reset mount time when widget changes, serving as a secondary guard
  // in case the parent's selectionTimestamp is delayed or 0.
  if (lastWidgetIdRef.current !== widgetId) {
    lastWidgetIdRef.current = widgetId;
    mountTimeRef.current = Date.now();
  }

  // Dual-layer guard: ignore clicks within 400ms of either mount or selection
  const isWithinDebounceWindow = () => {
    const timeSinceMount = Date.now() - mountTimeRef.current;
    const timeSinceSelection = selectionTimestamp > 0 ? Date.now() - selectionTimestamp : 9999;
    return timeSinceMount < 400 || timeSinceSelection < 400;
  };

  const safeOnAction = (action: CanvaActionType) => {
    if (isWithinDebounceWindow()) return;
    onAction(action);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (onPointerDownMove) {
      onPointerDownMove(e);
      return;
    }
    // Fallback for react-rnd
    const el = document.getElementById(`widget-${widgetId}`);
    if (el) {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY
      });
      el.dispatchEvent(event);
    }
  };

  return (
    <div 
      className="flex w-max items-center gap-1 bg-white p-1 rounded-full border-2 border-white pointer-events-auto shadow-xl select-none font-sans animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-200/50"
      style={{
        filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))',
      }}
    >
      {/* Lock Button */}
      <Tooltip title={isLocked ? "Unlock (Alt+Shift+L)" : "Lock (Alt+Shift+L)"} placement="top">
        <button
          onClick={() => safeOnAction(isLocked ? 'unlock' : 'lock')}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
            isLocked
              ? 'bg-[#06B6D4]/10 text-[#06B6D4] hover:bg-[#06B6D4]/20 font-bold'
              : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
          }`}
        >
          {isLocked ? <IconUnlock /> : <IconLock />}
        </button>
      </Tooltip>

      {!isLocked && (
        <>
          <Tooltip title="Bring Forward (Ctrl+])" placement="top">
            <button
              onClick={() => safeOnAction('bringForward')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors text-slate-600 cursor-pointer"
            >
              <IconBringForward />
            </button>
          </Tooltip>

          <Tooltip title="Move" placement="top">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-move"
              onPointerDown={handlePointerDown}
            >
              <IconMove />
            </div>
          </Tooltip>

          <Tooltip title="Duplicate (Ctrl+D)" placement="top">
            <button
              onClick={() => safeOnAction('duplicate')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors text-slate-600 cursor-pointer"
            >
              <IconDuplicate />
            </button>
          </Tooltip>

          <Tooltip title="Delete (DELETE)" placement="top">
            <button
              onClick={() => safeOnAction('delete')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-colors text-slate-600 cursor-pointer text-[#F43F5E]"
            >
              <IconDelete />
            </button>
          </Tooltip>
        </>
      )}

      <Tooltip title="More options..." placement="top">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isWithinDebounceWindow()) return;
            onOpenMenu(e);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-150 cursor-pointer ml-1 border border-slate-100"
          >
            <IconMenu />
          </button>
        </Tooltip>
    </div>
  );
};
