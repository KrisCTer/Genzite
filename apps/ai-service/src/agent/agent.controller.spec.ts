import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { PlannerService } from './planning/planner.service';
import { UiAgentService } from './modes/ui-agent.service';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { AI_QUEUES } from '../workers/queue.constants';

describe('AgentController', () => {
  let controller: AgentController;
  let agentQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      providers: [
        {
          provide: getQueueToken(AI_QUEUES.AGENT_TASKS),
          useValue: {
            add: jest.fn(),
          },
        },
        { provide: AgentService, useValue: {} },
        { provide: PlannerService, useValue: {} },
        { provide: UiAgentService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AgentController>(AgentController);
    agentQueue = module.get<Queue>(getQueueToken(AI_QUEUES.AGENT_TASKS));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should add job to agentQueue', async () => {
      jest.spyOn(agentQueue, 'add').mockResolvedValue({ id: 'job-1' } as any);

      const result = await controller.chat({ message: 'Hello' }, 'user-1');

      expect(agentQueue.add).toHaveBeenCalledWith('chat', {
        message: 'Hello',
        model: undefined,
        userId: 'user-1',
      });
      expect(result).toEqual({ message: 'Agent chat job accepted', jobId: 'job-1' });
    });
  });

  describe('plan', () => {
    it('should add job to agentQueue', async () => {
      jest.spyOn(agentQueue, 'add').mockResolvedValue({ id: 'job-2' } as any);

      const result = await controller.plan({ message: 'Plan something' }, 'user-1');

      expect(agentQueue.add).toHaveBeenCalledWith('plan', {
        message: 'Plan something',
        model: undefined,
        userId: 'user-1',
      });
      expect(result).toEqual({ message: 'Agent plan job accepted', jobId: 'job-2' });
    });
  });

  describe('ui', () => {
    it('should add job to agentQueue', async () => {
      jest.spyOn(agentQueue, 'add').mockResolvedValue({ id: 'job-3' } as any);

      const result = await controller.ui({ message: 'Design UI' }, 'user-1');

      expect(agentQueue.add).toHaveBeenCalledWith('ui', {
        message: 'Design UI',
        model: undefined,
        userId: 'user-1',
      });
      expect(result).toEqual({ message: 'UI Agent job accepted', jobId: 'job-3' });
    });
  });
});
