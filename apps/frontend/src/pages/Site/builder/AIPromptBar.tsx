import React, { useState, useRef, useCallback } from 'react';
import { message, Select } from 'antd';
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
  { value: 'gemini-2.5-flash', label: '✦ 3 Flash' },
  { value: 'gemini-2.0-pro', label: '✦ 2.0 Pro' },
  { value: 'gemini-1.5-pro', label: '✦ 1.5 Pro' },
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
      message.info('AI is generating your site…');
      // Start polling for completion
      pollRef.current = setInterval(async () => {
        try {
          const job = await getSiteJobApi(data.jobId);
          if (job.state === 'completed') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setIsGenerating(false);
            setPrompt('');
            message.success('Site generated! Loading…');
            onGenerated?.(data.jobId);
          } else if (job.state === 'failed') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setIsGenerating(false);
            message.error(job.failedReason || 'Generation failed');
          }
        } catch {
          // Ignore polling errors
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
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
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
  );
};

export default AIPromptBar;
