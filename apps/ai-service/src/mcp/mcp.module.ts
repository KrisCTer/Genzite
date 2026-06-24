import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from '../agent/agent.module.js';
import { McpServerService } from './server/mcp-server.service.js';
import { McpServerController } from './server/mcp-server.controller.js';
import { McpClientService } from './client/mcp-client.service.js';

@Module({
  imports: [ConfigModule, AgentModule],
  controllers: [McpServerController],
  providers: [McpServerService, McpClientService],
  exports: [McpServerService, McpClientService],
})
export class McpModule {}
