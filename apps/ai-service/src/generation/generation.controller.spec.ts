import { Test, TestingModule } from '@nestjs/testing';
import { GenerationController } from './generation.controller';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { AI_QUEUES } from '../workers/queue.constants';

describe('GenerationController', () => {
  let controller: GenerationController;
  let siteQueue: Queue;
  let cmsQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerationController],
      providers: [
        {
          provide: getQueueToken(AI_QUEUES.SITE_GENERATION),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getQueueToken(AI_QUEUES.CMS_GENERATION),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GenerationController>(GenerationController);
    siteQueue = module.get<Queue>(getQueueToken(AI_QUEUES.SITE_GENERATION));
    cmsQueue = module.get<Queue>(getQueueToken(AI_QUEUES.CMS_GENERATION));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSite', () => {
    it('should add job to siteQueue', async () => {
      jest.spyOn(siteQueue, 'add').mockResolvedValue({ id: 'job-1' } as any);

      const result = await controller.generateSite({ prompt: 'Create a blog', model: 'gemini-pro' }, 'user-1');

      expect(siteQueue.add).toHaveBeenCalledWith('generate', {
        prompt: 'Create a blog',
        ownerId: 'user-1',
        model: 'gemini-pro',
      });
      expect(result).toEqual({ message: 'Site generation job accepted', jobId: 'job-1' });
    });
  });

  describe('generateCms', () => {
    it('should add job to cmsQueue', async () => {
      jest.spyOn(cmsQueue, 'add').mockResolvedValue({ id: 'job-2' } as any);

      const result = await controller.generateCms({ siteId: 'site-1', prompt: 'Create posts', model: 'gemini-pro' }, 'user-1');

      expect(cmsQueue.add).toHaveBeenCalledWith('generate', {
        siteId: 'site-1',
        prompt: 'Create posts',
        ownerId: 'user-1',
        model: 'gemini-pro',
      });
      expect(result).toEqual({ message: 'CMS generation job accepted', jobId: 'job-2' });
    });
  });
});
