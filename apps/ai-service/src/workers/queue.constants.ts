/**
 * BullMQ queue names for AI-service background job processing.
 * Workers consume jobs from these queues via Redis.
 */
export const AI_QUEUES = {
  CV_ANALYSIS: 'ai-cv-analysis',
  SITE_GENERATION: 'ai-site-generation',
  CMS_GENERATION: 'ai-cms-generation',
  AGENT_TASKS: 'ai-agent-tasks',
  CAREER_COACHING: 'ai-career-coaching',
  MOCK_INTERVIEW: 'ai-mock-interview',
} as const;

export type AiQueueName = (typeof AI_QUEUES)[keyof typeof AI_QUEUES];
