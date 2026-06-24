import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module.js';
import { GenerationModule } from '../generation/generation.module.js';
import { RecruitmentModule } from '../recruitment/recruitment.module.js';
import { PipelineModule } from '../pipeline/pipeline.module.js';
import { BullModule } from '@nestjs/bullmq';
import { AgentController } from './agent.controller.js';
import { AgentService } from './agent.service.js';
import { PlannerService } from './planning/planner.service.js';
import { AI_QUEUES } from '../workers/queue.constants.js';
import { ToolRegistry } from './tools/tool.registry.js';
import { AI_TOOLS } from './tools/tool.interface.js';
import { GenerateSiteTool } from './tools/implementations/generate-site.tool.js';
import { GenerateCmsTool } from './tools/implementations/generate-cms.tool.js';
import { AnalyzeCvTool } from './tools/implementations/analyze-cv.tool.js';
import { StartInterviewTool } from './tools/implementations/start-interview.tool.js';
import { CareerCoachingTool } from './tools/implementations/career-coaching.tool.js';
import { GenerateComponentTool } from './tools/implementations/generate-component.tool.js';
import { GeneratePageTool } from './tools/implementations/generate-page.tool.js';
import { CvAnalysisPipelineTool } from '../pipeline/tools/cv-analysis-pipeline.tool.js';
import { SiteBuilderPipelineTool } from '../pipeline/tools/site-builder-pipeline.tool.js';
import { UiAgentService } from './modes/ui-agent.service.js';

const TOOL_PROVIDERS = [
  // Direct service tools
  GenerateSiteTool,
  GenerateCmsTool,
  AnalyzeCvTool,
  StartInterviewTool,
  CareerCoachingTool,
  // UI design tools
  GenerateComponentTool,
  GeneratePageTool,
  // Pipeline tools (multi-step, more intelligent)
  CvAnalysisPipelineTool,
  SiteBuilderPipelineTool,
];

@Module({
  imports: [
    GeminiModule,
    GenerationModule,
    RecruitmentModule,
    PipelineModule,
    BullModule.registerQueue({ name: AI_QUEUES.AGENT_TASKS }),
  ],
  controllers: [AgentController],
  providers: [
    ...TOOL_PROVIDERS,
    {
      provide: AI_TOOLS,
      useFactory: (...tools) => tools,
      inject: TOOL_PROVIDERS,
    },
    ToolRegistry,
    AgentService,
    PlannerService,
    UiAgentService,
  ],
  exports: [AgentService, ToolRegistry, PlannerService, UiAgentService],
})
export class AgentModule {}
