import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ArrowUp, Palette, Sparkles, ChevronDown, Plus, Smartphone, Monitor, X, Wand2, Brain } from 'lucide-react';
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
  selectedPage?: any;
  onClearSelection?: () => void;
  themeOverrides?: any;
  onCreateNewTheme?: () => void;
  onSelectTheme?: (themeId: string) => void;
}

const AIPromptBar: React.FC<AIPromptBarProps> = ({ onGenerated, onStarted, compact = false, siteId, selectedPage, onClearSelection, themeOverrides, onCreateNewTheme, onSelectTheme }) => {
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
    
    messageApi.info('AI is generating your site…');
    
    let finalPrompt = prompt.trim();
    if (selectedPage) {
      finalPrompt = `[TARGET_PAGE:${selectedPage.id}] ${finalPrompt}`;
    }
    
    submitSiteGeneration(
      finalPrompt,
      model || 'gemini-2.5-flash',
      newSiteId,
      themeOverrides ? JSON.stringify(themeOverrides) : theme,
      (jobId, subdomain) => {
        isSubmittingRef.current = false;
        setPrompt('');
        messageApi.success('Site generated! Loading…');
        onGenerated?.(jobId, subdomain);
      },
      (error) => {
        isSubmittingRef.current = false;
        messageApi.error(error || 'Failed to start generation');
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
        {selectedPage && (
          <div style={{ padding: '12px 16px 0 16px' }}>
            <div className="ai-prompt-selected-page" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', 
              background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', 
              color: '#38bdf8', fontSize: 12, fontWeight: 500, borderRadius: 20, 
              width: 'fit-content'
            }}>
              <Monitor size={14} />
              <span>Target: {selectedPage.title || 'Current Page'}</span>
              <button 
                onClick={onClearSelection} 
                style={{ 
                  background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', 
                  padding: 2, display: 'flex', marginLeft: 4, borderRadius: '50%', 
                  transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
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
            placeholder={compact ? 'What would you like to change or build?' : 'What native mobile app should we design?'}
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
                    theme={themeOverrides?.themeId || theme} 
                    onSelectTheme={(id) => { 
                      setTheme(id); 
                      setShowThemeMenu(false); 
                      onSelectTheme?.(id);
                    }} 
                    onCreateNewTheme={() => {
                      setShowThemeMenu(false);
                      onCreateNewTheme?.();
                    }}
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
                  {model === 'llama-3.3-70b-versatile' ? (
                    <Wand2 size={14} className="ai-model-btn-icon" />
                  ) : model === 'deepseek-chat' ? (
                    <Brain size={14} className="ai-model-btn-icon" />
                  ) : (
                    <Sparkles size={14} className="ai-model-btn-icon" />
                  )}
                  <span>
                    {model === 'gemini-2.0-pro' ? '2.0 Pro' : 
                     model === 'llama-3.3-70b-versatile' ? 'Llama 3.3' : 
                     model === 'deepseek-chat' ? 'DeepSeek' : '2.5 Flash'}
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
