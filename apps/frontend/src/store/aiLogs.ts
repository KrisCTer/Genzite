import { create } from 'zustand';
import { generateSiteApi } from '../api/ai';

let globalSseConnection: EventSource | null = null;

export interface AiLogStep {
  id: string;
  step: string;
  percent: number;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  timestamp: string;
  detail?: string;
}

export interface AiActionFile {
  name: string;
  status: 'completed' | 'in_progress' | 'error';
}

export interface AiLogReport {
  model: string;
  duration: string;
  actionHistoryTitle: string;
  editedFiles: AiActionFile[];
  buildStatus: 'Built' | 'Building...' | 'Failed';
  summaryIntro: string;
  summaryTitle: string;
  achievements: { title: string; desc: string }[];
  checkpoint: string;
}

interface AiLogState {
  isGenerating: boolean;
  currentJobId: string | null;
  steps: AiLogStep[];
  report: AiLogReport | null;
  activeTab: 'logs' | 'layers';
  setActiveTab: (tab: 'logs' | 'layers') => void;
  startGeneration: (jobId: string, prompt: string) => void;
  addStep: (stepName: string, percent: number, detail?: string) => void;
  completeGeneration: (subdomain?: string) => void;
  failGeneration: (errorMsg: string) => void;
  initDefaultLogs: () => void;
  submitSiteGeneration: (prompt: string, model: string, siteId: string, onSuccess?: (jobId: string, subdomain?: string) => void, onError?: (error: string) => void) => Promise<void>;
  cancelGeneration: () => void;
}

const getTimestamp = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
};

export const useAiLogStore = create<AiLogState>((set, get) => ({
  isGenerating: false,
  currentJobId: null,
  activeTab: 'logs',
  steps: [],
  report: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  initDefaultLogs: () => {
    if (get().report !== null || get().steps.length > 0) return;

    const defaultReport: AiLogReport = {
      model: 'Gemini 3.5 Flash',
      duration: 'Ran for 260s',
      actionHistoryTitle: 'Here are key actions taken for the app:',
      editedFiles: [
        { name: 'metadata.json', status: 'completed' },
        { name: 'server/gemini.ts', status: 'completed' },
        { name: 'server.ts', status: 'completed' },
        { name: 'package.json', status: 'completed' },
        { name: 'src/index.css', status: 'completed' },
        { name: 'src/types.ts', status: 'completed' },
        { name: 'src/lib/api.ts', status: 'completed' },
        { name: 'src/components/Header.tsx', status: 'completed' },
        { name: 'src/components/ModelSelector.tsx', status: 'completed' },
        { name: 'src/components/ProductSection.tsx', status: 'completed' },
        { name: 'src/components/MockupSection.tsx', status: 'completed' },
        { name: 'src/App.tsx', status: 'completed' }
      ],
      buildStatus: 'Built',
      summaryIntro: 'I have successfully created the Product Mockup Visualizer, a full-stack React and Express application designed to take a product image and visualize it consistently across various marketing mediums.\n\nHere is an overview of the design concepts and functional features implemented:',
      summaryTitle: '🎨 Visual & Functional Achievements',
      achievements: [
        {
          title: 'Consistent AI Branding ("Nano Banana" Engine):',
          desc: 'Powered by the server-side Gemini 3.1 Flash series image-editing models (nicknamed Nano Banana), the application takes your core product design and seamlessly projects it onto different marketing assets while maintaining brand, logo, and artwork consistency.'
        },
        {
          title: 'Premium Default Asset:',
          desc: 'I used AI image-generation tools to create a custom, high-tech Nano Banana Mascot 3D render. It serves as the preloaded default product, allowing you to experience the visualizer instantly.'
        },
        {
          title: 'Full-Stack Product Sidebar:',
          desc: 'Drag & Drop Upload: A clean, dashed dropzone supporting file drag-and-drop or manual selection for any custom PNG/JPG product image. Product Generator: A prompt-based product creator that allows you to describe a brand-new design from scratch and generates the core design using Gemini. Interactive Controls: Easily swap between uploaded graphics, custom generations, or restore the default Nano Banana mascot.'
        },
        {
          title: 'Marketing Mockup Studio Grid:',
          desc: 'A responsive bento-grid displaying five primary visualization boards: Classic Coffee Mug, Urban Giant Billboard, Premium Cotton T-shirt, Sleek Phone Case, and Canvas Tote Bag.'
        },
        {
          title: 'Fine-tuned Art Direction:',
          desc: 'Each medium includes an expandable Advanced Styling bar where you can provide custom prompts to adjust the environment or aesthetic (e.g., "Make the t-shirt navy blue", "Place the mug on a cozy cafe counter in warm morning light").'
        },
        {
          title: 'Dynamic Loading Sequences:',
          desc: 'Provides interactive loading messages detailing the AI processing pipeline (e.g., Analyzing product boundaries..., Mapping perspective coordinates...).'
        },
        {
          title: 'High-Fidelity Consistency Lightbox:',
          desc: 'Click any generated mockup to open a side-by-side comparison modal. This matches the original asset against the final mockup, demonstrating the model\'s accuracy in preserving shapes and text.'
        },
        {
          title: 'Asset Downloading:',
          desc: 'Seamlessly download any final rendered mockup in full resolution.'
        }
      ],
      checkpoint: 'Checkpoint 110'
    };

    set({ report: defaultReport });
  },

  startGeneration: (jobId, prompt) => {
    const initialStep: AiLogStep = {
      id: `gen-${Date.now()}-0`,
      step: 'Analyzing prompt & initializing AI workflow...',
      percent: 10,
      status: 'in_progress',
      timestamp: getTimestamp(),
      detail: `Prompt: "${prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt}"`
    };

    set({
      isGenerating: true,
      currentJobId: jobId,
      activeTab: 'logs',
      steps: [initialStep],
      report: null
    });
  },

  addStep: (stepName, percent, detail) => {
    set((state) => {
      const updatedSteps = state.steps.map((s) => 
        s.status === 'in_progress' ? { ...s, status: 'completed' as const, percent: Math.max(s.percent, percent - 10) } : s
      );

      const existingIdx = updatedSteps.findIndex((s) => s.step === stepName);
      if (existingIdx !== -1) {
        updatedSteps[existingIdx] = {
          ...updatedSteps[existingIdx],
          percent,
          status: percent >= 100 ? 'completed' : 'in_progress',
          detail: detail || updatedSteps[existingIdx].detail,
          timestamp: getTimestamp()
        };
        return { steps: updatedSteps };
      }

      const newStep: AiLogStep = {
        id: `step-${Date.now()}-${updatedSteps.length}`,
        step: stepName,
        percent,
        status: percent >= 100 ? 'completed' : 'in_progress',
        timestamp: getTimestamp(),
        detail: detail || 'AI agent is executing specialized tasks...'
      };

      return { steps: [...updatedSteps, newStep] };
    });
  },

  completeGeneration: () => {
    set((state) => {
      const updatedSteps = state.steps.map((s) => 
        s.status === 'in_progress' ? { ...s, status: 'completed' as const, percent: 100 } : s
      );

      const newReport: AiLogReport = {
        model: 'Gemini 3.5 Flash',
        duration: 'Ran for 48s',
        actionHistoryTitle: 'Here are key actions taken for the app:',
        editedFiles: [
          { name: 'src/index.css', status: 'completed' },
          { name: 'src/types.ts', status: 'completed' },
          { name: 'src/components/Header.tsx', status: 'completed' },
          { name: 'src/components/HeroSection.tsx', status: 'completed' },
          { name: 'src/components/FeaturesGrid.tsx', status: 'completed' },
          { name: 'src/components/ProductCard.tsx', status: 'completed' },
          { name: 'src/components/Footer.tsx', status: 'completed' },
          { name: 'src/App.tsx', status: 'completed' }
        ],
        buildStatus: 'Built',
        summaryIntro: 'I have successfully generated and updated your web application layout based on your latest instructions.\n\nHere is an overview of the design concepts and functional features implemented:',
        summaryTitle: '🎨 Visual & Functional Achievements',
        achievements: [
          {
            title: 'Modern Sleek Design & Glassmorphism:',
            desc: 'Implemented high-end visual aesthetics with curated dark palettes, subtle micro-animations, and responsive layouts.'
          },
          {
            title: 'Full-Stack Component Architecture:',
            desc: 'Generated modular, reusable components using Tailwind CSS v4 design tokens with zero hardcoded placeholders.'
          },
          {
            title: 'Responsive Bento Grids & Interactive UI:',
            desc: 'Structured section layouts to adapt seamlessly across Desktop, Tablet, and Mobile viewport breakpoints.'
          }
        ],
        checkpoint: `Checkpoint ${Math.floor(Math.random() * 90) + 111}`
      };

      return {
        isGenerating: false,
        currentJobId: null,
        steps: updatedSteps,
        report: newReport
      };
    });
  },

  failGeneration: (errorMsg) => {
    set((state) => {
      const updatedSteps = state.steps.map((s) => 
        s.status === 'in_progress' ? { ...s, status: 'error' as const } : s
      );

      return {
        isGenerating: false,
        currentJobId: null,
        steps: updatedSteps
      };
    });
  },
  
  submitSiteGeneration: async (prompt, model, siteId, onSuccess, onError) => {
    try {
      set({ isGenerating: true });
      get().startGeneration(`job-${Date.now()}`, prompt);
      
      const data = await generateSiteApi({ prompt, model, siteId });
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      globalSseConnection = new EventSource(`${baseUrl}/ai/stream/${data.jobId}`);
      
      globalSseConnection.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.step) {
            get().addStep(payload.step, payload.percent || 50);
          }
          if (payload.done) {
            globalSseConnection?.close();
            globalSseConnection = null;
            set({ isGenerating: false });
            
            if (payload.error) {
              get().failGeneration(payload.error);
              onError?.(payload.error);
            } else {
              get().completeGeneration(payload.subdomain);
              onSuccess?.(data.jobId, payload.subdomain);
            }
          }
        } catch (e) {
          console.error("SSE parse error", e);
        }
      };
      
      globalSseConnection.onerror = () => {
        globalSseConnection?.close();
        globalSseConnection = null;
        set({ isGenerating: false });
        get().failGeneration('Mất kết nối stream tiến trình AI');
        onError?.('Connection to generation stream lost');
      };
    } catch (error: any) {
      set({ isGenerating: false });
      const errMsg = error.response?.data?.message || 'Failed to start generation';
      get().failGeneration(errMsg);
      onError?.(errMsg);
    }
  },

  cancelGeneration: () => {
    if (globalSseConnection) {
      globalSseConnection.close();
      globalSseConnection = null;
    }
    set({ isGenerating: false });
  }
}));
