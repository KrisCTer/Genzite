import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Spin, Alert } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/client';

const { Title } = Typography;

export default function AiMetricsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get('/ai/admin/metrics/summary');
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
  if (error) return <Alert type="error" message="Error loading AI metrics" description={error} />;

  const columns = [
    { title: 'Task ID', dataIndex: 'id', key: 'id' },
    { title: 'Type', dataIndex: 'taskType', key: 'taskType' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Token Usage', dataIndex: 'tokenUsage', key: 'tokenUsage' },
    { title: 'Cost ($)', dataIndex: 'cost', key: 'cost' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => new Date(val).toLocaleString() },
  ];

  const chartData = data?.chartData || [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>AI Metrics & Token Usage</Title>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Tasks" value={data?.totalTasks || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Successful Tasks" value={data?.successfulTasks || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Failed Tasks" value={data?.failedTasks || 0} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Token Cost" value={data?.totalCost || 0} precision={4} prefix="$" />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, height: 300 }}>
        <Title level={4}>Token Usage Trend</Title>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tokens" stroke="#10b981" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>Recent Tasks</Title>
        <Table dataSource={data?.recentLogs || []} columns={columns} rowKey="id" pagination={false} />
      </div>
    </div>
  );
}
