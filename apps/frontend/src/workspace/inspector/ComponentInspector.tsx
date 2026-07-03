import React from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import type { VNode } from '../../stores/useWorkspaceStore';

export const ComponentInspector: React.FC = () => {
  const { screens, selectedComponentIds, updateNodeStyle } = useWorkspaceStore();

  // Find the selected node
  const selectedId = selectedComponentIds[0];
  let selectedNode: VNode | null = null;
  let selectedScreenId: string | null = null;

  if (selectedId) {
    const findNode = (nodes: VNode[]): VNode | null => {
      for (const node of nodes) {
        if (node.id === selectedId) return node;
        if (Array.isArray(node.children)) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const screen of screens) {
      const found = findNode(screen.nodes);
      if (found) {
        selectedNode = found;
        selectedScreenId = screen.id;
        break;
      }
    }
  }

  if (!selectedNode || !selectedScreenId) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <p className="text-xs text-gray-400 text-center">Select a component on the canvas to inspect properties.</p>
      </div>
    );
  }

  const handleStyleChange = (key: keyof React.CSSProperties, value: string) => {
    updateNodeStyle(selectedScreenId!, selectedId, { [key]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="border-b border-gray-100 pb-2">
        <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1">Component</h3>
        <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
          {selectedNode.type}#{selectedNode.id}
        </p>
      </div>

      {/* Layout / Spacing */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Spacing</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Padding</label>
            <input 
              type="text" 
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" 
              value={selectedNode.style.padding?.toString() || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              placeholder="e.g. 10px 20px"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Margin</label>
            <input 
              type="text" 
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" 
              value={selectedNode.style.margin?.toString() || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              placeholder="e.g. 0 auto"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Appearance</h3>
        
        <div>
          <label className="text-[10px] text-gray-500 uppercase mb-1 block">Background Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
              value={selectedNode.style.backgroundColor?.toString() || '#ffffff'}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            />
            <input 
              type="text" 
              className="flex-1 text-xs border border-gray-200 rounded px-2 focus:outline-none focus:border-blue-500" 
              value={selectedNode.style.backgroundColor?.toString() || ''}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase mb-1 block">Text Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
              value={selectedNode.style.color?.toString() || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
            />
            <input 
              type="text" 
              className="flex-1 text-xs border border-gray-200 rounded px-2 focus:outline-none focus:border-blue-500" 
              value={selectedNode.style.color?.toString() || ''}
              onChange={(e) => handleStyleChange('color', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* AI Partial Edit Prompt */}
      <div className="mt-8 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
        <label className="text-xs font-semibold text-indigo-800 block mb-2">✨ AI Magic Edit</label>
        <input 
          type="text" 
          placeholder="e.g. 'Make this dark mode'" 
          className="w-full text-xs border border-indigo-200 rounded px-2 py-2 focus:outline-none focus:border-indigo-500" 
        />
        <button className="w-full mt-2 bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700 transition-colors">
          Update Component
        </button>
      </div>

    </div>
  );
};
