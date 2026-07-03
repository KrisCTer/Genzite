import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface InfiniteCanvasProps {
  children?: React.ReactNode;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ children }) => {
  const { viewport, setViewport } = useWorkspaceStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Spacebar pan state
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });

  // Handle keyboard (Spacebar for pan mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle pointer down (initiate pan if space is pressed or middle mouse button)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSpacePressed || e.button === 1) { // Middle click or space+click
      setIsPanning(true);
      setLastPointer({ x: e.clientX, y: e.clientY });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      
      setViewport((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setLastPointer({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // Wheel event for Zoom & Pan
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomSensitivity = 0.002;
      const deltaZoom = -e.deltaY * zoomSensitivity;
      
      setViewport((prev) => {
        const newZoom = Math.min(Math.max(prev.zoom * (1 + deltaZoom), 0.1), 5); // Clamped between 0.1x and 5x
        
        // Calculate pointer position relative to container
        const rect = containerRef.current!.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const pointerY = e.clientY - rect.top;

        // Math to keep zoom centered on pointer
        const scaleChange = newZoom / prev.zoom;
        const newX = pointerX - (pointerX - prev.x) * scaleChange;
        const newY = pointerY - (pointerY - prev.y) * scaleChange;

        return { x: newX, y: newY, zoom: newZoom };
      });
    } else {
      // Pan
      setViewport((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [setViewport]);

  // Bind non-passive wheel event
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Calculate grid background style based on zoom and pan
  const gridSize = 20 * viewport.zoom;
  const gridOffsetX = viewport.x % gridSize;
  const gridOffsetY = viewport.y % gridSize;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#f0f0f0] ${isSpacePressed ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        backgroundImage: `radial-gradient(circle, #ccc 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
      }}
    >
      <div
        className="absolute inset-0 origin-top-left will-change-transform"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
