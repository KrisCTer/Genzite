import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiClient } from '../gemini/ai.client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  MOCK_INTERVIEW_SYSTEM,
  MOCK_INTERVIEW_FIRST_QUESTION_PROMPT,
  MOCK_INTERVIEW_RESPONSE_PROMPT,
  MOCK_INTERVIEW_EVALUATION_PROMPT,
} from '../gemini/prompts/templates.js';

interface StartSessionDto {
  resumeId: string;
  jobDescription: string;
  sessionType: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED';
  model?: string;
}

interface InterviewQuestion {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  difficulty: string;
}

interface InterviewFeedback {
  feedback: string;
  score: number;
  nextQuestion: string | null;
  questionNumber: number;
  difficulty: string;
  isComplete: boolean;
}

export interface InterviewEvaluation {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
  studyRecommendations: Array<{
    topic: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  }>;
  hireRecommendation: string;
}

@Injectable()
export class MockInterviewService {
  private readonly logger = new Logger(MockInterviewService.name);

  constructor(
    private readonly ai: AiClient,
    private readonly prisma: PrismaService,
  ) {}

  async startSession(dto: StartSessionDto, userId?: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id: dto.resumeId } });
    if (!resume) {
      throw new NotFoundException(`Resume not found: ${dto.resumeId}`);
    }

    const resumeText = resume.rawText ?? JSON.stringify(resume.parsedProfile ?? {});

    const systemPrompt = MOCK_INTERVIEW_SYSTEM.replace('{{SESSION_TYPE}}', dto.sessionType);
    const firstQuestionPrompt = MOCK_INTERVIEW_FIRST_QUESTION_PROMPT
      .replace('{{RESUME}}', resumeText)
      .replace('{{JD}}', dto.jobDescription);

    const firstQuestion = await this.ai.generateJson<InterviewQuestion>(
      firstQuestionPrompt,
      {
        model: dto.model as any,
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    );

    const dialogueHistory = [
      {
        role: 'interviewer',
        content: firstQuestion.question,
        questionNumber: firstQuestion.questionNumber,
        difficulty: firstQuestion.difficulty,
        timestamp: new Date().toISOString(),
      },
    ];

    const session = await this.prisma.interviewSession.create({
      data: {
        resumeId: dto.resumeId,
        jobDescription: dto.jobDescription,
        sessionType: dto.sessionType,
        dialogueHistory: dialogueHistory as object[],
        status: 'IN_PROGRESS',
      },
    });

    await this.prisma.aiTaskLog.create({
      data: {
        userId: userId ?? resume.ownerId,
        taskType: 'INTERVIEW',
        input: { sessionId: session.id, sessionType: dto.sessionType } as object,
        startedAt: new Date(),
      },
    });

    this.logger.log(`Interview started: session=${session.id}, type=${dto.sessionType}`);

    return {
      sessionId: session.id,
      firstQuestion: firstQuestion.question,
      questionNumber: firstQuestion.questionNumber,
      totalQuestions: firstQuestion.totalQuestions,
      difficulty: firstQuestion.difficulty,
    };
  }

  async chat(sessionId: string, message: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Interview session not found: ${sessionId}`);
    }
    if (session.status === 'COMPLETED') {
      throw new NotFoundException(`Interview session already completed: ${sessionId}`);
    }

    const resume = await this.prisma.resume.findUnique({ where: { id: session.resumeId } });
    const resumeText = resume?.rawText ?? '';

    const history = (session.dialogueHistory as Array<Record<string, unknown>>) ?? [];

    const chatHistory = history.map((entry) => ({
      role: entry.role === 'interviewer' ? ('model' as const) : ('user' as const),
      content: String(entry.content),
    }));

    const systemPrompt = MOCK_INTERVIEW_SYSTEM.replace('{{SESSION_TYPE}}', session.sessionType);
    const responsePrompt = MOCK_INTERVIEW_RESPONSE_PROMPT.replace('{{ANSWER}}', message);

    const feedback = await this.ai.chatJson<InterviewFeedback>(
      systemPrompt,
      chatHistory,
      responsePrompt,
      { temperature: 0.6, maxOutputTokens: 1024 },
    );

    history.push(
      {
        role: 'candidate',
        content: message,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'interviewer',
        content: feedback.nextQuestion ?? feedback.feedback,
        feedback: feedback.feedback,
        score: feedback.score,
        questionNumber: feedback.questionNumber,
        difficulty: feedback.difficulty,
        timestamp: new Date().toISOString(),
      },
    );

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { dialogueHistory: history as object[] },
    });

    this.logger.debug(`Interview chat: session=${sessionId}, score=${feedback.score}, complete=${feedback.isComplete}`);

    return {
      feedback: feedback.feedback,
      score: feedback.score,
      nextQuestion: feedback.nextQuestion,
      questionNumber: feedback.questionNumber,
      difficulty: feedback.difficulty,
      isComplete: feedback.isComplete,
    };
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Interview session not found: ${sessionId}`);
    }

    const history = (session.dialogueHistory as Array<Record<string, unknown>>) ?? [];

    const chatHistory = history.map((entry) => ({
      role: entry.role === 'interviewer' ? ('model' as const) : ('user' as const),
      content: String(entry.content),
    }));

    const systemPrompt = MOCK_INTERVIEW_SYSTEM.replace('{{SESSION_TYPE}}', session.sessionType);

    const evaluation = await this.ai.chatJson<InterviewEvaluation>(
      systemPrompt,
      chatHistory,
      MOCK_INTERVIEW_EVALUATION_PROMPT,
      { temperature: 0.3, maxOutputTokens: 2048 },
    );

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        evaluation: evaluation as object,
        status: 'COMPLETED',
      },
    });

    this.logger.log(`Interview ended: session=${sessionId}, score=${evaluation.overallScore}`);

    return evaluation;
  }
}
