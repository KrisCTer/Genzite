import React from 'react';
import { InfiniteCanvas } from './canvas/InfiniteCanvas';
import { ScreenNode } from './screen/ScreenNode';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { useAiAgent } from '../hooks/useAiAgent';
import { ComponentInspector } from './inspector/ComponentInspector';
import { ComponentTree } from './tree/ComponentTree';
import { Layers, Wand2, Settings2, Loader2, Monitor, Smartphone, Tablet, ChevronDown } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useEffect } from 'react';

export const WorkspaceLayout: React.FC = () => {
  const { screens } = useWorkspaceStore();
  const { generateUI, isGenerating, progress } = useAiAgent();
  const [prompt, setPrompt] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // TODO: Implement cross-screen component drag & drop logic here
    console.log('Component dropped:', event);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          useWorkspaceStore.getState().redo();
        } else {
          useWorkspaceStore.getState().undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        useWorkspaceStore.getState().redo();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Left Sidebar (Component Tree) */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
        <div className="h-12 flex items-center px-4 border-b border-gray-200">
          <Layers className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium text-sm">Layers</span>
        </div>
        <ComponentTree />
      </aside>

      {/* Center Main Area (Canvas & Prompts) */}
      <main className="flex-1 flex flex-col relative z-0 min-w-0">
        
        {/* Top Responsive Controls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-white shadow-sm border border-gray-200 rounded-lg p-1 gap-1">
          <button className="p-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors" title="Desktop">
            <Monitor className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors" title="Tablet">
            <Tablet className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors" title="Mobile">
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* The Infinite Canvas */}
        <div className="flex-1 relative" onClick={(e) => {
          // Deselect screens if clicking empty canvas space
          if (e.target === e.currentTarget) {
            useWorkspaceStore.getState().setSelectedScreens([]);
          }
        }}>
          <DndContext onDragEnd={handleDragEnd}>
            <InfiniteCanvas>
              {screens.map(screen => (
                <ScreenNode key={screen.id} screen={screen} />
              ))}
            </InfiniteCanvas>
          </DndContext>
        </div>

        {/* Progress UI Overlay */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out z-20 ${
            isGenerating ? 'opacity-100 bottom-40 translate-y-0' : 'opacity-0 bottom-32 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-max">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Analyzing prompt
                </span>
              </div>
              <span className="text-gray-500">→</span>
              <div className={`flex items-center gap-2 ${progress?.includes('thinking') ? 'text-white' : 'text-gray-500'}`}>
                {progress?.includes('thinking') && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                <span className={progress?.includes('thinking') ? 'font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' : ''}>
                  Designing layout
                </span>
              </div>
              <span className="text-gray-500">→</span>
              <div className="text-gray-500">Generating code</div>
              <span className="text-gray-500">→</span>
              <div className="text-gray-500">Ready</div>
            </div>
          </div>
        </div>

        {/* Bottom Prompt Console overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20">
          <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl border border-white/10 p-3 flex flex-col focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
            <textarea 
              ref={textareaRef}
              placeholder="Describe the UI you want to build... (e.g. A modern SaaS dashboard)"
              className="w-full bg-transparent outline-none text-gray-200 text-sm resize-y min-h-[80px] max-h-[240px] p-2 placeholder-gray-500"
              value={prompt}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating) {
                  e.preventDefault();
                  generateUI(prompt);
                  setPrompt('');
                  if (textareaRef.current) textareaRef.current.style.height = '80px';
                }
              }}
              disabled={isGenerating}
              style={{ overflowY: 'auto' }}
            />
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-current rounded-full pb-0.5">+</div>
                </button>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs font-medium border border-white/5 cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1">
                  Flash <ChevronDown className="w-3 h-3" />
                </div>
              </div>
              
              <button 
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isGenerating || !prompt.trim() 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
                }`}
                onClick={() => {
                  if (prompt.trim() && !isGenerating) {
                    generateUI(prompt);
                    setPrompt('');
                    if (textareaRef.current) textareaRef.current.style.height = '80px';
                  }
                }}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? 'Generating...' : 'Generate'} <Wand2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar (Inspector) */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)]">
        <div className="h-12 flex items-center px-4 border-b border-gray-200">
          <Settings2 className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium text-sm">Design</span>
        </div>
        <ComponentInspector />
      </aside>
    </div>
  );
};
