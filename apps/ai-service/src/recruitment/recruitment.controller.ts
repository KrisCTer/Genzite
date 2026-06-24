import { Controller, Post, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { CvAnalyzerService } from './cv-analyzer.service.js';
import { MockInterviewService } from './mock-interview.service.js';
import { CareerCoachService } from './career-coach.service.js';
import { AnalyzeCvDto, StartInterviewDto, InterviewChatDto } from './dto/recruitment.dto.js';

@Controller('ai')
export class RecruitmentController {
  constructor(
    @InjectQueue(AI_QUEUES.CV_ANALYSIS)
    private readonly cvAnalysisQueue: Queue,
    @InjectQueue(AI_QUEUES.CAREER_COACHING)
    private readonly careerCoachingQueue: Queue,
    @InjectQueue(AI_QUEUES.MOCK_INTERVIEW)
    private readonly mockInterviewQueue: Queue,
    private readonly cvAnalyzer: CvAnalyzerService,
    private readonly mockInterview: MockInterviewService,
    private readonly careerCoach: CareerCoachService,
  ) {}

  @Post('analyze-cv')
  @HttpCode(HttpStatus.ACCEPTED)
  async analyzeCv(
    @Body() dto: AnalyzeCvDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.cvAnalysisQueue.add('analyze', {
      resumeId: dto.resumeId,
      jobDescription: dto.jobDescription,
      ownerId: userId ?? 'anonymous',
      model: dto.model,
    });

    return {
      message: 'CV analysis job accepted',
      jobId: job.id,
    };
  }

  @Post('mock-interview/start')
  @HttpCode(HttpStatus.ACCEPTED)
  async startInterview(
    @Body() dto: StartInterviewDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.mockInterviewQueue.add('start', {
      dto,
      userId: userId ?? 'anonymous',
    });
    return {
      message: 'Mock interview start job accepted',
      jobId: job.id,
    };
  }

  @Post('mock-interview/:sessionId/chat')
  @HttpCode(HttpStatus.ACCEPTED)
  async chat(
    @Param('sessionId') sessionId: string,
    @Body() dto: InterviewChatDto,
  ) {
    const job = await this.mockInterviewQueue.add('chat', {
      sessionId,
      message: dto.message,
    });
    return {
      message: 'Mock interview chat job accepted',
      jobId: job.id,
    };
  }

  @Post('mock-interview/:sessionId/end')
  @HttpCode(HttpStatus.ACCEPTED)
  async endInterview(@Param('sessionId') sessionId: string) {
    const job = await this.mockInterviewQueue.add('end', {
      sessionId,
    });
    return {
      message: 'Mock interview end job accepted',
      jobId: job.id,
    };
  }

  @Post('career-coaching')
  @HttpCode(HttpStatus.ACCEPTED)
  async getCareerRoadmap(
    @Body('resumeId') resumeId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.careerCoachingQueue.add('generateRoadmap', {
      resumeId,
      userId: userId ?? 'anonymous',
    });
    return {
      message: 'Career coaching job accepted',
      jobId: job.id,
    };
  }
}
