import apiClient from './client';

// ============ Generation API ============
export const generateSiteApi = async (data: { prompt: string; model?: string; siteId?: string, theme?: string; attachments?: { base64?: string; url?: string; mimeType: string }[] }) => {
  const response = await apiClient.post<{ message: string; jobId: string }>('/ai/generate-site', data);
  return response.data;
};

export const improvePromptApi = async (data: { prompt: string }) => {
  const response = await apiClient.post<{ improved: string }>('/ai/improve-prompt', data);
  return response.data;
};

export const fetchAiModelsApi = async () => {
  const response = await apiClient.get<{key: string, label: string}[]>('/ai/models');
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
