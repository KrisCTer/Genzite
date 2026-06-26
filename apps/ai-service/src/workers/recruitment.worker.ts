import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CareerCoachService } from '../recruitment/career-coach.service.js';
import { MockInterviewService } from '../recruitment/mock-interview.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiProducer } from '../events/ai.producer.js';
import { AI_QUEUES } from './queue.constants.js';

@Processor(AI_QUEUES.CAREER_COACHING)
export class CareerCoachingWorker extends WorkerHost {
  private readonly logger = new Logger(CareerCoachingWorker.name);

  constructor(private readonly careerCoachService: CareerCoachService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing Career Coaching: ${job.name}, job=${job.id}`);
    
    try {
      await this.careerCoachService.generateRoadmap(job.data.resumeId, job.data.userId);
      this.logger.log(`Career Coaching completed: ${job.name}, job=${job.id}`);
    } catch (error) {
      this.logger.error(`Career Coaching failed: ${job.name}, job=${job.id}, error=${error}`);
      throw error;
    }
  }
}

@Processor(AI_QUEUES.MOCK_INTERVIEW)
export class MockInterviewWorker extends WorkerHost {
  private readonly logger = new Logger(MockInterviewWorker.name);

  constructor(
    private readonly mockInterviewService: MockInterviewService,
    private readonly prisma: PrismaService,
    private readonly aiProducer: AiProducer,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing Mock Interview Task: ${job.name}, job=${job.id}`);
    
    try {
      if (job.name === 'start') {
        await this.mockInterviewService.startSession(job.data.dto, job.data.userId);
      } else if (job.name === 'chat') {
        await this.mockInterviewService.chat(job.data.sessionId, job.data.message);
      } else if (job.name === 'end') {
        const evaluation = await this.mockInterviewService.endSession(job.data.sessionId);
        
        const session = await this.prisma.interviewSession.findUnique({ where: { id: job.data.sessionId } });
        const resume = await this.prisma.resume.findUnique({ where: { id: session?.resumeId ?? '' } });
        
        if (session && resume) {
          await this.aiProducer.emitInterviewCompleted({
            sessionId: session.id,
            resumeId: resume.id,
            ownerId: resume.ownerId,
            overallScore: evaluation.overallScore,
          });
        }
      } else {
        throw new Error(`Unknown mock interview job name: ${job.name}`);
      }

      this.logger.log(`Mock Interview Task completed: ${job.name}, job=${job.id}`);
    } catch (error) {
      this.logger.error(`Mock Interview Task failed: ${job.name}, job=${job.id}, error=${error}`);
      throw error;
    }
  }
}
