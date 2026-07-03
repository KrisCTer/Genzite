import React from 'react';
import { Table, Typography, Card, Button, Space } from 'antd';
import { CodeOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchMcpLogsApi } from '../../api/ai';
import './AgentLogs.css';

const { Title } = Typography;

type LogItem = {
  id: string;
  action: string;
  toolName: string;
  status: string;
  timestamp: string;
};

const AgentLogs: React.FC = () => {
  const { data: logs, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['mcp-logs'],
    queryFn: fetchMcpLogsApi,
    retry: 1,
  });

  const mockLogs: LogItem[] = [
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
        <span className="agent-logs-action-cell">
          <CodeOutlined />
          {text}
        </span>
      ),
    },
    {
      title: 'Target / Tool',
      dataIndex: 'toolName',
      key: 'toolName',
      render: (text: string) => <span className="agent-logs-tool-tag">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`agent-logs-status-tag ${status === 'SUCCESS' ? 'success' : 'error'}`}>
          {status}
        </span>
      ),
    },
  ];

  const rows = (logs as LogItem[] | undefined) || mockLogs;

  return (
    <div className="agent-logs-page">
      <div className="agent-logs-content">
        <header className="agent-logs-header glass-card">
          <div>
            <Title level={2} className="agent-logs-title">
              MCP Agent Logs
            </Title>
            <p className="agent-logs-subtitle">Monitor Model Context Protocol activities and tool executions</p>
          </div>

          <Space size={10} wrap>
            <Button
              className="agent-logs-action-btn"
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </Space>
        </header>

        {isError && (
          <div className="agent-logs-alert glass-card" role="alert">
            <ExclamationCircleOutlined className="agent-logs-alert-icon" />
            <div>
              <div className="agent-logs-alert-title">Live logs are temporarily unavailable</div>
              <div className="agent-logs-alert-message">
                Showing mock data for UI continuity while the MCP logs endpoint is unreachable.
              </div>
            </div>
          </div>
        )}

        <Card className="agent-logs-table-card glass-card" variant="borderless" styles={{ body: { padding: 0 } }}>
          <Table
            className="agent-logs-table"
            columns={columns}
            dataSource={rows}
            loading={isLoading && !isError}
            rowKey="id"
            rowClassName={(_record, index) => (index % 2 === 0 ? 'agent-logs-row-even' : 'agent-logs-row-odd')}
            sticky
            pagination={{
              pageSize: 15,
              showSizeChanger: false,
              className: 'agent-logs-pagination',
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default AgentLogs;
