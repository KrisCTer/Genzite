import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Spin } from 'antd';
import { fetchPagesApi, fetchWidgetsApi, replaceWidgetsApi, fetchSiteByIdApi, type Widget } from '../../api/sites';
import EditTopBar from './builder/EditTopBar';
import EditLeftPanel from './builder/EditLeftPanel';
import EditRightPanel from './builder/EditRightPanel';
import GrapesEditor, { type GrapesEditorRef } from './builder/GrapesEditor';
import './CanvasBuilder.css';

const EditViewer: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [dragMode, setDragMode] = useState<'absolute' | ''>('absolute');
  const editorRef = useRef<GrapesEditorRef>(null);
  const queryClient = useQueryClient();

  // Fetch site info
  const { data: site } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId
  });

  // Fetch page and widgets
  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ['pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId
  });

  const pageId = pages?.[0]?.id;

  const { data: widgets = [], isLoading: loadingWidgets } = useQuery({
    queryKey: ['widgets', pageId],
    queryFn: () => fetchWidgetsApi(pageId!),
    enabled: !!pageId
  });

  const saveMutation = useMutation({
    mutationFn: (newWidgets: Widget[]) => replaceWidgetsApi(pageId!, newWidgets),
    onSuccess: () => {
      window.dispatchEvent(new CustomEvent('genzite:builder:saved'));
      queryClient.invalidateQueries({ queryKey: ['widgets', pageId] });
    },
    onError: () => {
      message.error('Error saving changes!');
    }
  });

  const handleSave = () => {
    if (!editorRef.current || !pageId) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    // Find GRAPESJS widget and update it
    const grapesWidget = widgets.find(w => w.type === 'GRAPESJS');
    if (!grapesWidget) {
      message.warning('Could not find GrapesJS page to save!');
      return;
    }

    const updatedWidget = {
      ...grapesWidget,
      contentConfig: {
        ...(grapesWidget.contentConfig || {}),
        html,
        css
      }
    };

    const newWidgets = widgets.map(w => w.id === grapesWidget.id ? updatedWidget : w);
    saveMutation.mutate(newWidgets);
  };

  const grapesWidget = widgets.find(w => w.type === 'GRAPESJS');
  const isLoading = loadingPages || loadingWidgets;

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 390;
      case 'tablet': return 768;
      case 'desktop': return '100%';
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#07090f',
      overflow: 'hidden'
    }}>
      <EditTopBar 
        device={device}
        setDevice={setDevice}
        siteName={site?.name || 'Untitled Project'}
        leftPanelOpen={leftPanelOpen}
        setLeftPanelOpen={setLeftPanelOpen}
        rightPanelOpen={rightPanelOpen}
        setRightPanelOpen={setRightPanelOpen}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
        dragMode={dragMode}
        onToggleDragMode={(mode) => {
          setDragMode(mode);
          editorRef.current?.setDragMode(mode);
        }}
        siteId={siteId}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <EditLeftPanel isOpen={leftPanelOpen} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
           {/* Center Area */}
           <div style={{
              flex: 1,
              display: 'flex',
              padding: 0,
              overflow: 'hidden',
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
              backgroundSize: '24px 24px',
           }}>
              {isLoading ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" />
                </div>
              ) : grapesWidget ? (
                <div style={{ 
                  width: '100%', 
                  height: '100%',
                  overflow: 'hidden',
                }}>
                  <GrapesEditor 
                    ref={editorRef} 
                    htmlContent={grapesWidget.contentConfig?.html || ''} 
                    cssContent={grapesWidget.contentConfig?.css || ''}
                    initialDragMode={dragMode}
                  />
                </div>
              ) : (
                <div style={{ color: '#fff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 16 }}>Builder Mode</h2>
                    <p style={{ color: '#94a3b8' }}>This page does not use GrapesJS engine. Please use standard drag-and-drop mode.</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        <EditRightPanel isOpen={rightPanelOpen} />
      </div>
    </div>
  );
};

export default EditViewer;
