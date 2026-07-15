import apiClient from './client';

export interface MicroserviceHealth {
  status: 'ok' | 'degraded' | 'down';
  name: string;
  latencyMs?: number;
  db?: string;
  service?: string;
  error?: string;
}

export interface AggregatedHealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: Record<string, MicroserviceHealth>;
}

export const fetchHealthStatusApi = async (): Promise<AggregatedHealthResponse> => {
  const response = await apiClient.get<AggregatedHealthResponse>('/health/all');
  return response.data;
};

export const fetchClusterMetricsApi = async (range: string = '24h') => {
  const response = await apiClient.get('/observability/cluster/metrics', { params: { range } });
  return response.data;
};

export const fetchClusterLogsApi = async (severity?: string) => {
  const response = await apiClient.get('/observability/cluster/logs', { params: { severity } });
  return response.data;
};

export const fetchSiteHealthApi = async (siteId: string): Promise<AggregatedHealthResponse> => {
  const response = await apiClient.get<AggregatedHealthResponse>(`/sites/${siteId}/observability/health`);
  return response.data;
};

