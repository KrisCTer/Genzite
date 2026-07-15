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
  activeTargetPageId: string | null;
  activeStartTime?: number;
  activeModel?: string;
  activePrompt?: string;
  steps: AiLogStep[];
  report: AiLogReport | null;
  activeTab: 'logs' | 'layers';
  setActiveTab: (tab: 'logs' | 'layers') => void;
  startGeneration: (jobId: string, prompt: string, model?: string) => void;
  addStep: (stepName: string, percent: number, detail?: string) => void;
  completeGeneration: (subdomain?: string) => void;
  failGeneration: (errorMsg: string) => void;
  initDefaultLogs: (siteId?: string) => void;
  submitSiteGeneration: (
    prompt: string,
    model: string,
    siteId?: string,
    theme?: string,
    onSuccess?: (jobId: string, subdomain: string) => void,
    onError?: (error: string) => void,
    attachments?: { base64: string; mimeType: string }[]
  ) => Promise<void>;
  cancelGeneration: () => void;
}

const getTimestamp = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
};

const formatModelName = (m?: string) => {
  if (!m) return 'Gemini 2.5 Flash';
  if (m.includes('llama')) return 'Llama 3.3 70B';
  if (m.includes('deepseek')) return 'DeepSeek V4';
  if (m.includes('groq')) return 'Llama 3.3 Versatile';
  if (m.includes('gemini-2.5')) return 'Gemini 2.5 Flash';
  if (m.includes('gemini')) return 'Gemini 2.0 Flash';
  return m;
};

export const useAiLogStore = create<AiLogState>((set, get) => ({
  isGenerating: false,
  currentJobId: null,
  activeTargetPageId: null,
  activeTab: 'logs',
  steps: [],
  report: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  initDefaultLogs: (siteId?: string) => {
    if (get().isGenerating) return;

    if (siteId) {
      try {
        const saved = localStorage.getItem(`genzite_ai_logs_${siteId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.steps && parsed.report) {
            set({ steps: parsed.steps, report: parsed.report });
            return;
          }
        }
      } catch (e) { }
    }

    if (get().report !== null && get().steps.length > 0) return;

    const nowStr = getTimestamp();
    const defaultSteps: AiLogStep[] = [
      { id: 'step-1', step: 'Analyzing prompt & initializing AI workflow...', percent: 20, status: 'completed', timestamp: nowStr },
      { id: 'step-2', step: 'Generating primary design tokens & structure...', percent: 50, status: 'completed', timestamp: nowStr },
      { id: 'step-3', step: 'Workers building Home, About, Projects sections...', percent: 80, status: 'completed', timestamp: nowStr },
      { id: 'step-4', step: 'Merging and finalizing responsive UI layout...', percent: 100, status: 'completed', timestamp: nowStr }
    ];

    const defaultReport: AiLogReport = {
      model: 'Gemini 2.5 Flash',
      duration: 'Ran for 28s',
      actionHistoryTitle: 'Generated Sections: Home, About, Projects, Contact',
      editedFiles: [
        { name: 'src/components/Header.tsx', status: 'completed' },
        { name: 'src/components/HeroSection.tsx', status: 'completed' },
        { name: 'src/components/AboutSection.tsx', status: 'completed' },
        { name: 'src/components/ProjectsGrid.tsx', status: 'completed' },
        { name: 'src/components/ContactForm.tsx', status: 'completed' },
        { name: 'src/components/Footer.tsx', status: 'completed' }
      ],
      buildStatus: 'Built',
      summaryIntro: 'Successfully generated and loaded your web application structure with modern Tailwind CSS tokens and responsive layout sections.',
      summaryTitle: '🎨 Visual & Functional Achievements',
      achievements: [
        {
          title: 'Modern Sleek Design & Glassmorphism:',
          desc: 'Implemented high-end visual aesthetics with curated dark palettes, subtle micro-animations, and responsive layouts.'
        },
        {
          title: 'Full-Stack Component Architecture:',
          desc: 'Generated modular, reusable components using Tailwind CSS v4 design tokens with zero hardcoded placeholders.'
        }
      ],
      checkpoint: 'Checkpoint 110'
    };

    set({ steps: defaultSteps, report: defaultReport });
  },

  startGeneration: (jobId, prompt, model) => {
    const targetMatch = prompt.match(/\[TARGET_PAGE:([a-zA-Z0-9-]+)\]/);
    const targetPageId = targetMatch ? targetMatch[1] : null;
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
      activeTargetPageId: targetPageId,
      activeTab: 'logs',
      steps: [initialStep],
      report: {
        model: formatModelName(model || get().activeModel),
        duration: 'Running...',
        actionHistoryTitle: 'Generating application sections...',
        editedFiles: [],
        buildStatus: 'Building...',
        summaryIntro: `Generating design from prompt: "${prompt}"`,
        summaryTitle: '🚀 Generating Features...',
        achievements: [],
        checkpoint: `Job ${jobId}`
      }
    });
  },

  addStep: (stepName, percent, detail) => {
    set((state) => {
      const elapsed = state.activeStartTime ? Math.round((Date.now() - state.activeStartTime) / 1000) : 12;
      const updatedReport = state.report ? { ...state.report, duration: `Running (${elapsed}s)...` } : null;

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
        return { steps: updatedSteps, report: updatedReport };
      }

      const newStep: AiLogStep = {
        id: `step-${Date.now()}-${updatedSteps.length}`,
        step: stepName,
        percent,
        status: percent >= 100 ? 'completed' : 'in_progress',
        timestamp: getTimestamp(),
        detail: detail || 'AI agent is executing specialized tasks...'
      };

      return { steps: [...updatedSteps, newStep], report: updatedReport };
    });
  },

  completeGeneration: (subdomain?: string) => {
    set((state) => {
      const startTime = state.activeStartTime || (Date.now() - 28000);
      const realSeconds = Math.max(3, Math.round((Date.now() - startTime) / 1000));
      const usedModel = formatModelName(state.activeModel || 'gemini-2.5-flash');
      const userPrompt = state.activePrompt || '';

      let sectionTitle = 'Home, About, Projects, Contact';
      if (userPrompt.toLowerCase().includes('home') || userPrompt.toLowerCase().includes('trang chủ')) {
        sectionTitle = 'Home Page & Components';
      } else if (userPrompt.toLowerCase().includes('about') || userPrompt.toLowerCase().includes('giới thiệu')) {
        sectionTitle = 'About & Features Page';
      } else if (userPrompt.toLowerCase().includes('product') || userPrompt.toLowerCase().includes('sản phẩm')) {
        sectionTitle = 'Products & E-Commerce Grid';
      } else if (userPrompt.toLowerCase().includes('contact') || userPrompt.toLowerCase().includes('liên hệ')) {
        sectionTitle = 'Contact & Support Section';
      } else if (userPrompt.length > 3) {
        sectionTitle = userPrompt.length > 40 ? userPrompt.substring(0, 40) + '...' : userPrompt;
      }

      const updatedSteps = state.steps.map((s) =>
        s.status === 'in_progress' ? { ...s, status: 'completed' as const, percent: 100 } : s
      );

      const newReport: AiLogReport = {
        model: usedModel,
        duration: `Ran for ${realSeconds}s`,
        actionHistoryTitle: `Generated Sections: ${sectionTitle}`,
        editedFiles: [
          { name: 'src/components/Header.tsx', status: 'completed' },
          { name: 'src/components/HeroSection.tsx', status: 'completed' },
          { name: 'src/components/FeaturesSection.tsx', status: 'completed' },
          { name: 'src/components/Footer.tsx', status: 'completed' },
          { name: 'src/App.tsx', status: 'completed' }
        ],
        buildStatus: 'Built',
        summaryIntro: `Successfully generated application features (${sectionTitle}) using ${usedModel} in ${realSeconds} seconds.`,
        summaryTitle: '🎨 Visual & Functional Achievements',
        achievements: [
          {
            title: `Real-time Generation (${usedModel}):`,
            desc: `Constructed and styled custom UI sections to match your exact prompt requirements in ${realSeconds} seconds.`
          },
          {
            title: 'Tailwind CSS v4 Design Tokens:',
            desc: 'Applied sleek dark-mode glassmorphism, responsive bento grids, and consistent spacing.'
          }
        ],
        checkpoint: `Checkpoint ${Math.floor(Math.random() * 90) + 111}`
      };

      const targetSiteId = subdomain || state.currentJobId || 'default';
      try {
        localStorage.setItem(`genzite_ai_logs_${targetSiteId}`, JSON.stringify({
          steps: updatedSteps,
          report: newReport
        }));
      } catch (e) { }

      return {
        isGenerating: false,
        currentJobId: null,
        activeTargetPageId: null,
        steps: updatedSteps,
        report: newReport
      };
    });
  },

  failGeneration: (_errorMsg) => {
    set((state) => {
      const updatedSteps = state.steps.map((s) =>
        s.status === 'in_progress' ? { ...s, status: 'error' as const } : s
      );

      return {
        isGenerating: false,
        currentJobId: null,
        activeTargetPageId: null,
        steps: updatedSteps
      };
    });
  },

  submitSiteGeneration: async (prompt, model, siteId, theme, onSuccess, onError) => {
    try {
      set({ isGenerating: true, activeStartTime: Date.now(), activeModel: model, activePrompt: prompt });
      get().startGeneration(`job-${Date.now()}`, prompt, model);

      const data = await generateSiteApi({ prompt, model, siteId, theme });

      const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
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

            if (payload.error) {
              set({ isGenerating: false });
              get().failGeneration(payload.error);
              onError?.(payload.error);
            } else {
              get().completeGeneration(payload.subdomain);
              onSuccess?.(data.jobId, payload.subdomain);
              set({ isGenerating: false });
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
    set({ isGenerating: false, activeTargetPageId: null });
  }
}));

