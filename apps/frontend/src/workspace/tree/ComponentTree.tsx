import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import type { VNode } from '../../stores/useWorkspaceStore';
import { ChevronRight, ChevronDown, Component, Monitor, Box, Type, Image as ImageIcon } from 'lucide-react';

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'div': return <Box className="w-3 h-3" />;
    case 'span':
    case 'p':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'text': return <Type className="w-3 h-3" />;
    case 'img': return <ImageIcon className="w-3 h-3" />;
    case 'button': return <Component className="w-3 h-3 text-indigo-500" />;
    default: return <Component className="w-3 h-3" />;
  }
};

const TreeNode: React.FC<{ node: VNode; depth: number }> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { selectedComponentIds, setSelectedComponents, setHoveredComponent, hoveredComponentId } = useWorkspaceStore();
  
  const isSelected = selectedComponentIds.includes(node.id);
  const isHovered = hoveredComponentId === node.id;
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div>
      <div 
        className={`flex items-center py-1 cursor-pointer select-none ${
          isSelected ? 'bg-blue-100 text-blue-900' : isHovered ? 'bg-gray-100' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponents([node.id]);
        }}
        onMouseEnter={() => setHoveredComponent(node.id)}
        onMouseLeave={() => setHoveredComponent(null)}
      >
        <div 
          className="w-4 h-4 flex items-center justify-center mr-1"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : (
            <span className="w-3 h-3 inline-block" />
          )}
        </div>
        {getNodeIcon(node.type)}
        <span className="text-xs ml-2 truncate">{node.type}</span>
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {(node.children as VNode[]).map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentTree: React.FC = () => {
  const { screens, selectedScreenIds, setSelectedScreens } = useWorkspaceStore();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
      {screens.length === 0 && (
        <div className="text-xs text-gray-400 text-center mt-10">No screens yet.</div>
      )}
      
      {screens.map(screen => (
        <div key={screen.id} className="mb-4">
          <div 
            className={`flex items-center py-1 px-2 mb-1 rounded cursor-pointer select-none font-medium text-sm ${
              selectedScreenIds.includes(screen.id) ? 'bg-blue-100 text-blue-900' : 'text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedScreens([screen.id])}
          >
            <Monitor className="w-4 h-4 mr-2 text-gray-500" />
            <span className="truncate">{screen.name}</span>
          </div>
          
          <div className="ml-2 border-l border-gray-200">
            {screen.nodes.map(node => (
              <TreeNode key={node.id} node={node} depth={1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
