import React, { useEffect, useState } from 'react';
import { 
  CheckCircleFilled, 
  SyncOutlined, 
  CloseCircleFilled, 
  ClockCircleOutlined, 
  RightOutlined,
  DownOutlined,
  EditOutlined,
  BuildOutlined,
  PlusOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAiLogStore, type AiLogStep } from '../../../store/aiLogs';
import { fetchMcpLogsApi } from '../../../api/ai';

const AgentLogSidebar: React.FC = () => {
  const { steps, report, isGenerating, initDefaultLogs } = useAiLogStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const { data: mcpLogs } = useQuery({
    queryKey: ['mcp-logs'],
    queryFn: fetchMcpLogsApi,
    refetchInterval: 5000,
  });

  useEffect(() => {
    initDefaultLogs();
  }, [initDefaultLogs]);


  const renderStatusIcon = (status: AiLogStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleFilled style={{ color: '#10B981', fontSize: 14, flexShrink: 0 }} />;
      case 'in_progress':
        return <SyncOutlined spin style={{ color: '#06B6D4', fontSize: 14, flexShrink: 0 }} />;
      case 'error':
        return <CloseCircleFilled style={{ color: '#EF4444', fontSize: 14, flexShrink: 0 }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#64748B', fontSize: 14, flexShrink: 0 }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'transparent', color: '#fff', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
      {/* AI Logs (Gemini Agent Response View) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        padding: '16px 18px', 
        overflowY: 'auto',
        gap: 14
      }}>
        {/* Model & Duration Subtitle */}
        <div style={{ fontSize: 12.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{report ? report.model : 'Gemini 3.5 Flash'}</span>
          <span>•</span>
          <span style={{ color: isGenerating ? '#06B6D4' : '#94A3B8' }}>
            {isGenerating ? 'Running... (executing tasks)' : (report ? report.duration : 'Ran for 260s')}
          </span>
        </div>

        {/* Action History Section */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.025)', 
          borderRadius: 12, 
          border: '1px solid rgba(255, 255, 255, 0.07)',
          overflow: 'hidden'
        }}>
          {/* Action History Toggle Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'none',
              borderBottom: isHistoryOpen ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#3B82F6', fontSize: 14 }}>✦</span>
              <span>Action history</span>
            </div>
            {isHistoryOpen ? <DownOutlined style={{ fontSize: 11, color: '#94A3B8' }} /> : <RightOutlined style={{ fontSize: 11, color: '#94A3B8' }} />}
          </button>

          {/* Action History Collapsible Content */}
          {isHistoryOpen && (
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                {report ? report.actionHistoryTitle : 'Here are key actions taken for the app:'}
              </div>

              {/* If Generating: Show Live Streaming Steps */}
              {isGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 6 }}>
                  {steps.map((item, idx) => (
                    <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: item.status === 'in_progress' ? '#fff' : '#CBD5E1' }}>
                        {renderStatusIcon(item.status)}
                        <span>{item.step}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#64748B' }}>{item.percent}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* When Done/Default: Show Gemini Edited Files & Build Status */
                report && (
                  <>
                    {/* Real MCP Logs Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#E2E8F0' }}>
                        <CodeOutlined style={{ color: '#3B82F6' }} />
                        <span>Executed {mcpLogs ? mcpLogs.length : 0} Actions</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 18, marginTop: 2, maxHeight: 300, overflowY: 'auto' }} className="gz-scrollbar">
                        {(!mcpLogs || mcpLogs.length === 0) && (
                          <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                            Waiting for agent actions...
                          </div>
                        )}
                        {(mcpLogs || []).map((log: any, i: number) => (
                          <div key={log.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontFamily: 'monospace', color: '#CBD5E1' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }} title={log.toolName}>
                              {log.toolName} <span style={{ color: '#64748B' }}>({log.action})</span>
                            </span>
                            {log.status === 'SUCCESS' ? <CheckCircleFilled style={{ color: '#10B981', fontSize: 13, flexShrink: 0 }} /> : <CloseCircleFilled style={{ color: '#EF4444', fontSize: 13, flexShrink: 0 }} title={log.status} />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Build Status Section */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#E2E8F0' }}>
                        <BuildOutlined style={{ color: '#10B981' }} />
                        <span>build</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#10B981' }}>
                        <span>{report.buildStatus}</span>
                        <CheckCircleFilled style={{ fontSize: 13 }} />
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          )}
        </div>

        {/* Summary Prose & Achievements */}
        {!isGenerating && report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, lineHeight: 1.6, color: '#E2E8F0', marginTop: 2 }}>
            <div style={{ whiteSpace: 'pre-line' }}>
              {report.summaryIntro}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              {report.summaryTitle}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 4 }}>
              {report.achievements.map((ach, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>•</span>
                  <div>
                    <strong style={{ color: '#fff', fontWeight: 600 }}>{ach.title} </strong>
                    <span style={{ color: '#CBD5E1' }}>{ach.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* GrapesJS Layers (Hidden in DOM so GrapesJS never breaks) */}
      <div 
        id="gjs-layers" 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default AgentLogSidebar;
