export interface IResumeEntity {
  id: string;
  ownerId: string;
  title: string | null;
  rawText: string | null;
  s3Key: string | null;
  parsedProfile: Record<string, unknown> | null;
  atsScores: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewSessionEntity {
  id: string;
  resumeId: string;
  jobDescription: string;
  sessionType: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED';
  dialogueHistory: Array<{ role: string; content: string; timestamp: string }>;
  evaluation: Record<string, unknown> | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
}
