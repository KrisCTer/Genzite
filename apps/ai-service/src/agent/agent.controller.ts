import { Body, Controller, Post, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { AgentService } from './agent.service.js';
import { PlannerService } from './planning/planner.service.js';
import { UiAgentService } from './modes/ui-agent.service.js';
import { AgentChatDto } from './dto/agent.dto.js';

@Controller('ai/agent')
export class AgentController {
  constructor(
    @InjectQueue(AI_QUEUES.AGENT_TASKS)
    private readonly agentQueue: Queue,
    private readonly agentService: AgentService,
    private readonly plannerService: PlannerService,
    private readonly uiAgentService: UiAgentService,
  ) {}

  /**
   * Simple chat — Agent uses Gemini Function Calling to pick tools reactively.
   * Best for straightforward, single-action requests.
   */
  @Post('chat')
  @HttpCode(HttpStatus.ACCEPTED)
  async chat(
    @Body() dto: AgentChatDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.agentQueue.add('chat', {
      message: dto.message,
      model: dto.model,
      userId: userId ?? 'anonymous',
    });
    return {
      message: 'Agent chat job accepted',
      jobId: job.id,
    };
  }

  /**
   * Planning mode — Agent breaks the goal into a multi-step plan,
   * executes steps in dependency order, and re-plans on failure.
   * Best for complex, multi-tool requests.
   */
  @Post('plan')
  @HttpCode(HttpStatus.ACCEPTED)
  async plan(
    @Body() dto: AgentChatDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.agentQueue.add('plan', {
      message: dto.message,
      model: dto.model,
      userId: userId ?? 'anonymous',
    });
    return {
      message: 'Agent plan job accepted',
      jobId: job.id,
    };
  }

  /**
   * UI Design mode — Specialized agent for generating beautiful web interfaces.
   * Enhanced by codebase-memory (project scanning) and stitch (design patterns) MCP tools.
   */
  @Post('ui')
  @HttpCode(HttpStatus.ACCEPTED)
  async ui(
    @Body() dto: AgentChatDto,
    @Headers('x-user-id') userId?: string,
  ) {
    const job = await this.agentQueue.add('ui', {
      message: dto.message,
      model: dto.model,
      userId: userId ?? 'anonymous',
    });
    return {
      message: 'UI Agent job accepted',
      jobId: job.id,
    };
  }
}
