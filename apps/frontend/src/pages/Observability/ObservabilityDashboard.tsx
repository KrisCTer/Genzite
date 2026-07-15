import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeftOutlined, ReloadOutlined, InfoCircleOutlined,
  CloudServerOutlined, BarChartOutlined, FileTextOutlined, GlobalOutlined
} from '@ant-design/icons';
import { Button, Table, Select, Input, Tag, App, Card, Row, Col, Space, Typography, Tabs } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchSiteByIdApi, fetchSiteMetricsApi, fetchSiteLogsApi } from '../../api/sites';
import { fetchHealthStatusApi, fetchClusterMetricsApi, fetchClusterLogsApi, fetchSiteHealthApi } from '../../api/health';

const { Title, Text } = Typography;

const getPublicSiteUrl = (subdomain: string) => {
  const hostname = window.location.hostname;
  if (hostname.includes('codespheree.id.vn')) return `https://${subdomain}.codespheree.id.vn`;
  if (hostname.includes('genzite.studio')) return `https://${subdomain}.genzite.studio`;
  if (hostname.includes('localhost')) return `http://${subdomain}.localhost:${window.location.port || '5173'}`;
  return `https://${subdomain}.codespheree.id.vn`;
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card 
    variant="outlined" 
    hoverable
    styles={{ 
      body: { 
        padding: 20, 
        height: 310, 
        display: 'flex', 
        flexDirection: 'column' 
      } 
    }}
  >
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8, 
      marginBottom: 12,
      color: 'var(--color-text-primary)',
      fontSize: 14,
      fontWeight: 600
    }}>
      {title} <InfoCircleOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }} />
    </div>
    <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
      {children}
    </div>
  </Card>
);

const SectionHeading: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div style={{ marginTop: 12, marginBottom: 4 }}>
    <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 17 }}>{title}</Title>
    <Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Text>
  </div>
);

const ObservabilityDashboard: React.FC = () => {
  const { siteId } = useParams<{ siteId?: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState(siteId ? 'metrics' : 'services-health');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  useEffect(() => {
    setActiveTab(siteId ? 'metrics' : 'services-health');
  }, [siteId]);

  const { data: site } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => fetchSiteByIdApi(siteId!),
    enabled: !!siteId,
  });

  const { data: clusterHealthData, refetch: refetchClusterHealth, isFetching: isFetchingClusterHealth } = useQuery({
    queryKey: ['health-status'],
    queryFn: fetchHealthStatusApi,
    refetchInterval: 15000,
    enabled: !siteId,
  });

  const { data: siteHealthData, refetch: refetchSiteHealth, isFetching: isFetchingSiteHealth } = useQuery({
    queryKey: ['site-health', siteId],
    queryFn: () => fetchSiteHealthApi(siteId!),
    refetchInterval: 15000,
    enabled: !!siteId,
  });

  const isClusterMode = !siteId;
  const healthData = isClusterMode ? clusterHealthData : siteHealthData;
  const refetchHealth = isClusterMode ? refetchClusterHealth : refetchSiteHealth;
  const isFetching = isClusterMode ? isFetchingClusterHealth : isFetchingSiteHealth;

  const { data: realMetricsResp, refetch: refetchMetrics, isFetching: isFetchingMetrics } = useQuery({
    queryKey: ['observability-metrics', siteId, timeRange, isClusterMode],
    queryFn: () => isClusterMode 
      ? fetchClusterMetricsApi(timeRange) 
      : fetchSiteMetricsApi(siteId!, timeRange),
    refetchInterval: 30000,
  });

  const { data: realLogsResp, refetch: refetchLogs, isFetching: isFetchingLogs } = useQuery({
    queryKey: ['observability-logs', siteId, severityFilter, isClusterMode],
    queryFn: () => isClusterMode 
      ? fetchClusterLogsApi(severityFilter) 
      : fetchSiteLogsApi(siteId!, severityFilter),
    refetchInterval: 30000,
  });

  const metricsData = realMetricsResp?.metrics || [];
  const logsData = Array.isArray(realLogsResp) 
    ? realLogsResp.filter((l: any) => !logSearch || l.summary?.toLowerCase().includes(logSearch.toLowerCase())) 
    : [];

  const tabItems = [
    {
      key: 'services-health',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
          <CloudServerOutlined /> {isClusterMode ? 'Microservices Health Probes' : 'Site Health Probes & Integrity Check'}
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {isClusterMode ? 'Live Cluster Probes Status' : `Live Health Probes for ${site?.name || 'User Site'}`}
              </h3>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {isClusterMode 
                  ? 'Real-time liveness and database readiness probes across all Genzite backend services. Auto-refreshes every 15s.'
                  : 'Real-time diagnostic probes for database connectivity, HTTP serving status, page DOM integrity, and container RAM.'}
              </Text>
            </div>
            <Tag color="blue" style={{ padding: '4px 10px', borderRadius: 4 }}>
              Auto-Interval: 15,000 ms
            </Tag>
          </div>

          <Row gutter={[24, 24]}>
            {healthData?.services ? (
              Object.entries(healthData.services).map(([key, svc]: [string, any]) => (
                <Col xs={24} sm={12} lg={8} key={key}>
                  <Card 
                    hoverable 
                    variant="outlined" 
                    styles={{ body: { padding: 24 } }}
                    style={{
                      borderColor: svc.status === 'ok' ? 'var(--color-border)' : 'var(--color-error)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {svc.name || key}
                        </h4>
                        <Text type="secondary" style={{ fontSize: 13, fontFamily: 'monospace' }}>Key: {key}</Text>
                      </div>
                      <Tag color={svc.status === 'ok' ? 'success' : 'error'} style={{ fontWeight: 600 }}>
                        {svc.status === 'ok' ? 'ONLINE' : 'OFFLINE / ISSUES'}
                      </Tag>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 16, fontSize: 13 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        Response Latency: <strong style={{ color: svc.latencyMs !== undefined && svc.latencyMs < 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>{svc.latencyMs ?? 'N/A'}ms</strong>
                      </span>
                      {svc.db && (
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          Status/DB: <strong style={{ color: svc.db === 'up' || svc.db === 'ok' || svc.db === 'published' ? 'var(--color-success)' : 'var(--color-warning)' }}>{String(svc.db).toUpperCase()}</strong>
                        </span>
                      )}
                    </div>

                    {svc.error && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', fontSize: 12, fontFamily: 'monospace' }}>
                        ⚠️ {svc.error}
                      </div>
                    )}
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Card variant="outlined" styles={{ body: { padding: 48, textAlign: 'center' } }}>
                  <Text type="secondary">{isClusterMode ? 'Pinging microservice health checks via API Gateway...' : `Pinging live diagnostic probes for site ${site?.name || siteId}...`}</Text>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      ),
    },
    {
      key: 'metrics',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
          <BarChartOutlined /> HTTP Traffic & Container Metrics
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }} options={[
              { value: '1h', label: 'Last 1 Hour' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
            ]} />
            <Button type="default">Annotation Overlay (0)</Button>
            <Tag color="cyan" style={{ margin: 0, padding: '4px 12px', fontSize: 13, borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>
              {isClusterMode ? 'Cluster Gateway & Container Telemetry' : `Telemetry for ${site?.name || 'FlowSync Hub'} (15 Cloud Run Metrics)`}
            </Tag>
          </div>

          {/* Section 1: HTTP Traffic & Latencies */}
          <SectionHeading title="1. HTTP Traffic & Request Latencies" subtitle="Traffic volume, status codes breakdown, and p50/p95/p99 latency distribution" />
          <Row gutter={[24, 24]}>
            {/* Chart 1: Request count */}
            <Col xs={24} lg={12}>
              <ChartCard title="Request count (2xx vs 3xx/5xx)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="2xx OK" type="monotone" dataKey="2xx" stroke="var(--color-info)" dot={false} strokeWidth={2.5} />
                    <Line name="3xx Redirect" type="monotone" dataKey="3xx" stroke="var(--color-success)" dot={false} strokeWidth={2} />
                    <Line name="5xx Error" type="monotone" dataKey="5xx" stroke="var(--color-error)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 2: Request latencies */}
            <Col xs={24} lg={12}>
              <ChartCard title="Request latencies (50%, 95%, 99%)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="50% Median" type="monotone" dataKey="req50" stroke="var(--color-info)" dot={false} strokeWidth={2.5} />
                    <Line name="95% Percentile" type="monotone" dataKey="req95" stroke="var(--color-warning)" dot={false} strokeWidth={2} />
                    <Line name="99% Percentile" type="monotone" dataKey="req99" stroke="#C084FC" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 3: End-to-end request latency */}
            <Col xs={24} lg={12}>
              <ChartCard title="End-to-end request latency">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area name="E2E Latency (ms)" type="monotone" dataKey="e2eLatency" stroke="var(--color-success)" fill="var(--color-success-bg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 4: Latency breakdown */}
            <Col xs={24} lg={12}>
              <ChartCard title="Latency breakdown (p95 Component Breakdown)">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area name="p95 Breakdown (ms)" type="monotone" dataKey="breakdown95" stroke="#F87171" fill="rgba(248, 113, 113, 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>

          {/* Section 2: Container Compute & Resource Utilization */}
          <SectionHeading title="2. Container Compute & Resource Utilization" subtitle="Instances scaling, billable execution seconds, CPU, memory, and in-memory filesystem" />
          <Row gutter={[24, 24]}>
            {/* Chart 5: Container instance count */}
            <Col xs={24} lg={12}>
              <ChartCard title="Container instance count (active vs idle)">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar name="active" dataKey="activeInstances" fill="var(--color-info)" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar name="idle" dataKey="idleInstances" fill="var(--color-text-tertiary)" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 6: Billable container instance time */}
            <Col xs={24} lg={12}>
              <ChartCard title="Billable container instance time (seconds)">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="s" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area name="product-mockup-visualizer / site-runtime" type="monotone" dataKey="billableTime" stroke="var(--color-info)" fill="var(--color-info-bg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 7: Container CPU utilization */}
            <Col xs={24} lg={12}>
              <ChartCard title="Container CPU utilization (50%, 95%, 99%)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="50%" type="monotone" dataKey="cpu50" stroke="var(--color-info)" dot={false} strokeWidth={2.5} />
                    <Line name="95%" type="monotone" dataKey="cpu95" stroke="var(--color-warning)" dot={false} strokeWidth={2} />
                    <Line name="99%" type="monotone" dataKey="cpu99" stroke="var(--color-error)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 8: Container memory utilization */}
            <Col xs={24} lg={12}>
              <ChartCard title="Container memory utilization (50%, 95%, 99%)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="50%" type="monotone" dataKey="mem50" stroke="var(--color-success)" dot={false} strokeWidth={2.5} />
                    <Line name="95%" type="monotone" dataKey="mem95" stroke="var(--color-info)" dot={false} strokeWidth={2} />
                    <Line name="99%" type="monotone" dataKey="mem99" stroke="#C084FC" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 9: In-memory file system usage */}
            <Col xs={24} lg={12}>
              <ChartCard title="In-memory file system usage (50%, 95%, 99%)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="MB" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="50%" type="monotone" dataKey="fs50" stroke="#38BDF8" dot={false} strokeWidth={2.5} />
                    <Line name="95%" type="monotone" dataKey="fs95" stroke="#FBBF24" dot={false} strokeWidth={2} />
                    <Line name="99%" type="monotone" dataKey="fs99" stroke="#F43F5E" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>

          {/* Section 3: Network Traffic & Concurrency */}
          <SectionHeading title="3. Network Traffic & Concurrency" subtitle="Inbound/outbound data throughput across peering networks and maximum concurrent requests" />
          <Row gutter={[24, 24]}>
            {/* Chart 10: Sent bytes */}
            <Col xs={24} lg={12}>
              <ChartCard title="Sent bytes (google, internet, private)">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="KB/s" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area name="google" type="monotone" dataKey="sentGoogle" stroke="#60A5FA" fill="rgba(96, 165, 250, 0.2)" stackId="1" />
                    <Area name="internet" type="monotone" dataKey="sentInternet" stroke="#34D399" fill="rgba(52, 211, 153, 0.2)" stackId="1" />
                    <Area name="private" type="monotone" dataKey="sentPrivate" stroke="#A78BFA" fill="rgba(167, 139, 250, 0.2)" stackId="1" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 11: Received bytes */}
            <Col xs={24} lg={12}>
              <ChartCard title="Received bytes (google, internet, private)">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="KB/s" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area name="google" type="monotone" dataKey="recvGoogle" stroke="#60A5FA" fill="rgba(96, 165, 250, 0.2)" stackId="2" />
                    <Area name="internet" type="monotone" dataKey="recvInternet" stroke="#34D399" fill="rgba(52, 211, 153, 0.2)" stackId="2" />
                    <Area name="private" type="monotone" dataKey="recvPrivate" stroke="#A78BFA" fill="rgba(167, 139, 250, 0.2)" stackId="2" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 12: Max concurrent requests */}
            <Col xs={24} lg={12}>
              <ChartCard title="Max concurrent requests (50%, 95%, 99%)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="50%" type="monotone" dataKey="conc50" stroke="var(--color-info)" dot={false} strokeWidth={2.5} />
                    <Line name="95%" type="monotone" dataKey="conc95" stroke="var(--color-warning)" dot={false} strokeWidth={2} />
                    <Line name="99%" type="monotone" dataKey="conc99" stroke="var(--color-error)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>

          {/* Section 4: Container Lifecycle & Autoscaling Recommendations */}
          <SectionHeading title="4. Container Lifecycle & Autoscaling Recommendations" subtitle="Cold start latencies, instance probe health checks, and autoscaler target instances" />
          <Row gutter={[24, 24]}>
            {/* Chart 13: Container startup latency */}
            <Col xs={24} lg={12}>
              <ChartCard title="Container startup latency (50%, 95%, 99%)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="50%" type="monotone" dataKey="startup50" stroke="#38BDF8" dot={false} strokeWidth={2.5} />
                    <Line name="95%" type="monotone" dataKey="startup95" stroke="#FBBF24" dot={false} strokeWidth={2} />
                    <Line name="99%" type="monotone" dataKey="startup99" stroke="#F43F5E" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 14: Container health checks */}
            <Col xs={24} lg={12}>
              <ChartCard title="Container health checks (HEALTHY, UNHEALTHY, UNKNOWN)">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar name="HEALTHY" dataKey="healthyCount" fill="var(--color-success)" stackId="h" radius={[0, 0, 0, 0]} />
                    <Bar name="UNHEALTHY" dataKey="unhealthyCount" fill="var(--color-error)" stackId="h" radius={[0, 0, 0, 0]} />
                    <Bar name="UNKNOWN" dataKey="unknownCount" fill="var(--color-text-tertiary)" stackId="h" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>

            {/* Chart 15: Recommended instances */}
            <Col xs={24} lg={12}>
              <ChartCard title="Recommended instances (Concurrency vs CPU vs System)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line name="Concurrency Utilization" type="monotone" dataKey="recConcurrency" stroke="#60A5FA" dot={false} strokeWidth={2.5} />
                    <Line name="CPU Utilization" type="monotone" dataKey="recCpu" stroke="#34D399" dot={false} strokeWidth={2} />
                    <Line name="System Recommendation" type="monotone" dataKey="recSystem" stroke="#A78BFA" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'logs',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
          <FileTextOutlined /> System Logs
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input.Search 
              placeholder="Search logs by keyword, endpoint, or HTTP status..." 
              style={{ maxWidth: 400 }} 
              allowClear 
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              onSearch={(val) => setLogSearch(val)}
            />
            <Select value={severityFilter} onChange={setSeverityFilter} style={{ width: 160 }} options={[
              { value: 'all', label: 'Severity: All Levels' },
              { value: 'info', label: 'ℹ️ INFO' },
              { value: 'warn', label: '⚠️ WARNING' },
              { value: 'error', label: '🔴 ERROR' },
            ]} />
          </div>

          <Card variant="outlined" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={logsData}
              rowKey="id"
              pagination={false}
              size="middle"
              loading={isFetchingLogs}
            >
              <Table.Column title="Severity" dataIndex="severity" key="severity" width={100} render={(val) => (
                <Tag color={val === 'error' ? 'error' : val === 'warn' ? 'warning' : 'blue'}>
                  {val.toUpperCase()}
                </Tag>
              )} />
              <Table.Column title="Timestamp" dataIndex="time" key="time" width={200} />
              <Table.Column title="Log Message Summary" dataIndex="summary" key="summary" render={(text) => (
                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{text}</span>
              )} />
            </Table>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner Card synchronized with SitesList cards */}
      <Card variant="outlined" styles={{ body: { padding: '24px 32px' } }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {!isClusterMode && (
            <div>
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/workspace/projects')} 
                style={{ paddingLeft: 0, fontWeight: 500, fontSize: 14 }}
              >
                Back to Projects
              </Button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Space align="center" size="large">
              <div style={{ 
                width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--color-info-bg)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)'
              }}>
                {isClusterMode ? <CloudServerOutlined style={{ fontSize: 24 }} /> : <GlobalOutlined style={{ fontSize: 24 }} />}
              </div>
              <div>
                <Space align="center">
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {isClusterMode ? 'Cluster Observability & Telemetry' : (site?.name || 'Loading Project Details...')}
                  </h2>
                </Space>
                <div style={{ marginTop: 4 }}>
                  {!isClusterMode && site?.subdomain ? (
                    <a 
                      href={getPublicSiteUrl(site.subdomain)} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ fontSize: 14, color: 'var(--color-info)', fontWeight: 500 }}
                    >
                      {getPublicSiteUrl(site.subdomain)}
                    </a>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Real-time cluster probes, HTTP traffic latencies, and microservice status logs.
                    </Text>
                  )}
                </div>
              </div>
            </Space>

            <Space size="middle">
              {isClusterMode ? (
                <Tag 
                  color={healthData?.status === 'ok' ? 'success' : healthData?.status === 'degraded' ? 'warning' : 'error'} 
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600 }}
                >
                  {healthData?.status === 'ok' ? '🟢 System Healthy (Probes OK)' : healthData?.status === 'degraded' ? '🟡 Degraded Performance' : '🔴 System Outage'}
                </Tag>
              ) : (
                <Tag 
                  color={site?.isPublished ? 'success' : 'blue'} 
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600 }}
                >
                  {site?.isPublished ? '🟢 Published & Active' : '🟢 Live & Serving Traffic'}
                </Tag>
              )}
              <Button 
                type="primary" 
                ghost 
                icon={<ReloadOutlined spin={isFetching || isFetchingMetrics || isFetchingLogs} />} 
                size="middle"
                onClick={() => {
                  if (isClusterMode) refetchHealth();
                  refetchMetrics();
                  refetchLogs();
                  message.success(isClusterMode ? 'Refreshed live cluster telemetry & probes' : 'Refreshed live site HTTP traffic & container metrics');
                }}
              >
                {isClusterMode ? 'Refresh Probes' : 'Refresh Metrics'}
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* Synchronized Navigation Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={tabItems}
      />
    </div>
  );
};

export default ObservabilityDashboard;
