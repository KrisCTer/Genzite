import React, { useState, useRef, useCallback } from 'react';
import { message, Select } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { generateSiteApi } from '../../../api/ai';
import './AIPromptBar.css';

interface AIPromptBarProps {
  /** Called when AI generation completes with the new jobId */
  onGenerated?: (jobId: string) => void;
  /** Whether to show the bar in its compact (inline) form */
  compact?: boolean;
  /** Optional siteId to append pages to an existing site */
  siteId?: string;
}

const MODEL_OPTIONS = [
  { value: 'gemini-2.5-flash', label: '✦ 2.5 Flash' },
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 (Free)' },
  { value: 'gemini-2.0-pro', label: '✦ 2.0 Pro' },
  { value: 'deepseek-chat', label: 'DeepSeek' },
];

const QUICK_PROMPTS = [
  'Portfolio for a photographer',
  'SaaS landing page',
  'E-commerce store homepage',
  'Restaurant menu site',
  'Personal blog with dark theme',
];

const AIPromptBar: React.FC<AIPromptBarProps> = ({ onGenerated, compact = false, siteId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  const siteMutation = useMutation({
    mutationFn: generateSiteApi,
    onSuccess: (data) => {
      messageApi.info('AI is generating your site…');
      // Connect to SSE stream
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const eventSource = new EventSource(`${baseUrl}/ai/stream/${data.jobId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.done) {
            eventSource.close();
            sseRef.current = null;
            setIsGenerating(false);
            
            if (payload.error) {
              messageApi.error(payload.error || 'Generation failed');
            } else {
              setPrompt('');
              messageApi.success('Site generated! Loading…');
              onGenerated?.(data.jobId);
            }
          }
        } catch (e) {
          console.error("SSE parse error", e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        sseRef.current = null;
        setIsGenerating(false);
        messageApi.error('Connection to generation stream lost');
      };
      
      sseRef.current = eventSource;
    },
    onError: (error: any) => {
      setIsGenerating(false);
      messageApi.error(error.response?.data?.message || 'Failed to start generation');
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setShowQuick(false);
    siteMutation.mutate({ prompt: prompt.trim(), model, siteId });
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, model, isGenerating]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {contextHolder}
      <div className={`ai-prompt-bar ${compact ? 'compact' : ''} ${isGenerating ? 'generating' : ''}`}>
        {/* Quick prompts (toggle) */}
      {showQuick && !isGenerating && (
        <div className="ai-prompt-quick">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              className="ai-prompt-quick-chip"
              onClick={() => { setPrompt(q); setShowQuick(false); inputRef.current?.focus(); }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="ai-prompt-bar-inner">
        {/* Plus button for quick prompts */}
        <button
          className="ai-prompt-icon-btn"
          onClick={() => setShowQuick(!showQuick)}
          title="Quick templates"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Main input */}
        <textarea
          ref={inputRef}
          className="ai-prompt-input"
          placeholder={compact ? 'Describe changes…' : 'What would you like to build?'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          rows={1}
        />

        {/* Right controls */}
        <div className="ai-prompt-controls">
          {/* Model selector */}
          <Select
            className="ai-prompt-model-select"
            placeholder="Flash"
            value={model}
            onChange={setModel}
            options={MODEL_OPTIONS}
            variant="borderless"
            size="small"
            popupMatchSelectWidth={140}
            style={{ minWidth: 90 }}
          />

          {/* Submit button */}
          <button
            className="ai-prompt-submit"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            title="Generate"
          >
            {isGenerating ? (
              <div className="ai-prompt-loading">
                <span className="ai-prompt-dot" /><span className="ai-prompt-dot" /><span className="ai-prompt-dot" />
              </div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AIPromptBar;
