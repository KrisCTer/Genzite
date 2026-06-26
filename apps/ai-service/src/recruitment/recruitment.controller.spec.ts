import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentController } from './recruitment.controller';
import { CvAnalyzerService } from './cv-analyzer.service';
import { MockInterviewService } from './mock-interview.service';
import { CareerCoachService } from './career-coach.service';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { AI_QUEUES } from '../workers/queue.constants';

describe('RecruitmentController', () => {
  let controller: RecruitmentController;
  let cvAnalysisQueue: Queue;
  let careerCoachingQueue: Queue;
  let mockInterviewQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitmentController],
      providers: [
        {
          provide: getQueueToken(AI_QUEUES.CV_ANALYSIS),
          useValue: { add: jest.fn() },
        },
        {
          provide: getQueueToken(AI_QUEUES.CAREER_COACHING),
          useValue: { add: jest.fn() },
        },
        {
          provide: getQueueToken(AI_QUEUES.MOCK_INTERVIEW),
          useValue: { add: jest.fn() },
        },
        { provide: CvAnalyzerService, useValue: {} },
        { provide: MockInterviewService, useValue: {} },
        { provide: CareerCoachService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RecruitmentController>(RecruitmentController);
    cvAnalysisQueue = module.get<Queue>(getQueueToken(AI_QUEUES.CV_ANALYSIS));
    careerCoachingQueue = module.get<Queue>(getQueueToken(AI_QUEUES.CAREER_COACHING));
    mockInterviewQueue = module.get<Queue>(getQueueToken(AI_QUEUES.MOCK_INTERVIEW));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCv', () => {
    it('should add job to cvAnalysisQueue', async () => {
      jest.spyOn(cvAnalysisQueue, 'add').mockResolvedValue({ id: 'job-1' } as any);

      const result = await controller.analyzeCv({ resumeId: 'res-1', jobDescription: 'Dev' }, 'user-1');

      expect(cvAnalysisQueue.add).toHaveBeenCalledWith('analyze', {
        resumeId: 'res-1',
        jobDescription: 'Dev',
        ownerId: 'user-1',
        model: undefined,
      });
      expect(result).toEqual({ message: 'CV analysis job accepted', jobId: 'job-1' });
    });
  });

  describe('startInterview', () => {
    it('should add job to mockInterviewQueue', async () => {
      jest.spyOn(mockInterviewQueue, 'add').mockResolvedValue({ id: 'job-2' } as any);
      const dto = { resumeId: 'res-1', jobDescription: 'Dev', sessionType: 'mock' as any };

      const result = await controller.startInterview(dto, 'user-1');

      expect(mockInterviewQueue.add).toHaveBeenCalledWith('start', {
        dto,
        userId: 'user-1',
      });
      expect(result).toEqual({ message: 'Mock interview start job accepted', jobId: 'job-2' });
    });
  });

  describe('chat', () => {
    it('should add job to mockInterviewQueue', async () => {
      jest.spyOn(mockInterviewQueue, 'add').mockResolvedValue({ id: 'job-3' } as any);

      const result = await controller.chat('sess-1', { message: 'Hello' });

      expect(mockInterviewQueue.add).toHaveBeenCalledWith('chat', {
        sessionId: 'sess-1',
        message: 'Hello',
      });
      expect(result).toEqual({ message: 'Mock interview chat job accepted', jobId: 'job-3' });
    });
  });

  describe('endInterview', () => {
    it('should add job to mockInterviewQueue', async () => {
      jest.spyOn(mockInterviewQueue, 'add').mockResolvedValue({ id: 'job-4' } as any);

      const result = await controller.endInterview('sess-1');

      expect(mockInterviewQueue.add).toHaveBeenCalledWith('end', {
        sessionId: 'sess-1',
      });
      expect(result).toEqual({ message: 'Mock interview end job accepted', jobId: 'job-4' });
    });
  });

  describe('getCareerRoadmap', () => {
    it('should add job to careerCoachingQueue', async () => {
      jest.spyOn(careerCoachingQueue, 'add').mockResolvedValue({ id: 'job-5' } as any);

      const result = await controller.getCareerRoadmap('res-1', 'user-1');

      expect(careerCoachingQueue.add).toHaveBeenCalledWith('generateRoadmap', {
        resumeId: 'res-1',
        userId: 'user-1',
      });
      expect(result).toEqual({ message: 'Career coaching job accepted', jobId: 'job-5' });
    });
  });
});
