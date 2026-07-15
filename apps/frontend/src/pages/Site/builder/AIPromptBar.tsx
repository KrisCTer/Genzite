import React, { useCallback, useRef, useState, useEffect } from 'react';
import { ArrowUp, Palette, Sparkles, ChevronDown, Plus, Smartphone, Monitor, X, Wand2, Brain } from 'lucide-react';
import { message } from 'antd';
import './AIPromptBar.css';

import { QUICK_PROMPTS, COMPACT_QUICK_PROMPTS, THEME_OPTIONS } from './prompt-bar/constants';
import ThemeMenu from './prompt-bar/ThemeMenu';
import ModelMenu from './prompt-bar/ModelMenu';
import AddMenu from './prompt-bar/AddMenu';
import { useAiLogStore } from '../../../store/aiLogs';
import { improvePromptApi } from '../../../api/ai';

interface AIPromptBarProps {
  onGenerated?: (jobId: string, subdomain?: string, platform?: 'app' | 'web') => void;
  onStarted?: (siteId: string, platform?: 'app' | 'web') => void;
  onPlatformChange?: (platform: 'app' | 'web') => void;
  initialPlatform?: 'app' | 'web';
  compact?: boolean;
  siteId?: string;
  selectedPage?: any;
  selectedPages?: any[];
  onRemovePage?: (pageId: string) => void;
  onClearSelection?: () => void;
  themeOverrides?: any;
  onCreateNewTheme?: () => void;
  onSelectTheme?: (themeId: string) => void;
  customInstructions?: string;
  chatModel?: string;
}

const AIPromptBar: React.FC<AIPromptBarProps> = ({ onGenerated, onStarted, onPlatformChange, initialPlatform, compact = false, siteId, selectedPage, selectedPages, onRemovePage, onClearSelection, themeOverrides, onCreateNewTheme, onSelectTheme, customInstructions, chatModel }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [prompt, setPrompt] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [model, setModel] = useState<string | undefined>(chatModel || undefined);

  useEffect(() => {
    if (chatModel) {
      setModel(chatModel);
    }
  }, [chatModel]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [platform, setPlatform] = useState<'app' | 'web'>(initialPlatform || 'app');
  const [attachments, setAttachments] = useState<{ id: string; file: File; url?: string; previewUrl: string; base64: string; mimeType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPlatform) {
      setPlatform(initialPlatform);
    }
  }, [initialPlatform]);
  
  const isGenerating = useAiLogStore(state => state.isGenerating);
  const submitSiteGeneration = useAiLogStore(state => state.submitSiteGeneration);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const compactQuickRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, didDrag: false });
  
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const modelBtnRef = useRef<HTMLButtonElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      messageApi.warning('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setAttachments(prev => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
            base64,
            mimeType: file.type
          }
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => processFile(file));
    }
    if (event.target) event.target.value = '';
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => {
      const target = prev.find(a => a.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSubmit = () => {
    if ((!prompt.trim() && attachments.length === 0) || isGenerating || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    const newSiteId = siteId || `gen-${Date.now()}`;
    if (onStarted) {
      onStarted(newSiteId, platform);
    }
    
    messageApi.info('AI is generating your site…');
    
    let finalPrompt = prompt.trim() || 'Design UI matching the attached reference image.';
    if (customInstructions) {
      finalPrompt = `[CUSTOM_INSTRUCTIONS: ${customInstructions}]\n\n${finalPrompt}`;
    }
    if (selectedPage) {
      finalPrompt = `[TARGET_PAGE:${selectedPage.id}] ${finalPrompt}`;
    }
    finalPrompt = `[PLATFORM:${platform.toUpperCase()}] ${finalPrompt}`;
    
    submitSiteGeneration(
      finalPrompt,
      model || 'gemini-2.5-flash',
      newSiteId,
      themeOverrides ? JSON.stringify(themeOverrides) : theme,
      (jobId, subdomain) => {
        isSubmittingRef.current = false;
        setPrompt('');
        attachments.forEach(a => URL.revokeObjectURL(a.previewUrl));
        setAttachments([]);
        messageApi.success('Site generated! Loading…');
        onGenerated?.(jobId, subdomain, platform);
      },
      (error) => {
        isSubmittingRef.current = false;
        messageApi.error(error || 'Failed to start generation');
      },
      attachments.length > 0 ? attachments.map(a => ({ base64: a.base64, url: a.url, mimeType: a.mimeType })) : undefined
    );
  };

  const handleImprovePrompt = async () => {
    if (!prompt.trim()) {
      messageApi.warning('Please enter a prompt to improve');
      return;
    }
    setIsImproving(true);
    // Remove the messageApi.loading toast as we use the glowing border now
    try {
      const data = await improvePromptApi({ prompt });
      if (data.improved) {
        setPrompt(data.improved);
        messageApi.success('Prompt improved!');
      } else {
        throw new Error('No improved prompt returned');
      }
    } catch (error) {
      console.error('Improve prompt error:', error);
      messageApi.error('Failed to improve prompt');
    } finally {
      setIsImproving(false);
    }
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
        {((selectedPages && selectedPages.length > 0) || selectedPage) && (
          <div style={{ padding: '12px 16px 0 16px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6, marginRight: 2 }}>
              <Monitor size={14} style={{ color: '#38bdf8' }} /> Target:
            </span>
            {(selectedPages && selectedPages.length > 0 ? selectedPages : [selectedPage]).map((pageItem: any) => (
              <div 
                key={pageItem.id || 'current'} 
                className="ai-prompt-selected-page" 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', 
                  background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', 
                  color: '#38bdf8', fontSize: 12, fontWeight: 500, borderRadius: 20, 
                  width: 'fit-content'
                }}
              >
                <span>{pageItem.title || 'Current Page'}</span>
                <button 
                  type="button"
                  onClick={() => {
                    if (onRemovePage && pageItem.id) {
                      onRemovePage(pageItem.id);
                    } else if (onClearSelection) {
                      onClearSelection();
                    }
                  }} 
                  style={{ 
                    background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', 
                    padding: 2, display: 'flex', marginLeft: 2, borderRadius: '50%', 
                    transition: 'background 0.2s' 
                  }}
                  title="Remove from selection"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        {compact && !isGenerating && (
          <div 
            className="ai-prompt-quick compact-quick"
            ref={compactQuickRef}
            onMouseDown={(e) => {
              if (!compactQuickRef.current) return;
              dragState.current.isDown = true;
              dragState.current.didDrag = false;
              dragState.current.startX = e.pageX - compactQuickRef.current.offsetLeft;
              dragState.current.scrollLeft = compactQuickRef.current.scrollLeft;
            }}
            onMouseLeave={() => { dragState.current.isDown = false; }}
            onMouseUp={() => { dragState.current.isDown = false; }}
            onMouseMove={(e) => {
              if (!dragState.current.isDown || !compactQuickRef.current) return;
              e.preventDefault();
              const x = e.pageX - compactQuickRef.current.offsetLeft;
              const walk = (x - dragState.current.startX) * 1.5;
              if (Math.abs(walk) > 3) dragState.current.didDrag = true;
              compactQuickRef.current.scrollLeft = dragState.current.scrollLeft - walk;
            }}
          >
            {COMPACT_QUICK_PROMPTS.map((item, idx) => (
              <button
                key={item.text}
                className="ai-prompt-quick-chip compact-chip"
                type="button"
                onClick={(e) => {
                  if (dragState.current.didDrag) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
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

        <div className={`ai-prompt-bar-inner ${isImproving ? 'is-improving' : ''}`}>
          {attachments.length > 0 && (
            <div className="ai-prompt-attachments" style={{ display: 'flex', gap: 8, padding: '10px 14px 4px 14px', flexWrap: 'wrap' }}>
              {attachments.map(att => (
                <div key={att.id} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden', background: '#181b24', paddingRight: 24, height: 42 }}>
                  <img src={att.previewUrl} alt="Upload" style={{ height: 42, width: 42, objectFit: 'cover' }} />
                  <span style={{ fontSize: 11, color: '#e2e8f0', padding: '0 8px', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {att.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', cursor: 'pointer' }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={inputRef}
            className="ai-prompt-input"
            placeholder={compact ? 'What would you like to change or build?' : (platform === 'app' ? 'What native mobile app should we design?' : 'What stunning website should we design?')}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={isGenerating || isImproving}
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
                {showAddMenu && (
                  <AddMenu 
                    ref={addMenuRef} 
                    onClose={() => setShowAddMenu(false)} 
                    onImprove={handleImprovePrompt} 
                    onUploadFile={() => {
                      setShowAddMenu(false);
                      window.dispatchEvent(new CustomEvent('genzite:open-media-modal', {
                        detail: {
                          onSelect: (url: string) => {
                            const cleanUrl = url.split('?')[0];
                            const filename = cleanUrl.split('/').pop() || `image-${Date.now()}.jpg`;
                            const ext = filename.split('.').pop()?.toLowerCase();
                            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

                            setAttachments(prev => [
                              ...prev,
                              {
                                id: `img-${Date.now()}-${Math.random()}`,
                                file: new File([], filename),
                                url,
                                previewUrl: url,
                                base64: '',
                                mimeType
                              }
                            ]);
                          }
                        }
                      }));
                    }} 
                  />
                )}
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

                <div className="ai-platform-toggle">
                  <button 
                    className={`ai-platform-btn ${platform === 'app' ? 'active' : ''}`} 
                    onClick={() => {
                      setPlatform('app');
                      onPlatformChange?.('app');
                    }} 
                    type="button"
                  >
                    <Smartphone size={14} /> App
                  </button>
                  <button 
                    className={`ai-platform-btn ${platform === 'web' ? 'active' : ''}`} 
                    onClick={() => {
                      setPlatform('web');
                      onPlatformChange?.('web');
                    }} 
                    type="button"
                  >
                    <Monitor size={14} /> Web
                  </button>
                </div>
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
                disabled={(!prompt.trim() && attachments.length === 0) || isGenerating}
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
