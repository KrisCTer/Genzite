import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ArrowUp, Palette, Sparkles, ChevronDown, Plus, Smartphone, Monitor } from 'lucide-react';
import { message } from 'antd';
import './AIPromptBar.css';

import { QUICK_PROMPTS, COMPACT_QUICK_PROMPTS, THEME_OPTIONS } from './prompt-bar/constants';
import ThemeMenu from './prompt-bar/ThemeMenu';
import ModelMenu from './prompt-bar/ModelMenu';
import AddMenu from './prompt-bar/AddMenu';
import { useAiLogStore } from '../../../store/aiLogs';

interface AIPromptBarProps {
  onGenerated?: (jobId: string, subdomain?: string) => void;
  onStarted?: (siteId: string) => void;
  compact?: boolean;
  siteId?: string;
}

const AIPromptBar: React.FC<AIPromptBarProps> = ({ onGenerated, onStarted, compact = false, siteId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string | undefined>(undefined);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [platform, setPlatform] = useState<'app' | 'web'>('app');
  
  const isGenerating = useAiLogStore(state => state.isGenerating);
  const submitSiteGeneration = useAiLogStore(state => state.submitSiteGeneration);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const modelBtnRef = useRef<HTMLButtonElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    const newSiteId = siteId || `gen-${Date.now()}`;
    if (onStarted) {
      onStarted(newSiteId);
    }
    
    message.info('AI is generating your site…');
    
    submitSiteGeneration(
      prompt.trim(),
      model || 'gemini-2.5-flash',
      newSiteId,
      (jobId, subdomain) => {
        isSubmittingRef.current = false;
        setPrompt('');
        message.success('Site generated! Loading…');
        onGenerated?.(jobId, subdomain);
      },
      (error) => {
        console.error("AI Generation Failed:", error);
        isSubmittingRef.current = false;
        message.error(error || 'Failed to start generation');
      }
    );
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, model, isGenerating]);

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node) && themeBtnRef.current && !themeBtnRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node) && modelBtnRef.current && !modelBtnRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node) && addBtnRef.current && !addBtnRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMenu);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu);
    };
  }, []);

  return (
    <>
      {contextHolder}
      <div className={`ai-prompt-bar ${compact ? 'compact' : ''} ${isGenerating ? 'generating' : ''}`}>
        {compact && !isGenerating && (
          <div className="ai-prompt-quick compact-quick">
            {COMPACT_QUICK_PROMPTS.map((item, idx) => (
              <button
                key={item.text}
                className="ai-prompt-quick-chip compact-chip"
                type="button"
                onClick={() => {
                  setPrompt(item.text);
                  inputRef.current?.focus();
                }}
              >
                <span>{item.text}</span>
                <span className="chip-badge">{item.badge || idx + 1}</span>
              </button>
            ))}
          </div>
        )}

        <div className="ai-prompt-bar-inner">
          <textarea
            ref={inputRef}
            className="ai-prompt-input"
            placeholder={compact ? 'Bạn muốn thay đổi hoặc tạo nội dung gì?' : 'What native mobile app should we design?'}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={compact ? 1 : 4}
          />

          <div className="ai-prompt-bottom-row">
            <div className="ai-prompt-left-tools">
              <div className="ai-add-picker-wrapper">
                <button
                  className={`ai-prompt-icon-btn ${showAddMenu ? 'active' : ''}`}
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  ref={addBtnRef}
                  title="Add content"
                >
                  <Plus size={16} strokeWidth={2} className="ai-add-btn-icon" />
                </button>
                {showAddMenu && <AddMenu ref={addMenuRef} onClose={() => setShowAddMenu(false)} />}
              </div>

              {compact && (
                <button
                  className="ai-prompt-icon-btn ai-slash-btn"
                  type="button"
                  onClick={() => {
                    setPrompt((prev) => (prev ? prev + ' /' : '/'));
                    inputRef.current?.focus();
                  }}
                  title="Slash commands"
                >
                  /
                </button>
              )}

              {!compact && (
                <div className="ai-platform-toggle">
                  <button 
                    className={`ai-platform-btn ${platform === 'app' ? 'active' : ''}`} 
                    onClick={() => setPlatform('app')} 
                    type="button"
                  >
                    <Smartphone size={14} /> App
                  </button>
                  <button 
                    className={`ai-platform-btn ${platform === 'web' ? 'active' : ''}`} 
                    onClick={() => setPlatform('web')} 
                    type="button"
                  >
                    <Monitor size={14} /> Web
                  </button>
                </div>
              )}
            </div>

            <div className="ai-prompt-controls">
              <div className="ai-theme-picker-wrapper">
                <button 
                  className={`ai-prompt-theme-btn ${showThemeMenu ? 'active' : ''}`} 
                  type="button"
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  ref={themeBtnRef}
                  title="Design System"
                >
                  {theme && THEME_OPTIONS.find(t => t.id === theme) ? (
                    <div 
                      className="ai-theme-swatch"
                      style={{ 
                        background: `radial-gradient(circle at 30% 30%, ${THEME_OPTIONS.find(t => t.id === theme)!.colors[0]}, ${THEME_OPTIONS.find(t => t.id === theme)!.colors[1]} 60%, ${THEME_OPTIONS.find(t => t.id === theme)!.colors[2]} 100%)`,
                        width: 22,
                        height: 22
                      }}
                    ></div>
                  ) : (
                    <Palette size={16} strokeWidth={2.1} />
                  )}
                </button>
                {showThemeMenu && (
                  <ThemeMenu 
                    ref={themeMenuRef} 
                    theme={theme} 
                    onSelectTheme={(id) => { setTheme(id); setShowThemeMenu(false); }} 
                  />
                )}
              </div>

              <div className="ai-model-picker-wrapper">
                <button
                  className={`ai-prompt-model-btn ${showModelMenu ? 'active' : ''}`}
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  ref={modelBtnRef}
                  title="Select Model"
                >
                  <Sparkles size={14} className="ai-model-btn-icon" />
                  <span>
                    {model === 'gemini-2.0-pro' ? '2.0 Pro' : 
                     model === 'llama-3.3-70b-versatile' ? 'Llama 3.3' : 
                     model === 'deepseek-chat' ? 'DeepSeek' : '3 Flash'}
                  </span>
                  <ChevronDown size={14} className="ai-model-btn-chevron" />
                </button>
                {showModelMenu && (
                  <ModelMenu 
                    ref={modelMenuRef} 
                    model={model} 
                    onSelectModel={(m) => { setModel(m); setShowModelMenu(false); }} 
                  />
                )}
              </div>

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
      </div>
      
      {!compact && !isGenerating && (
        <div className="ai-prompt-quick">
          {QUICK_PROMPTS.map((quickPrompt) => (
            <button
              key={quickPrompt}
              className="ai-prompt-quick-chip"
              type="button"
              onClick={() => {
                setPrompt(quickPrompt);
                inputRef.current?.focus();
              }}
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default AIPromptBar;
