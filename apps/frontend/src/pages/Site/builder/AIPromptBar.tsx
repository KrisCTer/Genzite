import React, { useCallback, useRef, useState } from 'react';
import { message, Select } from 'antd';
import { ArrowUp, ImagePlus, Paperclip, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { generateSiteApi, getSiteJobApi } from '../../../api/ai';
import './AIPromptBar.css';

interface AIPromptBarProps {
  /** Called when AI generation completes with the new jobId */
  onGenerated?: (jobId: string) => void;
  /** Whether to show the bar in its compact (inline) form */
  compact?: boolean;
}

const MODEL_OPTIONS = [
  { value: 'gemini-2.5-flash', label: '3 Flash' },
  { value: 'gemini-2.0-pro', label: '2.0 Pro' },
  { value: 'gemini-1.5-pro', label: '1.5 Pro' },
  { value: 'deepseek-chat', label: 'DeepSeek' },
];

const QUICK_PROMPTS = [
  'Portfolio for a photographer',
  'SaaS landing page',
  'E-commerce store homepage',
  'Restaurant menu site',
  'Personal blog with dark theme',
];

const AIPromptBar: React.FC<AIPromptBarProps> = ({ onGenerated, compact = false }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const siteMutation = useMutation({
    mutationFn: generateSiteApi,
    onSuccess: (data) => {
      message.info('AI is generating your site...');
      pollRef.current = setInterval(async () => {
        try {
          const job = await getSiteJobApi(data.jobId);
          if (job.state === 'completed') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setIsGenerating(false);
            setPrompt('');
            message.success('Site generated! Loading...');
            onGenerated?.(data.jobId);
          } else if (job.state === 'failed') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setIsGenerating(false);
            message.error(job.failedReason || 'Generation failed');
          }
        } catch {
          // Ignore transient polling errors.
        }
      }, 2500);
    },
    onError: (error: any) => {
      setIsGenerating(false);
      message.error(error.response?.data?.message || 'Failed to start generation');
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setShowQuick(false);
    siteMutation.mutate({ prompt: prompt.trim(), model });
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
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className={`ai-prompt-bar ${compact ? 'compact' : ''} ${isGenerating ? 'generating' : ''}`}>
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
  );
};

export default AIPromptBar;
