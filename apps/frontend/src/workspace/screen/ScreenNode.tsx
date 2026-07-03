import React, { useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import type { ScreenData } from '../../stores/useWorkspaceStore';
import { VNodeRenderer } from './VNodeRenderer';

interface ScreenNodeProps {
  screen: ScreenData;
}

export const ScreenNode: React.FC<ScreenNodeProps> = ({ screen }) => {
  const { updateScreen, selectedScreenIds, setSelectedScreens, viewport, setIsDragging } = useWorkspaceStore();
  const isSelected = selectedScreenIds.includes(screen.id);
  const rndRef = useRef(null);

  // Stop event propagation to prevent canvas panning when interacting with the screen
  const handlePointerDown = (e: React.PointerEvent) => {
    // We don't stop propagation if middle mouse or space is pressed because we want panning
    if (e.button !== 1 && !(e.nativeEvent as any).isSpacePressed) {
      e.stopPropagation();
      setSelectedScreens([screen.id]);
    }
  };

  return (
    <Rnd
      ref={rndRef}
      size={{ width: screen.width, height: screen.height }}
      position={{ x: screen.x, y: screen.y }}
      onDragStart={() => setIsDragging(true)}
      onDragStop={(_e, d) => {
        setIsDragging(false);
        updateScreen(screen.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateScreen(screen.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          ...position,
        });
      }}
      // Use scale from viewport to adjust drag/resize calculations correctly
      scale={viewport.zoom}
      bounds="parent"
      minWidth={320}
      minHeight={200}
      dragHandleClassName="screen-header-handle"
      className={`absolute bg-white shadow-xl flex flex-col rounded-xl overflow-hidden border-2 transition-colors ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      }`}
      onPointerDown={handlePointerDown}
    >
      {/* Screen Header / Drag Handle */}
      <div className="screen-header-handle h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3 cursor-grab active:cursor-grabbing shrink-0 group">
        <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
          {screen.name}
        </span>
        <span className="ml-auto text-[10px] text-gray-400 font-mono">
          {screen.width} × {screen.height}
        </span>
      </div>

      {/* Screen Body / VDOM Renderer */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {screen.nodes.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Empty Screen
          </div>
        ) : (
          screen.nodes.map(node => (
            <VNodeRenderer key={node.id} node={node} screenId={screen.id} />
          ))
        )}
      </div>
    </Rnd>
  );
};
