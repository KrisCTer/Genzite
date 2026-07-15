import React, { useState, useRef, useCallback } from 'react';

export interface DraggableBoardProps {
  initialX: number;
  initialY: number;
  zoom: number;
  activeTool?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  requestTopZ?: () => number;
}

export const DraggableBoard: React.FC<DraggableBoardProps> = ({
  initialX,
  initialY,
  zoom,
  activeTool,
  children,
  style,
  requestTopZ
}) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [localZ, setLocalZ] = useState(1);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool && activeTool !== 'select') return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, [data-nodrag]')) return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    if (requestTopZ) {
      setLocalZ(requestTopZ());
    }

    dragStart.current = { x: e.clientX, y: e.clientY, startX: pos.x, startY: pos.y };
  }, [pos.x, pos.y, requestTopZ, activeTool]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const dx = (e.clientX - dragStart.current.x) / zoom;
    const dy = (e.clientY - dragStart.current.y) / zoom;
    setPos({ x: dragStart.current.startX + dx, y: dragStart.current.startY + dy });
  }, [isDragging, zoom]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
  }, [isDragging]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          zIndex: localZ,
          cursor: (activeTool && activeTool !== 'select') ? 'inherit' : (isDragging ? 'grabbing' : 'grab'),
          ...style
        }}
        onPointerDown={onPointerDown}
      >
        <div style={{ pointerEvents: isDragging ? 'none' : 'auto', width: '100%', height: '100%' }}>
          {children}
        </div>
      </div>
      {isDragging && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9999999, cursor: 'grabbing' }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      )}
    </>
  );
};
