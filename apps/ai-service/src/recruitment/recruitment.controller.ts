import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CvAnalyzerService } from './cv-analyzer.service.js';
import { MockInterviewService } from './mock-interview.service.js';
import { CareerCoachService } from './career-coach.service.js';

@Controller('ai')
export class RecruitmentController {
  constructor(
    private readonly cvAnalyzer: CvAnalyzerService,
    private readonly mockInterview: MockInterviewService,
    private readonly careerCoach: CareerCoachService,
  ) {}

  @Post('analyze-cv')
  async analyzeCv(@Body() body: { resumeId: string; jobDescription: string }) {
    return this.cvAnalyzer.analyze(body.resumeId, body.jobDescription);
  }

  @Post('mock-interview/start')
  async startInterview(@Body() body: { resumeId: string; jobDescription: string; sessionType: string }) {
    return this.mockInterview.startSession(body);
  }

  @Post('mock-interview/:sessionId/chat')
  async chat(@Param('sessionId') sessionId: string, @Body() body: { message: string }) {
    return this.mockInterview.chat(sessionId, body.message);
  }

  @Post('mock-interview/:sessionId/end')
  async endInterview(@Param('sessionId') sessionId: string) {
    return this.mockInterview.endSession(sessionId);
  }

  @Get('career-coaching/:resumeId')
  async getCareerRoadmap(@Param('resumeId') resumeId: string) {
    return this.careerCoach.generateRoadmap(resumeId);
  }
}
