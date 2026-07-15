import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeftOutlined, ReloadOutlined, InfoCircleOutlined,
  CheckCircleFilled, CodeOutlined
} from '@ant-design/icons';
import { Button, Tabs, Table, Select, Input, Tag, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchSiteByIdApi } from '../../api/sites';

const { TabPane } = Tabs;

// MOCK DATA for charts removed as per request to use real data only
// For now, metrics are empty because there's no real metrics endpoint yet
const generateMockMetrics = () => {
  return [];
};

// MOCK DATA for logs removed
const MOCK_LOGS: any[] = [];

const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ 
    background: '#1E1E1E', 
    border: '1px solid #333', 
    borderRadius: 8,
    padding: '16px',
    height: '250px',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8, 
      marginBottom: 16,
      color: '#E5E7EB',
      fontSize: 14,
      fontWeight: 500
    }}>
      {title} <InfoCircleOutlined style={{ color: '#9CA3AF' }} />
    </div>
    <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
      {children}
    </div>
  </div>
);

const ObservabilityDashboard: React.FC = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('metrics');
  const [metricsData, setMetricsData] = useState<any[]>([]);

  useEffect(() => {
    setMetricsData(generateMockMetrics());
  }, []);

  const { data: site } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId
  });

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 24px', 
        borderBottom: '1px solid #333',
        background: '#1E1E1E'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 500, cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined /> Service details
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span 
            style={{ cursor: 'pointer', color: '#60A5FA', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} 
            onClick={() => {
              setMetricsData(generateMockMetrics());
              message.success("Refreshed metrics");
            }}
          >
            <ReloadOutlined /> Refresh
          </span>
        </div>
      </div>

      {/* Title Bar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', background: '#121212' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <CheckCircleFilled style={{ color: '#10B981', fontSize: 20 }} />
          <span style={{ fontSize: 20, fontWeight: 500 }}>{site?.name || 'Loading...'}</span>
          <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 16 }}>
            URL: <a href={`https://${site?.subdomain || 'app'}.genzite.studio`} target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>https://{site?.subdomain || 'app'}.genzite.studio</a>
          </span>
        </div>
        <Tag color="geekblue" style={{ background: '#1e3a8a', border: 'none', color: '#bfdbfe', borderRadius: 4 }}>
          🚀 Deployed from Genzite Studio
        </Tag>
      </div>

      {/* Main Tabs removed */}

      {/* Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: '1px solid #333', background: '#1E1E1E', flexShrink: 0 }}>
          {['Metrics', 'Logs'].map(item => (
            <div 
              key={item.toLowerCase()}
              onClick={() => setActiveTab(item.toLowerCase())}
              style={{ 
                padding: '12px 24px', 
                cursor: 'pointer',
                background: activeTab === item.toLowerCase() ? '#2D3748' : 'transparent',
                borderLeft: activeTab === item.toLowerCase() ? '4px solid #60A5FA' : '4px solid transparent',
                fontSize: 14,
                fontWeight: activeTab === item.toLowerCase() ? 600 : 400
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          
          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Select defaultValue="predefined" style={{ width: 140, background: '#1E1E1E' }} variant="borderless">
                    <Select.Option value="predefined">Predefined</Select.Option>
                  </Select>
                  <Button type="text" style={{ color: '#9CA3AF' }}>+ Create uptime check</Button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="default" style={{ background: '#1E1E1E', borderColor: '#333', color: '#fff' }}>
                    Annotations (2)
                  </Button>
                  <Button type="default" style={{ background: '#1E1E1E', borderColor: '#333', color: '#fff' }}>
                    Last 1 day
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ChartCard title="Request count">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 4 }} />
                      <Line type="monotone" dataKey="2xx" stroke="#60A5FA" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="3xx" stroke="#34D399" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Request latencies">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 4 }} />
                      <Line type="monotone" dataKey="latency" stroke="#60A5FA" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="latency95" stroke="#34D399" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="latency99" stroke="#C084FC" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
                
                <ChartCard title="End-to-end request latency">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 4 }} />
                      <Line type="monotone" dataKey="latency" stroke="#FBBF24" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Latency breakdown">
                   <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 4 }} />
                      <Line type="monotone" dataKey="latency95" stroke="#F87171" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <Select defaultValue="default" style={{ width: 140 }}>
                  <Select.Option value="default">Severity: Default</Select.Option>
                </Select>
                <Input prefix="≡ Filter" placeholder="Search all fields and values" style={{ width: 300, background: '#1E1E1E', borderColor: '#333', color: '#fff' }} />
              </div>
              
              <Table 
                dataSource={MOCK_LOGS} 
                rowKey="id"
                pagination={false}
                size="small"
                style={{ background: '#1E1E1E', borderRadius: 8, overflow: 'hidden' }}
                components={{
                  table: (props: any) => <table {...props} style={{ background: '#121212', width: '100%' }} />,
                  header: {
                    cell: (props: any) => <th {...props} style={{ background: '#1E1E1E', color: '#9CA3AF', borderBottom: '1px solid #333' }} />
                  },
                  body: {
                    cell: (props: any) => <td {...props} style={{ borderBottom: '1px solid #333', color: '#E5E7EB', padding: '8px 12px', fontSize: 13, fontFamily: 'monospace' }} />
                  }
                }}
                rowClassName={() => 'log-row'}
              >
                <Table.Column title="Severity" dataIndex="severity" key="severity" width={100} render={() => <span style={{ color: '#60A5FA' }}>ℹ️</span>} />
                <Table.Column title="Time" dataIndex="time" key="time" width={220} />
                <Table.Column title="Summary" dataIndex="summary" key="summary" render={(text) => {
                  if (text.startsWith('GET')) {
                    const parts = text.split(' ');
                    return (
                      <span>
                        <span style={{ color: '#9CA3AF' }}>{parts[0]}</span> <span style={{ color: '#34D399' }}>{parts[1]}</span> {parts.slice(2).join(' ')}
                      </span>
                    );
                  }
                  if (text.startsWith('Cloud Run')) {
                    return (
                      <span>
                        <span style={{ color: '#60A5FA', padding: '2px 6px', background: '#1E3A8A', borderRadius: 4, marginRight: 8 }}>Cloud Run</span>
                        {text.replace('Cloud Run ', '')}
                      </span>
                    );
                  }
                  return text;
                }} />
              </Table>
            </div>
          )}

          {activeTab !== 'metrics' && activeTab !== 'logs' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280' }}>
              This tab is simulated. Please view Metrics or Logs.
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        .log-row:hover > td {
          background-color: #1F2937 !important;
        }
        .ant-tabs-nav::before {
          border-bottom: 1px solid #333 !important;
        }
        .ant-tabs-tab {
          color: #9CA3AF !important;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #60A5FA !important;
        }
        .ant-tabs-ink-bar {
          background: #60A5FA !important;
        }
      `}</style>
    </div>
  );
};

export default ObservabilityDashboard;
