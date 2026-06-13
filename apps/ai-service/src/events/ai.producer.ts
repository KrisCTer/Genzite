import { Injectable } from '@nestjs/common';

@Injectable()
export class AiProducer {
  async emitSiteGenerated(payload: { siteId: string; prompt: string; ownerId: string }) {
    console.log('[AI] Event emitted: site.generated', payload);
  }

  async emitResumeAnalyzed(payload: { resumeId: string; ownerId: string; atsScore: number }) {
    console.log('[AI] Event emitted: resume.analyzed', payload);
  }

  async emitInterviewCompleted(payload: { sessionId: string; resumeId: string; ownerId: string; overallScore: number }) {
    console.log('[AI] Event emitted: interview.completed', payload);
  }
}
