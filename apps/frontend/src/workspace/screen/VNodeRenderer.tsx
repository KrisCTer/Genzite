import React from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import type { VNode } from '../../stores/useWorkspaceStore';

interface VNodeRendererProps {
  node: VNode;
  screenId: string;
}

export const VNodeRenderer: React.FC<VNodeRendererProps> = ({ node, screenId }) => {
  const { selectedComponentIds, setSelectedComponents, setHoveredComponent, hoveredComponentId } = useWorkspaceStore();
  
  const isSelected = selectedComponentIds.includes(node.id);
  const isHovered = hoveredComponentId === node.id;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only select if not dragging the canvas (space pressed handled in parent)
    e.stopPropagation();
    setSelectedComponents([node.id]);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    e.stopPropagation();
    setHoveredComponent(node.id);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    e.stopPropagation();
    setHoveredComponent(null);
  };

  // Build combined styles with selection/hover indicators
  // We use an outline for selection/hover to not break the layout with borders
  const combinedStyle: React.CSSProperties = {
    ...node.style,
    outline: isSelected ? '2px solid #3b82f6' : isHovered ? '2px dashed #93c5fd' : node.style.outline,
    outlineOffset: '-2px',
    transition: 'outline 0.1s ease',
    cursor: 'pointer',
  };

  // Render children recursively
  const children = Array.isArray(node.children) 
    ? node.children.map(child => <VNodeRenderer key={child.id} node={child} screenId={screenId} />)
    : node.children;

  // Render the HTML element dynamically
  return React.createElement(
    node.type,
    {
      ...node.props,
      style: combinedStyle,
      onPointerDown: handlePointerDown,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      'data-node-id': node.id,
    },
    children
  );
};
