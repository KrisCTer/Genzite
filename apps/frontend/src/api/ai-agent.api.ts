export interface AgentJobResponse {
  message: string;
  jobId: string;
}

export interface AgentJobStatus {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  result?: any;
  failedReason?: string;
}

const API_BASE = 'http://localhost:3006/api/v1/ai/agent';

export const dispatchUiAgent = async (prompt: string): Promise<string> => {
  const response = await fetch(`${API_BASE}/ui`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt }),
  });
  if (!response.ok) throw new Error('Failed to dispatch UI agent');
  const data: AgentJobResponse = await response.json();
  return data.jobId;
};

export const getJobStatus = async (jobId: string): Promise<AgentJobStatus> => {
  const response = await fetch(`${API_BASE}/job/${jobId}`);
  if (!response.ok) throw new Error('Failed to fetch job status');
  return response.json();
};
