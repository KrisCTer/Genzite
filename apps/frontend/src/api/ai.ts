import apiClient from './client';

// ============ Generation API ============
export const generateSiteApi = async (data: { prompt: string; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/generate-site', data);
  return response.data;
};

export const getSiteJobApi = async (jobId: string) => {
  const response = await apiClient.get<any>(`/ai/site/job/${jobId}`);
  return response.data;
};

export const generateCmsApi = async (data: { siteId: string; prompt: string; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/generate-cms', data);
  return response.data;
};

export const getCmsJobApi = async (jobId: string) => {
  const response = await apiClient.get<any>(`/ai/cms/job/${jobId}`);
  return response.data;
};

// ============ Recruitment API ============
export const analyzeCvApi = async (data: { resumeId: string; jobDescription: string; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/analyze-cv', data);
  return response.data;
};

export const startInterviewApi = async (data: { resumeId: string; jobDescription: string; sessionType: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED'; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/mock-interview/start', data);
  return response.data;
};

export const interviewChatApi = async (sessionId: string, data: { message: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>(`/ai/mock-interview/${sessionId}/chat`, data);
  return response.data;
};

export const endInterviewApi = async (sessionId: string) => {
  const response = await apiClient.post<{ message: string; jobId: string }>(`/ai/mock-interview/${sessionId}/end`);
  return response.data;
};

export const careerCoachingApi = async (data: { resumeId: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/career-coaching', data);
  return response.data;
};

// ============ Agent API ============
export const agentChatApi = async (data: { message: string; conversationId?: string; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/agent/chat', data);
  return response.data;
};

export const agentPlanApi = async (data: { message: string; conversationId?: string; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/agent/plan', data);
  return response.data;
};

export const agentUiApi = async (data: { message: string; conversationId?: string; model?: string }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/agent/ui', data);
  return response.data;
};

export const getAgentJobApi = async (jobId: string) => {
  const response = await apiClient.get<any>(`/ai/agent/job/${jobId}`);
  return response.data;
};

// ============ MCP Logs API ============
export const fetchMcpLogsApi = async () => {
  const response = await apiClient.get<any[]>('/ai/mcp/logs');
  return response.data;
};
