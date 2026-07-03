import { create } from 'zustand';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface VNode {
  id: string;
  type: string;
  props: Record<string, any>;
  style: React.CSSProperties;
  children: VNode[] | string;
}

export interface ScreenData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: VNode[];
}

export interface WorkspaceState {
  // Viewport
  viewport: Viewport;
  setViewport: (viewport: Partial<Viewport> | ((prev: Viewport) => Viewport)) => void;
  
  // Selection
  selectedScreenIds: string[];
  selectedComponentIds: string[];
  hoveredComponentId: string | null;
  setSelectedScreens: (ids: string[]) => void;
  setSelectedComponents: (ids: string[]) => void;
  setHoveredComponent: (id: string | null) => void;
  
  // Screens & Nodes
  screens: ScreenData[];
  setScreens: (screens: ScreenData[]) => void;
  updateScreen: (id: string, updates: Partial<ScreenData>) => void;
  addScreen: (screen: ScreenData) => void;
  updateNodeStyle: (screenId: string, nodeId: string, style: React.CSSProperties) => void;
  
  // History (Undo/Redo)
  past: ScreenData[][];
  future: ScreenData[][];
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;

  // Tools
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

const initialScreens: ScreenData[] = [
  {
    id: 'screen-1',
    name: 'Landing Page',
    x: 100,
    y: 100,
    width: 1440,
    height: 900,
    nodes: [
      {
        id: 'node-hero',
        type: 'div',
        props: { className: 'hero-section' },
        style: { padding: '80px 20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
        children: [
          {
            id: 'node-title',
            type: 'h1',
            props: {},
            style: { fontSize: '48px', fontWeight: 'bold', color: '#0f172a', margin: 0 },
            children: 'Next-Gen AI Builder'
          },
          {
            id: 'node-btn',
            type: 'button',
            props: {},
            style: { padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' },
            children: 'Get Started'
          }
        ]
      }
    ]
  }
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  viewport: { x: 0, y: 0, zoom: 1 },
  setViewport: (updater) => set((state) => ({
    viewport: typeof updater === 'function' ? updater(state.viewport) : { ...state.viewport, ...updater }
  })),

  selectedScreenIds: [],
  selectedComponentIds: [],
  hoveredComponentId: null,
  setSelectedScreens: (ids) => set({ selectedScreenIds: ids }),
  setSelectedComponents: (ids) => set({ selectedComponentIds: ids }),
  setHoveredComponent: (id) => set({ hoveredComponentId: id }),

  screens: initialScreens,
  past: [],
  future: [],

  commitHistory: () => set((state) => ({
    past: [...state.past, JSON.parse(JSON.stringify(state.screens))], // Deep copy
    future: []
  })),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    return {
      past: newPast,
      future: [JSON.parse(JSON.stringify(state.screens)), ...state.future],
      screens: previous
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      past: [...state.past, JSON.parse(JSON.stringify(state.screens))],
      future: newFuture,
      screens: next
    };
  }),

  setScreens: (screens) => {
    get().commitHistory();
    set({ screens });
  },
  
  updateScreen: (id, updates) => {
    get().commitHistory();
    set((state) => ({
      screens: state.screens.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  },
  
  addScreen: (screen) => {
    get().commitHistory();
    set((state) => ({
      screens: [...state.screens, screen]
    }));
  },
  
  updateNodeStyle: (screenId, nodeId, styleUpdate) => {
    get().commitHistory();
    set((state) => {
      const updateNodeInTree = (nodes: VNode[]): VNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, style: { ...node.style, ...styleUpdate } };
          }
          if (Array.isArray(node.children)) {
            return { ...node, children: updateNodeInTree(node.children) };
          }
          return node;
        });
      };
      return {
        screens: state.screens.map(s => s.id === screenId ? { ...s, nodes: updateNodeInTree(s.nodes) } : s)
      };
    });
  },

  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),
}));
