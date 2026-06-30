import React, { useState, useEffect } from 'react';
import { Button, message, Select } from 'antd';
import { GlobalOutlined, AppstoreAddOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { generateSiteApi, generateCmsApi, getSiteJobApi, getCmsJobApi } from '../../api/ai';
import { useNavigate } from 'react-router-dom';
import './AIGenerateSite.css';

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'site' | 'cms';
type JobStatus = 'idle' | 'pending' | 'completed' | 'failed';

// ─── Prompt templates ────────────────────────────────────────────────────────

const SITE_TEMPLATES = [
  'Portfolio for a photographer',
  'SaaS landing page',
  'E-commerce store homepage',
  'Restaurant menu site',
  'Personal blog with dark theme',
  'Tech startup homepage',
];

const CMS_TEMPLATES = [
  'Generate blog post schema',
  'Create product catalog',
  '10 photography service items',
  'Team members collection',
  'FAQ & pricing table',
  'Event listings schema',
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const IdleState: React.FC = () => (
  <div className="ai-studio-idle">
    <div className="ai-studio-idle-icon">✦</div>
    <div className="ai-studio-idle-title">Your canvas is ready</div>
    <div className="ai-studio-idle-desc">
      Choose a mode, describe what you want to build, then click{' '}
      <strong style={{ color: '#A78BFA' }}>Generate</strong>. The AI will create it for you.
    </div>
  </div>
);

const PendingState: React.FC<{ jobId: string | null; mode: Mode }> = ({ jobId, mode }) => (
  <div className="ai-studio-pending">
    <div className="ai-studio-typing-indicator">
      <div className="ai-studio-typing-dots">
        <div className="ai-studio-typing-dot" />
        <div className="ai-studio-typing-dot" />
        <div className="ai-studio-typing-dot" />
      </div>
      <span className="ai-studio-typing-text">
        AI is {mode === 'site' ? 'building your pages and widgets' : 'generating CMS collections'}…
      </span>
    </div>
    {jobId && (
      <div>
        <div style={{ fontSize: 11, color: '#6E7681', marginBottom: 6 }}>Job ID</div>
        <div className="ai-studio-job-id">{jobId}</div>
      </div>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[100, 80, 60, 90, 50, 70].map((w, i) => (
        <div
          key={i}
          className="ai-studio-skeleton-line"
          style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

const SuccessState: React.FC<{ mode: Mode; onViewSites: () => void }> = ({ mode, onViewSites }) => (
  <div className="ai-studio-result">
    <div className="ai-studio-result-icon success">
      <CheckCircleOutlined />
    </div>
    <div className="ai-studio-result-title">
      {mode === 'site' ? 'Website Generated!' : 'CMS Content Generated!'}
    </div>
    <div className="ai-studio-result-desc">
      {mode === 'site'
        ? 'Your AI-generated website is ready. Head to Sites to view and manage it.'
        : 'The CMS collections have been successfully populated with AI-generated content.'}
    </div>
    {mode === 'site' && (
      <button className="ai-studio-result-btn" onClick={onViewSites}>
        View Sites →
      </button>
    )}
  </div>
);

const FailedState: React.FC<{ error: string | null; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="ai-studio-result">
    <div className="ai-studio-result-icon error">
      <CloseCircleOutlined />
    </div>
    <div className="ai-studio-result-title">Generation Failed</div>
    <div className="ai-studio-result-desc">
      {error || 'The AI model encountered an error. Please try again with a different prompt.'}
    </div>
    <button className="ai-studio-retry-btn" onClick={onRetry}>
      Try again
    </button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const AIGenerateSite: React.FC = () => {
  const [mode, setMode] = useState<Mode>('site');
  const [prompt, setPrompt] = useState('');
  const [siteId, setSiteId] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

  const [siteJobId, setSiteJobId] = useState<string | null>(null);
  const [siteStatus, setSiteStatus] = useState<JobStatus>('idle');
  const [siteError, setSiteError] = useState<string | null>(null);

  const [cmsJobId, setCmsJobId] = useState<string | null>(null);
  const [cmsStatus, setCmsStatus] = useState<JobStatus>('idle');
  const [cmsError, setCmsError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ─── Polling logic (unchanged) ────────────────────────────────────────────

  useEffect(() => {
    if (!siteJobId || siteStatus === 'completed' || siteStatus === 'failed') return;
    const interval = setInterval(async () => {
      try {
        const job = await getSiteJobApi(siteJobId);
        if (job.state === 'completed') {
          setSiteStatus('completed');
          message.success('Site generation completed successfully!');
        } else if (job.state === 'failed') {
          setSiteStatus('failed');
          setSiteError(job.failedReason || 'Unknown error');
          message.error(`Site generation failed: ${job.failedReason}`);
        }
      } catch (e) {
        console.error('Error polling site job', e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [siteJobId, siteStatus]);

  useEffect(() => {
    if (!cmsJobId || cmsStatus === 'completed' || cmsStatus === 'failed') return;
    const interval = setInterval(async () => {
      try {
        const job = await getCmsJobApi(cmsJobId);
        if (job.state === 'completed') {
          setCmsStatus('completed');
          message.success('CMS generation completed successfully!');
        } else if (job.state === 'failed') {
          setCmsStatus('failed');
          setCmsError(job.failedReason || 'Unknown error');
          message.error(`CMS generation failed: ${job.failedReason}`);
        }
      } catch (e) {
        console.error('Error polling cms job', e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [cmsJobId, cmsStatus]);

  // ─── Mutations (unchanged logic) ─────────────────────────────────────────

  const siteMutation = useMutation({
    mutationFn: generateSiteApi,
    onSuccess: (data) => {
      message.success('Site Generation Job Queued!');
      setSiteJobId(data.jobId);
      setSiteStatus('pending');
      setSiteError(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to start site generation');
    },
  });

  const cmsMutation = useMutation({
    mutationFn: generateCmsApi,
    onSuccess: (data) => {
      message.success('CMS Generation Job Queued!');
      setCmsJobId(data.jobId);
      setCmsStatus('pending');
      setCmsError(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to start CMS generation');
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const isGenerating =
    mode === 'site'
      ? siteMutation.isPending || siteStatus === 'pending'
      : cmsMutation.isPending || cmsStatus === 'pending';

  const currentStatus = mode === 'site' ? siteStatus : cmsStatus;
  const currentJobId = mode === 'site' ? siteJobId : cmsJobId;
  const currentError = mode === 'site' ? siteError : cmsError;

  const handleGenerate = () => {
    if (!prompt.trim()) {
      message.warning('Please enter a prompt first.');
      return;
    }
    if (mode === 'site') {
      siteMutation.mutate({ prompt, model: selectedModel });
    } else {
      if (!siteId.trim()) {
        message.warning('Please enter a Site ID for CMS generation.');
        return;
      }
      cmsMutation.mutate({ siteId, prompt, model: selectedModel });
    }
  };

  const handleReset = () => {
    if (mode === 'site') {
      setSiteStatus('idle');
      setSiteJobId(null);
      setSiteError(null);
    } else {
      setCmsStatus('idle');
      setCmsJobId(null);
      setCmsError(null);
    }
    setPrompt('');
  };

  const handleModeSwitch = (m: Mode) => {
    setMode(m);
    setPrompt('');
  };

  const templates = mode === 'site' ? SITE_TEMPLATES : CMS_TEMPLATES;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="ai-studio-root">
      {/* Header */}
      <div className="ai-studio-header">
        <div className="ai-studio-logo">
          <div className="ai-studio-logo-icon">✦</div>
          <span className="ai-studio-logo-text">Genzite AI Studio</span>
          <span className="ai-studio-logo-badge">Beta</span>
        </div>
        <div className="ai-studio-header-actions">
          <Select
            className="ai-studio-model-select"
            placeholder="Default model"
            allowClear
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 200 }}
            dropdownStyle={{ background: '#161B22', color: '#C9D1D9', borderColor: 'rgba(255,255,255,0.08)' }}
            options={[
              { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
              { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
              { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
              { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
              { value: 'deepseek-chat', label: 'DeepSeek Chat' },
            ]}
          />
        </div>
      </div>

      {/* Body */}
      <div className="ai-studio-body">
        {/* Left: Prompt Panel */}
        <div className="ai-studio-prompt-panel">
          {/* Mode Tabs */}
          <div>
            <div className="ai-studio-section-label">Mode</div>
            <div className="ai-studio-tabs">
              <button
                className={`ai-studio-tab ${mode === 'site' ? 'active' : ''}`}
                onClick={() => handleModeSwitch('site')}
              >
                <GlobalOutlined style={{ marginRight: 6 }} />
                Generate Site
              </button>
              <button
                className={`ai-studio-tab ${mode === 'cms' ? 'active' : ''}`}
                onClick={() => handleModeSwitch('cms')}
              >
                <AppstoreAddOutlined style={{ marginRight: 6 }} />
                Generate CMS
              </button>
            </div>
          </div>

          {/* CMS: Site ID input */}
          {mode === 'cms' && (
            <div className="ai-studio-input-wrapper">
              <div className="ai-studio-section-label">Target Site ID *</div>
              <input
                className="ai-studio-input"
                placeholder="Enter the UUID of the site to populate"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#F0F6FC',
                  padding: '10px 14px',
                  fontSize: 13,
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Quick prompt templates */}
          <div>
            <div className="ai-studio-section-label">Quick templates</div>
            <div className="ai-studio-chips">
              {templates.map((t) => (
                <button
                  key={t}
                  className="ai-studio-chip"
                  onClick={() => setPrompt(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div style={{ flex: 1 }}>
            <div className="ai-studio-section-label">
              {mode === 'site' ? 'Website Prompt' : 'Content Prompt'} *
            </div>
            <textarea
              className={`ai-studio-textarea ${isGenerating ? 'generating' : ''}`}
              rows={8}
              placeholder={
                mode === 'site'
                  ? 'e.g., A portfolio website for a freelance photographer with a dark theme and gallery widgets...'
                  : 'e.g., Generate a list of 10 photography services and a pricing table...'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${isGenerating ? 'rgba(109,40,217,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                color: '#F0F6FC',
                fontSize: 14,
                lineHeight: '1.6',
                padding: 14,
                resize: 'vertical',
                width: '100%',
                outline: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                minHeight: 180,
              }}
            />
          </div>

          {/* Generate button */}
          <button
            className="ai-studio-generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="ai-studio-typing-dot" style={{ width: 5, height: 5 }} />
                <span className="ai-studio-typing-dot" style={{ width: 5, height: 5 }} />
                <span className="ai-studio-typing-dot" style={{ width: 5, height: 5 }} />
                &nbsp; Generating…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ThunderboltOutlined />
                Generate {mode === 'site' ? 'Site' : 'CMS'}
              </span>
            )}
          </button>

          {currentStatus !== 'idle' && (
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6E7681',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'center',
                padding: '4px 0',
              }}
              onClick={handleReset}
            >
              ↩ Reset & start over
            </button>
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className="ai-studio-preview-panel">
          <div className="ai-studio-preview-header">
            <span className="ai-studio-preview-title">
              <span
                className={`ai-studio-status-dot ${currentStatus === 'pending' ? 'pending' : ''}`}
                style={{
                  background:
                    currentStatus === 'completed'
                      ? '#30A46C'
                      : currentStatus === 'failed'
                      ? '#EF4444'
                      : currentStatus === 'pending'
                      ? '#F59E0B'
                      : '#6E7681',
                }}
              />
              {currentStatus === 'idle' && 'Preview'}
              {currentStatus === 'pending' && 'Generating…'}
              {currentStatus === 'completed' && 'Generation complete'}
              {currentStatus === 'failed' && 'Generation failed'}
            </span>
            <span style={{ fontSize: 11, color: '#6E7681' }}>
              {mode === 'site' ? 'Site Generator' : 'CMS Generator'}
            </span>
          </div>

          <div className="ai-studio-preview-content">
            {currentStatus === 'idle' && <IdleState />}
            {currentStatus === 'pending' && (
              <PendingState jobId={currentJobId} mode={mode} />
            )}
            {currentStatus === 'completed' && (
              <SuccessState mode={mode} onViewSites={() => navigate('/admin/site')} />
            )}
            {currentStatus === 'failed' && (
              <FailedState error={currentError} onRetry={handleReset} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateSite;
