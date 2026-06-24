import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { ToolRegistry } from '../../agent/tools/tool.registry.js';
import type { Request, Response } from 'express';

/**
 * Convert Gemini FunctionDeclaration parameters to JSON Schema.
 * Gemini uses SchemaType enum values (STRING, NUMBER, etc.),
 * JSON Schema uses lowercase strings ("string", "number", etc.).
 */
function geminiToJsonSchema(schema: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!schema) return { type: 'object', properties: {} };

  const result: Record<string, unknown> = {};

  if (schema.type) {
    result.type = (schema.type as string).toLowerCase();
  }
  if (schema.description) {
    result.description = schema.description;
  }
  if (schema.enum) {
    result.enum = schema.enum;
  }

  if (schema.properties && typeof schema.properties === 'object') {
    result.properties = {};
    for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
      (result.properties as Record<string, unknown>)[key] = geminiToJsonSchema(
        value as Record<string, unknown>,
      );
    }
  }

  if (schema.required) {
    result.required = schema.required;
  }
  if (schema.items) {
    result.items = geminiToJsonSchema(schema.items as Record<string, unknown>);
  }

  return result;
}

/**
 * Pre-computed tool definition for MCP server registration.
 */
interface McpToolDef {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

@Injectable()
export class McpServerService implements OnModuleInit {
  private readonly logger = new Logger(McpServerService.name);
  private toolDefs: McpToolDef[] = [];

  constructor(private readonly toolRegistry: ToolRegistry) {}

  onModuleInit() {
    const tools = this.toolRegistry.getAll();

    this.toolDefs = tools.map((tool) => ({
      name: tool.declaration.name,
      description: tool.declaration.description ?? '',
      schema: geminiToJsonSchema(tool.declaration.parameters as unknown as Record<string, unknown>),
      execute: (params: Record<string, unknown>) => tool.execute(params),
    }));

    this.logger.log(`MCP Server initialized with ${this.toolDefs.length} tools`);
  }

  /**
   * Create a fresh McpServer with all registered tools.
   * A new server is created per request for stateless mode.
   */
  private createServer(): McpServer {
    const server = new McpServer({
      name: 'genzite-ai',
      version: '1.0.0',
    });

    for (const def of this.toolDefs) {
      server.tool(def.name, def.description, def.schema, async (params) => {
        const result = await def.execute(params as Record<string, unknown>);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }

    return server;
  }

  /**
   * Handle an incoming MCP Streamable HTTP request.
   * Creates a stateless transport per request.
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    const server = this.createServer();

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      this.logger.error(`MCP request failed: ${error}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'MCP request processing failed' });
      }
    } finally {
      await transport.close();
      await server.close();
    }
  }
}
