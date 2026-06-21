import { Controller, Post, Get, Body, Param, Headers } from '@nestjs/common';
import { CvAnalyzerService } from './cv-analyzer.service.js';
import { MockInterviewService } from './mock-interview.service.js';
import { CareerCoachService } from './career-coach.service.js';
import { AnalyzeCvDto, StartInterviewDto, InterviewChatDto } from './dto/recruitment.dto.js';

@Controller('ai')
export class RecruitmentController {
  constructor(
    private readonly cvAnalyzer: CvAnalyzerService,
    private readonly mockInterview: MockInterviewService,
    private readonly careerCoach: CareerCoachService,
  ) {}

  @Post('analyze-cv')
  async analyzeCv(
    @Body() dto: AnalyzeCvDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.cvAnalyzer.analyze(dto.resumeId, dto.jobDescription, userId, dto.model);
  }

  @Post('mock-interview/start')
  async startInterview(
    @Body() dto: StartInterviewDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.mockInterview.startSession(dto, userId);
  }

  @Post('mock-interview/:sessionId/chat')
  async chat(
    @Param('sessionId') sessionId: string,
    @Body() dto: InterviewChatDto,
  ) {
    return this.mockInterview.chat(sessionId, dto.message);
  }

  @Post('mock-interview/:sessionId/end')
  async endInterview(@Param('sessionId') sessionId: string) {
    return this.mockInterview.endSession(sessionId);
  }

  @Get('career-coaching/:resumeId')
  async getCareerRoadmap(
    @Param('resumeId') resumeId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.careerCoach.generateRoadmap(resumeId, userId);
  }
}
