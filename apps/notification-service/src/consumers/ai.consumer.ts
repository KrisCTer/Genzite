import { Injectable } from '@nestjs/common';

/**
 * Listens to AI-related events and triggers notifications.
 */
@Injectable()
export class AiConsumer {
  async handleResumeAnalyzed(payload: { resumeId: string; ownerId: string; atsScore: number }) {
    // TODO: Send notification with ATS score results
    console.log('[Notification] Consumed: resume.analyzed → Notifying user', payload.ownerId);
  }

  async handleInterviewCompleted(payload: { sessionId: string; ownerId: string; overallScore: number }) {
    // TODO: Send interview evaluation notification
    console.log('[Notification] Consumed: interview.completed → Notifying user', payload.ownerId);
  }
}
