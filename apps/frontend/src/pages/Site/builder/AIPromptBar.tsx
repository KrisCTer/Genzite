import React, { useCallback, useRef, useState } from 'react';
import { message, Select } from 'antd';
import { ArrowUp, ImagePlus, Paperclip, Sparkles } from 'lucide-react';
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

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, model, isGenerating]);

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
          {QUICK_PROMPTS.map((quickPrompt) => (
            <button
              key={quickPrompt}
              className="ai-prompt-quick-chip"
              type="button"
              onClick={() => {
                setPrompt(quickPrompt);
                setShowQuick(false);
                inputRef.current?.focus();
              }}
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      )}

      <div className="ai-prompt-bar-inner">
        <div className="ai-prompt-main-row">
          <div className="ai-prompt-left-tools">
            <button className="ai-prompt-icon-btn" type="button" title="Attach file">
              <Paperclip size={18} strokeWidth={2} />
            </button>
            <button className="ai-prompt-icon-btn" type="button" title="Upload image">
              <ImagePlus size={18} strokeWidth={2} />
            </button>
            <button
              className={`ai-prompt-icon-btn ai-prompt-icon-btn--spark ${showQuick ? 'active' : ''}`}
              type="button"
              onClick={() => setShowQuick(!showQuick)}
              title="AI prompt templates"
            >
              <Sparkles size={18} strokeWidth={2.1} />
            </button>
          </div>

          <textarea
            ref={inputRef}
            className="ai-prompt-input"
            placeholder={compact ? 'Describe changes...' : 'Ask Genzite to build a site, page, store, dashboard...'}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={1}
          />
        </div>

        <div className="ai-prompt-controls">
          <Select
            className="ai-prompt-model-select"
            placeholder="Flash"
            value={model}
            onChange={setModel}
            options={MODEL_OPTIONS}
            variant="borderless"
            popupMatchSelectWidth={150}
            style={{ minWidth: 104 }}
          />

          <button
            className="ai-prompt-submit"
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            title="Generate"
          >
            {isGenerating ? (
              <div className="ai-prompt-loading">
                <span className="ai-prompt-dot" />
                <span className="ai-prompt-dot" />
                <span className="ai-prompt-dot" />
              </div>
            ) : (
              <ArrowUp size={18} strokeWidth={2.6} />
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AIPromptBar;
