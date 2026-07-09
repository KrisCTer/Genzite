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

  // Fetch pages to get the first page or active page
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId
  });

  const activePage = pages?.[0];

  // Fetch widgets for active page
  const { data: widgets, isLoading: widgetsLoading } = useQuery({
    queryKey: ['widgets', activePage?.id],
    queryFn: () => fetchWidgetsApi(activePage!.id),
    enabled: !!activePage?.id
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedWidgets: Partial<Widget>[]) => {
      if (!activePage?.id) throw new Error('No active page');
      return replaceWidgetsApi(activePage.id, updatedWidgets as any);
    },
    onSuccess: () => {
      message.success('Changes saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['widgets', activePage?.id] });
    },
    onError: () => {
      message.error('Error saving changes!');
    }
  });

  const handleSave = () => {
    if (!editorRef.current || !activePage?.id) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    // Find GRAPESJS widget and update it
    const grapesWidget = widgets?.find(w => w.type === 'GRAPESJS');
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

    const newWidgets = widgets?.map(w => w.id === grapesWidget.id ? updatedWidget : w) || [];
    saveMutation.mutate(newWidgets);
  };

  const grapesWidget = widgets?.find(w => w.type === 'GRAPESJS');
  const isLoading = pagesLoading || widgetsLoading;

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 390;
      case 'tablet': return 768;
      case 'desktop': return '100%';
    }
  };

  return (
    <div className="canvas-builder" style={{
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
                  width: getWidth(), 
                  maxWidth: '100%',
                  margin: '0 auto',
                  height: device === 'desktop' ? '100%' : '844px',
                  maxHeight: '100%',
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: device !== 'desktop' ? '0 25px 50px -12px rgba(0,0,0,0.5)' : 'none',
                  borderRadius: device !== 'desktop' ? 16 : 0,
                  transition: 'all 0.3s ease'
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
