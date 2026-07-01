import React from 'react';
import { Table, Tag, Typography, Card } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchMcpLogsApi } from '../../api/ai';

const { Title } = Typography;

const AgentLogs: React.FC = () => {
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['mcp-logs'],
    queryFn: fetchMcpLogsApi,
    retry: 1,
  });

  const mockLogs = [
    { id: '1', action: 'Tool Call', toolName: 'read_file', status: 'SUCCESS', timestamp: new Date().toISOString() },
    { id: '2', action: 'Context Sync', toolName: 'sync', status: 'SUCCESS', timestamp: new Date(Date.now() - 5000).toISOString() },
    { id: '3', action: 'Tool Call', toolName: 'execute_query', status: 'ERROR', timestamp: new Date(Date.now() - 15000).toISOString() },
  ];

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => (
        <span><CodeOutlined style={{ marginRight: 8 }} />{text}</span>
      )
    },
    {
      title: 'Target / Tool',
      dataIndex: 'toolName',
      key: 'toolName',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'SUCCESS' ? 'green' : 'red'}>{status}</Tag>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>MCP Agent Logs</Title>
        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Monitor Model Context Protocol activities and tool executions</div>
      </div>

      <Card variant="outlined" styles={{ body: { padding: 0 } }}>
        {isError && (
          <div style={{ padding: '16px', color: 'orange', textAlign: 'center' }}>
            Warning: Backend MCP logs unreachable. Showing mock data for UI demonstration.
          </div>
        )}
        <Table
          columns={columns}
          dataSource={logs || mockLogs}
          loading={isLoading && !isError}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
};

export default AgentLogs;
