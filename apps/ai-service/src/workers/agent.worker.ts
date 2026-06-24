import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AgentService } from '../agent/agent.service.js';
import { PlannerService } from '../agent/planning/planner.service.js';
import { UiAgentService } from '../agent/modes/ui-agent.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AI_QUEUES } from './queue.constants.js';

@Processor(AI_QUEUES.AGENT_TASKS)
export class AgentWorker extends WorkerHost {
  private readonly logger = new Logger(AgentWorker.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly plannerService: PlannerService,
    private readonly uiAgentService: UiAgentService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing Agent Task: ${job.name}, job=${job.id}`);
    
    // Create an AiTaskLog record to track execution
    const taskLog = await this.prisma.aiTaskLog.create({
      data: {
        userId: job.data.userId || 'anonymous',
        taskType: 'AGENT_TASK',
        input: { jobName: job.name, ...job.data } as object,
        startedAt: new Date(),
      },
    });

    try {
      let result: any;
      if (job.name === 'chat') {
        result = await this.agentService.chat(job.data.message, job.data.model);
      } else if (job.name === 'plan') {
        result = await this.plannerService.planAndExecute(job.data.message, job.data.model);
      } else if (job.name === 'ui') {
        result = await this.uiAgentService.design(job.data.message, job.data.model);
      } else {
        throw new Error(`Unknown job name: ${job.name}`);
      }

      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'COMPLETED',
          output: result as object,
          endedAt: new Date(),
        },
      });

      this.logger.log(`Agent Task completed: ${job.name}, job=${job.id}`);
    } catch (error) {
      this.logger.error(`Agent Task failed: ${job.name}, job=${job.id}, error=${error}`);
      
      await this.prisma.aiTaskLog.update({
        where: { id: taskLog.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          endedAt: new Date(),
        },
      });
      
      throw error;
    }
  }
}
