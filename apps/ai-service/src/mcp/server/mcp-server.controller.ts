import { Controller, Post, Req, Res } from '@nestjs/common';
import { McpServerService } from './mcp-server.service.js';
import type { Request, Response } from 'express';

@Controller('ai/mcp')
export class McpServerController {
  constructor(private readonly mcpServer: McpServerService) {}

  /**
   * MCP Streamable HTTP endpoint.
   * External AI clients (Claude, IDEs, etc.) connect here to use Genzite tools.
   */
  @Post()
  async handleMcp(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.mcpServer.handleRequest(req, res);
  }
}
