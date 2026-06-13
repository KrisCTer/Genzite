import { Injectable } from '@nestjs/common';

@Injectable()
export class MockInterviewService {
  async startSession(dto: { resumeId: string; jobDescription: string; sessionType: string }) {
    // TODO: Create interview session in DB, call Gemini to generate first question
    return {
      sessionId: 'session-uuid',
      firstQuestion: 'Can you describe your experience with React hooks?',
    };
  }

  async chat(sessionId: string, message: string) {
    // TODO: Send message to Gemini, get feedback + next question, store in dialogue_history JSONB
    return {
      feedback: 'Good answer. Try to elaborate on cleanup functions.',
      score: 7,
      nextQuestion: 'How do you handle side effects in useEffect?',
      isComplete: false,
    };
  }

  async endSession(sessionId: string) {
    // TODO: Call Gemini to generate full evaluation, save to DB
    return {
      overallScore: 72,
      strengths: ['React fundamentals', 'Problem solving'],
      weaknesses: ['TypeScript generics', 'Testing'],
      studyRecommendations: [
        { topic: 'TypeScript generics', priority: 'HIGH', resources: [] },
      ],
    };
  }
}
