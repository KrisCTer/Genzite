import React from 'react';
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPagesApi, fetchSiteByIdApi } from '../../api/sites';
import { useParams, useNavigate } from 'react-router-dom';
import AIPromptBar from './builder/AIPromptBar';
import ProjectSidebar from './builder/ProjectSidebar';
import CanvasWorkspace from './builder/CanvasWorkspace';
import { useAiLogStore } from '../../store/aiLogs';
import './CanvasBuilder.css';

const PageBuilder: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isGenerating = useAiLogStore(state => state.isGenerating);

  const { data: pages, isLoading, isFetching: isFetchingPages, isError } = useQuery({
    queryKey: ['site-pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId,
    retry: 5,
    retryDelay: 1000,
  });

  const { data: site, isFetching: isFetchingSite } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId,
    retry: 5,
    retryDelay: 1000,
  });

  const isWelcomeMode = !siteId;

  const handleAIGenerated = (_jobId: string, subdomain?: string, _platform?: 'app' | 'web') => {
    const targetId = subdomain || siteId;
    if (targetId) {
      queryClient.invalidateQueries({ queryKey: ['site-pages', targetId] });
      queryClient.invalidateQueries({ queryKey: ['site', targetId] });
    }
    if (subdomain && subdomain !== siteId) {
      navigate(`/project/${subdomain}`, { replace: true });
    }
  };
  
  const handleAIStarted = (newSiteId: string) => {
    if (!siteId || siteId !== newSiteId) {
      navigate(`/project/${newSiteId}`);
    }
  };

  if (isWelcomeMode) {
    return (
      <div className="canvas-builder">
        {/* Left Sidebar */}
        <ProjectSidebar />

        {/* Center Area */}
        <div className="canvas-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', flex: 1, paddingLeft: 340, paddingRight: 40, paddingTop: 160, paddingBottom: 40, overflowY: 'auto', height: '100vh' }}>
          <div className="canvas-welcome" style={{ width: '100%', maxWidth: 1024 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 className="canvas-welcome-title" style={{ margin: 0, fontSize: '3rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Welcome to Genzite..
              </h1>
              <button
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 24, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}
              >
                <PlusOutlined /> Start with your design
              </button>
            </div>

            <AIPromptBar onGenerated={handleAIGenerated} onStarted={handleAIStarted} />

            <div style={{ marginTop: 48, display: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', margin: 0 }}>Need inspiration?</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>◄</button>
                  <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>►</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                <div style={{ width: 260, height: 180, background: 'linear-gradient(to bottom, #8a7c73, #4a3c33)', borderRadius: 16, flexShrink: 0 }}></div>
                <div style={{ width: 260, height: 180, background: 'linear-gradient(to bottom, #7da5b8, #3b5b6b)', borderRadius: 16, flexShrink: 0 }}></div>
                <div style={{ width: 260, height: 180, background: 'linear-gradient(to bottom, #a39c92, #534c42)', borderRadius: 16, flexShrink: 0 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if ((isLoading || isFetchingPages || isFetchingSite) && !isGenerating && !pages) {
    return <div className="canvas-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>;
  }
  if (isError && !isGenerating && !isFetchingPages && !site && !siteId?.startsWith('gen-') && !siteId?.startsWith('new-')) {
    return (
      <div 
        className="canvas-builder" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 480,
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 96,
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.08)',
            margin: 0,
            lineHeight: 1
          }}>
            404
          </h1>
          <p style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#e2e8f0',
            marginTop: 24,
            marginBottom: 40,
            lineHeight: 1.4
          }}>
            This page could not be found or is not shared with you.
          </p>
          <button 
            onClick={() => navigate('/project')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="canvas-builder">
      <CanvasWorkspace
        pages={pages || []}
        siteId={siteId!}
        site={site}
        onAIGenerated={handleAIGenerated}
      />
    </div>
  );
};

export default PageBuilder;
