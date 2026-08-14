
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Drawer, Input, message, Dropdown } from 'antd';
import {
  GlobalOutlined, LockOutlined, LinkOutlined, SearchOutlined, ClockCircleOutlined, FlagOutlined,
  GithubOutlined, CloudUploadOutlined, DatabaseOutlined, CreditCardOutlined, MailOutlined,
  ApiOutlined, BarChartOutlined, SafetyCertificateOutlined, DownOutlined, CloseOutlined,
  RightOutlined, SettingOutlined, QuestionCircleOutlined, InfoCircleOutlined,
  RocketOutlined, PictureOutlined, SyncOutlined, CopyOutlined
} from '@ant-design/icons';
import { Trash2, Sparkles, Wand2, Brain, ChevronDown } from 'lucide-react';
import { MODEL_OPTIONS } from '../prompt-bar/constants';
import ModelMenu from '../prompt-bar/ModelMenu';
import { submitFeedbackApi, updateSiteApi, checkSubdomainAvailabilityApi } from '../../../../api/sites';

export interface CanvasToolbarModalsProps {
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (val: boolean) => void;
  isChatSettingsOpen: boolean;
  setIsChatSettingsOpen: (val: boolean) => void;
  isBugReportOpen: boolean;
  setIsBugReportOpen: (val: boolean) => void;
  isCustomInstOpen: boolean;
  setIsCustomInstOpen: (val: boolean) => void;
  
  activeDrawerTab: any;
  setActiveDrawerTab: (val: any) => void;
  
  nameVal: string;
  setNameVal: (val: string) => void;

  promptVal: string;
  setPromptVal: (val: string) => void;
  
  handleSaveRename: () => void;
  onPublish?: () => void;
  
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  models?: {key: string, label: string}[];
  shareAccess: string;
  setShareAccess: (val: string) => void;
  sharedEmails?: string[];
  onUpdateSharedEmails?: (emails: string[]) => void;
  bugReportText: string;
  setBugReportText: (val: string) => void;
  user?: any;
  handleShare?: () => void;

  isDeleteProjectModalOpen?: boolean;
  setIsDeleteProjectModalOpen?: (val: boolean) => void;
  handleConfirmDeleteProject?: () => void;
  isDeletingProject?: boolean;
  siteTitle?: string;
  site?: any;
}


export const CanvasToolbarModals: React.FC<CanvasToolbarModalsProps> = ({
  isRenameModalOpen, setIsRenameModalOpen,
  isChatSettingsOpen, setIsChatSettingsOpen,
  isBugReportOpen, setIsBugReportOpen,
  isCustomInstOpen, setIsCustomInstOpen,
  activeDrawerTab, setActiveDrawerTab,
  nameVal, setNameVal,

  promptVal, setPromptVal,
  handleSaveRename, onPublish,
  selectedModel, setSelectedModel,
  shareAccess, setShareAccess, sharedEmails = [], onUpdateSharedEmails,
  bugReportText, setBugReportText,
  user, handleShare,
  isDeleteProjectModalOpen, setIsDeleteProjectModalOpen,
  handleConfirmDeleteProject, isDeletingProject, siteTitle, site
}) => {
  const navigate = useNavigate();
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [publishDesc, setPublishDesc] = useState(site?.description || '');
  const [publishUrl, setPublishUrl] = useState(site?.subdomain || '');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'form' | 'publishing' | 'published'>(site?.isPublished ? 'published' : 'idle');
  const [publishStepIndex, setPublishStepIndex] = useState(0);
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  
  const getBaseDomain = () => {
    if (typeof window === 'undefined') return 'genzite.studio';
    const host = window.location.hostname;
    if (host.includes('localhost')) return 'localhost';
    if (host.includes('codespheree.id.vn')) return 'codespheree.id.vn';
    if (host.includes('genzite.com')) return 'genzite.com';
    if (host.includes('genzite.ai')) return 'genzite.ai';
    return 'genzite.studio';
  };
  const baseDomain = getBaseDomain();
  
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const modelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node) && modelBtnRef.current && !modelBtnRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMenu);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu);
    };
  }, []);

  useEffect(() => {
    if (site) {
      setPublishDesc(site.description || '');
      setPublishUrl(site.subdomain || '');
      if (site.isPublished) {
        setPublishStatus(prev => prev === 'idle' ? 'published' : prev);
      }
    }
  }, [site]);

  useEffect(() => {
    if (!publishUrl) {
      setIsSubdomainAvailable(null);
      return;
    }
    
    if (publishUrl === site?.subdomain) {
      setIsSubdomainAvailable(true);
      return;
    }
    
    setIsCheckingSubdomain(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await checkSubdomainAvailabilityApi(publishUrl, site?.id);
        setIsSubdomainAvailable(res.available);
      } catch (err) {
        setIsSubdomainAvailable(false);
      } finally {
        setIsCheckingSubdomain(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [publishUrl, site?.subdomain, site?.id]);

  const PUBLISH_STEPS = [
    'Reviewing features',
    'Gathering your app details',
    'Preparing your Google Cloud Project',
    'Running launch checks',
    'Optimizing for speed and performance',
    'Deploying your app to the cloud',
    'Verifying app URL',
    'Packing up your code for launch',
    'Checking for app description'
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (publishStatus === 'publishing') {
      if (publishStepIndex < PUBLISH_STEPS.length - 1) {
        timer = setTimeout(() => {
          setPublishStepIndex(prev => prev + 1);
        }, 800); // 0.8 seconds per step to make it feel fast but readable
      } else {
        timer = setTimeout(() => {
          setPublishStatus('published');
        }, 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [publishStatus, publishStepIndex]);

  return (
    <>
      {/* Rename App Modal - Exact Match to Screenshot */}
      <Modal
        open={isRenameModalOpen}
        onCancel={() => setIsRenameModalOpen(false)}
        footer={null}
        closable={false}
        width={480}
        centered
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)), rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '24px 28px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(59, 130, 246, 0.14)',
            backdropFilter: 'blur(24px) saturate(140%)',
          },
          mask: {
            backdropFilter: 'blur(6px)',
            background: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20, fontFamily: 'var(--font-sans)' }}>
          Rename app
        </div>

        {/* Name Field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            Name
          </label>
          <input
            type="text"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#E2E8F0',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
          />
        </div>

        {/* Prompt Field */}
        <div style={{ marginBottom: 26 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            Prompt
          </label>
          <div style={{
            color: '#CBD5E1',
            fontSize: 13.5,
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
          }}>
            {promptVal || 'No prompt information provided for this app.'}
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsRenameModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#A1A1AA',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 10,
              transition: 'color 0.2s',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#A1A1AA'; }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveRename}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              padding: '8px 22px',
              borderRadius: 12,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Google AI Studio Chat Settings Drawer */}
      <Drawer
        open={isChatSettingsOpen}
        onClose={() => setIsChatSettingsOpen(false)}
        placement="right"
        width={580}
        closable={false}
        styles={{
          body: {
            background: '#0B0F19',
            padding: '28px 32px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            overflowY: 'auto'
          },
          header: {
            background: '#0B0F19',
            borderBottom: '1px solid #1E293B',
            padding: '14px 20px',
            color: '#fff',
          },
          content: {
            background: '#0B0F19',
            boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.7)',
          },
          mask: {
            background: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }
        }}
        title={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', width: '100%', alignItems: 'center' }}>
            <div
              onClick={() => setActiveDrawerTab('chat')}
              style={{
                background: activeDrawerTab === 'chat' ? '#1E293B' : 'transparent',
                color: activeDrawerTab === 'chat' ? '#fff' : '#94A3B8',
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {activeDrawerTab === 'chat' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}></span>}
              <span>Chat</span>
            </div>
            <div
              onClick={() => setActiveDrawerTab('share')}
              style={{
                background: activeDrawerTab === 'share' ? '#1E293B' : 'transparent',
                color: activeDrawerTab === 'share' ? '#fff' : '#94A3B8',
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {activeDrawerTab === 'share' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}></span>}
              <span>Share</span>
            </div>
            <div
              onClick={() => setActiveDrawerTab('publish')}
              style={{
                background: activeDrawerTab === 'publish' ? '#1E293B' : 'transparent',
                color: activeDrawerTab === 'publish' ? '#fff' : '#94A3B8',
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {activeDrawerTab === 'publish' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}></span>}
              <span>Publish</span>
            </div>
            <div
              onClick={() => setActiveDrawerTab('versions')}
              style={{
                background: activeDrawerTab === 'versions' ? '#1E293B' : 'transparent',
                color: activeDrawerTab === 'versions' ? '#fff' : '#94A3B8',
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {activeDrawerTab === 'versions' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}></span>}
              <span>Versions</span>
            </div>
            <div
              onClick={() => setActiveDrawerTab('integrations')}
              style={{
                background: activeDrawerTab === 'integrations' ? '#1E293B' : 'transparent',
                color: activeDrawerTab === 'integrations' ? '#fff' : '#94A3B8',
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {activeDrawerTab === 'integrations' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }}></span>}
              <span>Integrations</span>
            </div>
          </div>
        }
      >
        {activeDrawerTab === 'chat' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 24, letterSpacing: '-0.01em' }}>
              Chat settings
            </div>

            {/* Section 1: Model Selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, fontWeight: 500 }}>
                Select model to use in Chat
              </div>
              <div className="settings-model-picker" style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  ref={modelBtnRef}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {selectedModel === 'llama-3.3-70b-versatile' ? (
                      <Wand2 size={16} style={{ marginRight: 8, color: '#A78BFA' }} />
                    ) : selectedModel === 'deepseek-chat' ? (
                      <Brain size={16} style={{ marginRight: 8, color: '#38BDF8' }} />
                    ) : (
                      <Sparkles size={16} style={{ marginRight: 8, color: '#FBBF24' }} />
                    )}
                    <span>
                      {MODEL_OPTIONS.find(m => m.value === selectedModel)?.label || selectedModel}
                    </span>
                  </div>
                  <ChevronDown size={14} style={{ color: '#94A3B8' }} />
                </button>
                {showModelMenu && (
                  <div 
                    className="override-model-menu"
                    style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', zIndex: 1000 }}
                  >
                    <style>{`
                      .override-model-menu .ai-model-menu {
                        position: relative !important;
                        bottom: auto !important;
                        top: auto !important;
                        width: 100%;
                      }
                    `}</style>
                    <ModelMenu 
                      ref={modelMenuRef}
                      model={selectedModel} 
                      onSelectModel={(m) => { setSelectedModel(m); setShowModelMenu(false); }} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: System Instructions */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, fontWeight: 500 }}>
                System instructions
              </div>
              <div
                onClick={() => setIsCustomInstOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #1E293B',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1E293B';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ paddingRight: 12 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                    Custom instructions
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.45 }}>
                    Add custom instructions for your project to control style, models used, add specific knowledge, and more.
                  </div>
                </div>
                <RightOutlined style={{ color: '#94A3B8', fontSize: 13 }} />
              </div>
            </div>

            {/* Section 3: Usage */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, fontWeight: 500 }}>
                Usage
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid #1E293B',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 999,
                    marginBottom: 10
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                    Free requests
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    You're currently using free tier requests.
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 12 }}>
                    Upgrade to unlock higher limits.
                  </div>
                </div>
                <div
                  onClick={() => message.info('Opening plan & AI quota management page...')}
                  style={{ color: '#94A3B8', fontSize: 18, cursor: 'pointer', padding: 4 }}
                  title="Usage settings"
                >
                  <SettingOutlined />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDrawerTab === 'share' && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 24, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Share your app</span>
              <QuestionCircleOutlined style={{ fontSize: 15, color: '#94A3B8', cursor: 'pointer' }} title="Learn more about sharing and permissions" />
            </div>

            {/* General access */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, fontWeight: 500 }}>
                General access
              </div>
              <Dropdown
                menu={{
                  items: [
                    { key: 'restricted', label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><LockOutlined style={{ color: '#94A3B8' }} /><span>Restricted: Only people you specify can access</span></span>, onClick: () => setShareAccess('Restricted: Only people you specify can access') },
                    { key: 'public', label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GlobalOutlined style={{ color: '#10B981' }} /><span>Public: Anyone with the link can view</span></span>, onClick: () => setShareAccess('Public: Anyone with the link can view') },
                  ]
                }}
                trigger={['click']}
              >
                <div style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {shareAccess.includes('Restricted') ? <LockOutlined style={{ color: '#94A3B8' }} /> : <GlobalOutlined style={{ color: '#10B981' }} />}
                    <span>{shareAccess}</span>
                  </div>
                  <DownOutlined style={{ fontSize: 11, color: '#94A3B8' }} />
                </div>
              </Dropdown>
            </div>

            {/* People and groups with access */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, fontWeight: 500 }}>
                People and groups with access
              </div>
              <Input
                placeholder="Start typing email addresses here and press Enter"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onPressEnter={() => {
                  const email = emailInput.trim();
                  if (!email) return;
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    message.error('Invalid email format');
                    return;
                  }
                  if (sharedEmails.includes(email)) {
                    message.warning('Email already added');
                    return;
                  }
                  if (sharedEmails.length >= 5) {
                    message.error('Maximum 5 emails allowed');
                    return;
                  }
                  onUpdateSharedEmails?.([...sharedEmails, email]);
                  setEmailInput('');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #1E293B',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  marginBottom: 12,
                  fontSize: 13
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Render shared emails */}
                {sharedEmails.map((email) => (
                  <div key={email} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid #1E293B',
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <div className="avatar-initials">
                          {email.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                          {email}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: '#94A3B8', fontSize: 13 }}>Viewer</span>
                      <CloseOutlined 
                        style={{ color: '#EF4444', fontSize: 12, cursor: 'pointer' }} 
                        onClick={() => {
                          onUpdateSharedEmails?.(sharedEmails.filter(e => e !== email));
                        }} 
                      />
                    </div>
                  </div>
                ))}
                {/* Render Owner */}
                <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid #1E293B',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : user?.name ? (
                      <div className="avatar-initials">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                      {user?.name || 'Anonymous User'}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: 13 }}>
                      {user?.email || 'No email available'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>Owner</span>
                  <CloseOutlined style={{ color: '#64748B', fontSize: 12, cursor: 'pointer' }} onClick={() => message.info('Cannot remove workspace Owner')} />
                </div>
              </div>
            </div>
          </div>


            {/* Bottom button */}
            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <button
                onClick={() => {
                  if (handleShare) handleShare();
                  setIsChatSettingsOpen(false);
                }}
                style={{
                  background: '#262626',
                  border: 'none',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#333333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#262626'; }}
              >
                <LinkOutlined style={{ fontSize: 16 }} />
                <span>Copy link</span>
              </button>
            </div>
          </div>
        )}

        {activeDrawerTab === 'publish' && publishStatus === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '20px 0' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 28, letterSpacing: '-0.01em', textAlign: 'center' }}>
              What does publishing look like?
            </div>

            {/* Glowing Card Mockup */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 320,
              marginBottom: 32,
              padding: '2px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #4285F4 0%, #EA4335 35%, #FBBC05 70%, #34A853 100%)',
              boxShadow: '0 10px 40px -10px rgba(66, 133, 244, 0.3), 0 10px 40px -10px rgba(52, 168, 83, 0.25)',
            }}>
              <div style={{
                background: '#13151A',
                borderRadius: 18,
                padding: '16px 20px',
                height: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                {/* Top browser bar */}
                <div style={{
                  background: '#262626',
                  borderRadius: 8,
                  padding: '6px 16px',
                  width: '100%',
                  textAlign: 'center',
                  color: '#94A3B8',
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 28,
                  fontFamily: 'var(--font-sans)',
                }}>
                  Your app
                </div>

                {/* Globe Icon */}
                <GlobalOutlined style={{ fontSize: 32, color: '#475569', marginBottom: 16 }} />

                {/* Skeleton lines */}
                <div style={{ width: 64, height: 10, borderRadius: 999, background: '#334155', marginBottom: 10 }}></div>
                <div style={{ width: 140, height: 10, borderRadius: 999, background: '#334155' }}></div>
              </div>
            </div>

            {/* Feature bullets */}
            <div style={{ width: '100%', maxWidth: 320, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <LockOutlined style={{ fontSize: 16, color: '#3B82F6', flexShrink: 0 }} />
                <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                  Chat history & code will stay private
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <LinkOutlined style={{ fontSize: 16, color: '#3B82F6', flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                  Your app will be accessible via a public URL
                </span>
              </div>
            </div>

            {/* Bottom Button */}
            <div style={{ width: '100%', maxWidth: 320 }}>
              <button
                onClick={() => setPublishStatus('form')}
                style={{
                  background: '#262626',
                  border: 'none',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#333333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#262626'; }}
              >
                Get started
              </button>
            </div>
          </div>
        )}

        {activeDrawerTab === 'publish' && publishStatus === 'form' && (
          <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              Publish your app <InfoCircleOutlined style={{ fontSize: 14, color: '#94A3B8' }} />
            </div>

            {/* Glowing Card Mockup */}
            <div style={{
              position: 'relative',
              width: '100%',
              marginBottom: 32,
              padding: '2px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4285F4 0%, #EA4335 35%, #FBBC05 70%, #34A853 100%)',
              boxShadow: '0 10px 40px -10px rgba(66, 133, 244, 0.3), 0 10px 40px -10px rgba(52, 168, 83, 0.25)',
            }}>
              <div style={{
                background: '#18181B', // Dark zinc color
                borderRadius: 14,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6EE7B7', color: '#064E3B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
                    {site?.name ? site.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {site?.name || 'App Name'}
                  </div>
                </div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {site?.name || 'App Name'}
                </div>
                <div style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {publishDesc || 'App description'}
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Description</div>
              <textarea
                value={publishDesc}
                onChange={(e) => setPublishDesc(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #27272A',
                  borderRadius: 8,
                  padding: '12px',
                  color: '#fff',
                  fontSize: 14,
                  minHeight: 80,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3F3F46'}
                onBlur={(e) => e.target.style.borderColor = '#27272A'}
              />
            </div>

            {/* App URL Field */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>App URL</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  value={publishUrl}
                  onChange={(e) => setPublishUrl(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: `1px solid ${isSubdomainAvailable === false ? '#EF4444' : '#27272A'}`,
                    borderRadius: '8px 0 0 8px',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    borderRight: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    if (isSubdomainAvailable !== false) e.target.style.borderColor = '#3F3F46';
                  }}
                  onBlur={(e) => {
                    if (isSubdomainAvailable !== false) e.target.style.borderColor = '#27272A';
                  }}
                />
                <div style={{ 
                  color: '#94A3B8', 
                  fontSize: 14, 
                  padding: '10px 12px 10px 0', 
                  background: 'transparent',
                  border: `1px solid ${isSubdomainAvailable === false ? '#EF4444' : '#27272A'}`,
                  borderRadius: '0 8px 8px 0',
                  borderLeft: 'none',
                  transition: 'border-color 0.2s'
                }}>
                  .{baseDomain}
                </div>
              </div>
              <div style={{ 
                color: isSubdomainAvailable === false ? '#EF4444' : (isSubdomainAvailable === true ? '#22C55E' : 'transparent'), 
                fontSize: 12, 
                marginTop: 6,
                minHeight: 18
              }}>
                {isSubdomainAvailable === false ? 'This URL is not available.' : (isSubdomainAvailable === true ? 'This URL is available.' : (isCheckingSubdomain ? 'Checking...' : ''))}
              </div>
            </div>

            {/* Footer & Button */}
            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16 }}>
                By publishing, you agree to <span style={{ color: '#60A5FA', cursor: 'pointer' }}>Starter Tier Additional Terms of Service</span>
              </div>
              <button
                disabled={isSubdomainAvailable === false || isCheckingSubdomain}
                onClick={async () => {
                  try {
                    setPublishStatus('publishing');
                    setPublishStepIndex(0);
                    
                    // Only update if changed or not yet published
                    if (publishUrl !== site?.subdomain || publishDesc !== site?.description || !site?.isPublished) {
                      await updateSiteApi(site!.id, { subdomain: publishUrl, description: publishDesc, isPublished: true });
                    }
                    if (onPublish) onPublish();
                  } catch (e) {
                    console.error("Failed to publish", e);
                    message.error('Failed to publish app. Please try again.');
                    setPublishStatus('form');
                  }
                }}
                style={{
                  background: (isSubdomainAvailable === false || isCheckingSubdomain) ? '#52525B' : '#27272A',
                  border: 'none',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  width: '100%',
                  cursor: (isSubdomainAvailable === false || isCheckingSubdomain) ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { 
                  if (isSubdomainAvailable !== false && !isCheckingSubdomain) e.currentTarget.style.background = '#3F3F46'; 
                }}
                onMouseLeave={(e) => { 
                  if (isSubdomainAvailable !== false && !isCheckingSubdomain) e.currentTarget.style.background = '#27272A'; 
                }}
              >
                Publish your app
              </button>
            </div>
          </div>
        )}

        {activeDrawerTab === 'publish' && publishStatus === 'publishing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '20px 0' }}>
            <div style={{
              position: 'relative',
              width: 120,
              height: 120,
              marginBottom: 32,
              padding: '2px',
              borderRadius: 28,
              background: 'linear-gradient(135deg, #4285F4 0%, #EA4335 35%, #FBBC05 70%, #34A853 100%)',
              boxShadow: '0 10px 40px -10px rgba(66, 133, 244, 0.3), 0 10px 40px -10px rgba(52, 168, 83, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                background: '#13151A',
                borderRadius: 26,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <RocketOutlined style={{ fontSize: 48, color: '#fff' }} />
              </div>
            </div>
            
            <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 24, letterSpacing: '-0.01em', textAlign: 'center' }}>
              Publishing your app
            </div>
            
            <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, textAlign: 'center', minHeight: 20 }}>
              {PUBLISH_STEPS[publishStepIndex]}
            </div>
          </div>
        )}

        {activeDrawerTab === 'publish' && publishStatus === 'published' && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '0' }}>
            {/* Top Area with Gradient Background */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 20px 0',
              overflow: 'hidden',
              marginTop: -24,
              marginLeft: -24,
              marginRight: -24,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              background: 'linear-gradient(180deg, rgba(66,133,244,0.15) 0%, rgba(234,67,53,0.15) 30%, rgba(251,188,5,0.15) 60%, rgba(52,168,83,0.15) 100%)',
            }}>
              {/* Arc overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                background: '#18181B', // Drawer background color
                borderTopLeftRadius: '50% 100%',
                borderTopRightRadius: '50% 100%',
              }} />

              {/* Icon */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: '#13151A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                zIndex: 1,
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  background: '#6EE7B7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PictureOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
              </div>

              {/* Title */}
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 40, textAlign: 'center', zIndex: 1, padding: '0 20px' }}>
                {site?.name || 'Your app'} is published!
              </div>
            </div>

            {/* Warning Box */}
            <div style={{ 
              background: '#27272A', 
              borderRadius: 12, 
              padding: '16px 20px', 
              marginBottom: 24, 
              color: '#94A3B8', 
              fontSize: 13,
              textAlign: 'center',
              border: '1px solid #3F3F46'
            }}>
              There are unpublished changes. Click republish to update the app.
            </div>

            {/* Buttons Row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <button
                onClick={() => window.open(`https://${publishUrl}.${baseDomain}`, '_blank')}
                style={{
                  flex: 1,
                  background: '#3F3F46',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: 20,
                  fontWeight: 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#52525B'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3F3F46'; }}
              >
                <GlobalOutlined /> Visit
              </button>
              <button
                onClick={() => {
                  setPublishStatus('publishing');
                  setPublishStepIndex(0);
                  if (onPublish) onPublish();
                }}
                style={{
                  flex: 1,
                  background: '#27272A',
                  border: '1px solid #3F3F46',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: 20,
                  fontWeight: 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3F3F46'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#27272A'; }}
              >
                <SyncOutlined /> Republish
              </button>
            </div>

            {/* Details Section */}
            <div style={{ background: '#27272A', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 14 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }}></div>
                  Ready
                </div>
              </div>

              <div>
                <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>Last published</div>
                <div style={{ color: '#fff', fontSize: 14 }}>{new Date().toLocaleString()}</div>
              </div>

              <div>
                <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>App URL</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a href={`https://${publishUrl}.${baseDomain}`} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', fontSize: 14, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    https://{publishUrl}.{baseDomain}
                  </a>
                  <CopyOutlined 
                    style={{ color: '#94A3B8', cursor: 'pointer' }} 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${publishUrl}.${baseDomain}`);
                      message.success('URL copied');
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: 12, paddingTop: 24 }}>
              <button
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #3F3F46',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#52525B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3F3F46'; }}
              onClick={() => {
                setActiveDrawerTab(null);
                navigate(`/workspace/observability/${site?.id}`);
              }}
            >
              Advanced settings
              </button>
              <button
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #3F3F46',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#52525B'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3F3F46'; }}
                onClick={async () => {
                  try {
                    if (site) {
                      await updateSiteApi(site.id, { isPublished: false });
                    }
                    setPublishStatus('idle');
                    message.success('App unpublished successfully');
                  } catch (error) {
                    message.error('Failed to unpublish app');
                  }
                }}
              >
                Unpublish app
              </button>
            </div>
          </div>
        )}

        {activeDrawerTab === 'versions' && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20, letterSpacing: '-0.01em' }}>
              App versions
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: 24 }}>
              <Input
                prefix={<SearchOutlined style={{ color: '#71717A', fontSize: 16, marginRight: 8 }} />}
                placeholder="Search for your prompt"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #27272A',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            {/* Version Item */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: 16,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden', paddingRight: 12 }}>
                <ClockCircleOutlined style={{ fontSize: 18, color: '#fff', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#fff', fontWeight: 500, fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Create an app that takes a product image and visualize...
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 12 }}>
                    Jul 5, 12:52 AM
                  </div>
                </div>
              </div>

              <div style={{
                background: '#27272A',
                border: '1px solid #3F3F46',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                Current
              </div>
            </div>

            {/* Bottom Restore Button */}
            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              <button
                disabled
                onClick={() => message.info('This is currently the active version')}
                style={{
                  background: '#18181B',
                  border: '1px solid #27272A',
                  color: '#52525B',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'not-allowed',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <FlagOutlined style={{ fontSize: 16 }} />
                <span>Restore version</span>
              </button>
            </div>
          </div>
        )}

        {activeDrawerTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20, letterSpacing: '-0.01em' }}>
              Integrations
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: 20 }}>
              <Input
                prefix={<SearchOutlined style={{ color: '#71717A', fontSize: 16, marginRight: 8 }} />}
                placeholder="Search integrations"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #27272A',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            {/* 2-Column Grid of Genzite Integration Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { name: 'GitHub', desc: 'Sync code & CI/CD workflows', icon: <GithubOutlined style={{ fontSize: 24, color: '#fff' }} /> },
                { name: 'Vercel / Edge', desc: 'Instant CDN & SSL hosting', icon: <CloudUploadOutlined style={{ fontSize: 24, color: '#38BDF8' }} /> },
                { name: 'Supabase', desc: 'PostgreSQL DB & storage', icon: <DatabaseOutlined style={{ fontSize: 24, color: '#10B981' }} /> },
                { name: 'Stripe Commerce', desc: 'Payments & subscriptions', icon: <CreditCardOutlined style={{ fontSize: 24, color: '#818CF8' }} /> },
                { name: 'SendGrid Email', desc: 'Transactional notifications', icon: <MailOutlined style={{ fontSize: 24, color: '#F43F5E' }} /> },
                { name: 'API Gateways', desc: 'Custom REST & GraphQL', icon: <ApiOutlined style={{ fontSize: 24, color: '#F59E0B' }} /> },
                { name: 'PostHog Analytics', desc: 'User metrics & heatmaps', icon: <BarChartOutlined style={{ fontSize: 24, color: '#A855F7' }} /> },
                { name: 'Clerk Identity', desc: 'User auth & OAuth roles', icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#06B6D4' }} /> },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => message.info(`Connecting integration: ${item.name}`)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <div style={{ marginBottom: 14 }}>
                    {item.icon}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4, letterSpacing: '-0.01em' }}>
                    {item.name}
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Custom Instructions Sub-Modal */}
      <Modal
        open={isCustomInstOpen}
        onCancel={() => setIsCustomInstOpen(false)}
        title={<span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Instructions</span>}
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
        width={560}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              key="reset"
              onClick={() => setPromptVal('')}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}
            >
              Reset
            </button>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                key="cancel"
                onClick={() => setIsCustomInstOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                key="save"
                onClick={() => {
                  handleSaveRename(); // Actually save the instructions
                  setIsCustomInstOpen(false);
                  message.success('Custom instructions saved!');
                }}
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94A3B8', padding: '6px 16px', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#475569'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#334155'; }}
              >
                Save changes
              </button>
            </div>
          </div>
        }
        styles={{
          content: {
            background: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: 12,
            color: '#fff',
            padding: '24px',
          },
          header: { background: 'transparent', borderBottom: 'none', paddingBottom: 16 },
          mask: { background: 'rgba(0,0,0,0.6)' }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ color: '#A3A3A3', fontSize: 13, lineHeight: 1.5, maxWidth: '75%' }}>
            Add custom instructions for your project to control style, models used, add specific knowledge, and more.
          </div>
          <button
            onClick={() => message.info('File upload coming soon')}
            style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Upload file
          </button>
        </div>
        <textarea
          value={promptVal}
          onChange={(e) => setPromptVal(e.target.value)}
          rows={14}
          style={{
            width: '100%',
            background: '#1c1c1c',
            border: '1px solid #333',
            borderRadius: 8,
            padding: 16,
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            outline: 'none',
            resize: 'vertical'
          }}
          placeholder={`// An example instruction set for a model

You will always:
* Use emojis instead of SVG icons
* Do not change model strings found in code
* Avoid using gradients`}
        />
      </Modal>

      {/* Bug Report / Feedback Modal */}
      <Modal
        open={isBugReportOpen}
        onCancel={() => setIsBugReportOpen(false)}
        title={<span style={{ color: '#fff', fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Submit Feedback</span>}
        footer={[
          <button
            key="submit"
            disabled={isSubmittingFeedback || !bugReportText.trim()}
            onClick={async () => {
              try {
                setIsSubmittingFeedback(true);
                await submitFeedbackApi(site?.id || '', user?.email || '', bugReportText);
                setIsBugReportOpen(false);
                setBugReportText('');
                message.success('Thank you! Your feedback has been sent to the Genzite development team.');
              } catch (error) {
                console.error("Failed to submit feedback", error);
                message.error('Failed to submit feedback. Please try again.');
              } finally {
                setIsSubmittingFeedback(false);
              }
            }}
            style={{
              background: isSubmittingFeedback || !bugReportText.trim() ? '#52525B' : '#27272A',
              border: 'none',
              color: '#fff',
              padding: '8px 24px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: isSubmittingFeedback || !bugReportText.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => { if (!isSubmittingFeedback && bugReportText.trim()) e.currentTarget.style.background = '#3F3F46'; }}
            onMouseLeave={(e) => { if (!isSubmittingFeedback && bugReportText.trim()) e.currentTarget.style.background = '#27272A'; }}
          >
            {isSubmittingFeedback ? 'Submitting...' : 'Submit'}
          </button>
        ]}
        width={520}
        centered
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)), rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '24px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(24px) saturate(140%)',
          },
          header: { background: 'transparent', borderBottom: 'none', paddingBottom: 16 },
          mask: { background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }
        }}
      >
        <div style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Submitting this report will send the following diagnostic details to Genzite:
          <ul style={{ margin: '8px 0 0 20px', padding: 0, listStyleType: 'disc', color: '#94A3B8' }}>
            <li style={{ marginBottom: 4 }}>Application unique identifier</li>
            <li>Actions & task IDs executed during this session</li>
          </ul>
        </div>

        <div style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Your feedback is governed by Genzite <span style={{ color: '#60A5FA', cursor: 'pointer', fontWeight: 500 }} onClick={() => message.info('Genzite Terms of Service')}>Terms of Service</span> and may be used to improve our services according to our <span style={{ color: '#60A5FA', cursor: 'pointer', fontWeight: 500 }} onClick={() => message.info('Genzite Privacy Policy')}>Privacy Policy</span>. Do not include personal, sensitive, or confidential information.
        </div>

        <textarea
          value={bugReportText}
          onChange={(e) => setBugReportText(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid #27272A',
            borderRadius: 12,
            padding: '14px 16px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.2s',
          }}
          placeholder="Tell us what happened or describe any issues you encountered"
          onFocus={(e) => { e.target.style.borderColor = '#52525B'; }}
          onBlur={(e) => { e.target.style.borderColor = '#27272A'; }}
        />
      </Modal>

      {/* Delete Project Modal - Synchronized with aiLogs UI */}
      <Modal
        open={isDeleteProjectModalOpen}
        onCancel={() => setIsDeleteProjectModalOpen?.(false)}
        footer={null}
        closable={false}
        width={460}
        centered
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(19, 21, 29, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(239, 68, 68, 0.12)',
            backdropFilter: 'blur(24px) saturate(140%)',
          },
          mask: {
            backdropFilter: 'blur(6px)',
            background: 'rgba(0, 0, 0, 0.65)',
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444',
            flexShrink: 0
          }}>
            <Trash2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'var(--font-sans)' }}>Delete Project</h3>
            <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>Confirm permanent deletion of all project data</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.025)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '16px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
              <span style={{ color: '#06B6D4' }}>✦</span>
              <span>Project to delete:</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 600 }}>{siteTitle || site?.name || 'Current Project'}</span>
          </div>

          <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
            Are you sure you want to delete this project? All pages, widget configurations, and AI generation history will be permanently deleted.
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#F87171',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '8px 12px',
            borderRadius: 8
          }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span>This action cannot be undone.</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsDeleteProjectModalOpen?.(false)}
            style={{
              padding: '9px 18px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#CBD5E1',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteProject}
            disabled={isDeletingProject}
            style={{
              padding: '9px 20px',
              background: isDeletingProject ? 'rgba(239, 68, 68, 0.5)' : '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.8)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: isDeletingProject ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {isDeletingProject ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </Modal>
    </>
  );
};
