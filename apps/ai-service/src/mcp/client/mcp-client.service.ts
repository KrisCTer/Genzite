import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import { ToolRegistry } from '../../agent/tools/tool.registry.js';
import type { AiTool } from '../../agent/tools/tool.interface.js';
import type { McpServerConfig } from './mcp-client.config.js';

interface ConnectedServer {
  client: Client;
  transport: StdioClientTransport | StreamableHTTPClientTransport;
  tools: string[];
}

/**
 * Convert a JSON Schema type to Gemini SchemaType.
 */
function jsonSchemaTypeToGemini(type: string): SchemaType {
  const map: Record<string, SchemaType> = {
    string: SchemaType.STRING,
    number: SchemaType.NUMBER,
    integer: SchemaType.INTEGER,
    boolean: SchemaType.BOOLEAN,
    object: SchemaType.OBJECT,
    array: SchemaType.ARRAY,
  };
  return map[type] ?? SchemaType.STRING;
}

/**
 * Convert JSON Schema to Gemini FunctionDeclaration parameters.
 */
function jsonSchemaToGemini(schema: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (schema.type) {
    result.type = jsonSchemaTypeToGemini(schema.type as string);
  }
  if (schema.description) {
    result.description = schema.description;
  }
  if (schema.properties && typeof schema.properties === 'object') {
    result.properties = {};
    for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
      (result.properties as Record<string, unknown>)[key] = jsonSchemaToGemini(
        value as Record<string, unknown>,
      );
    }
  }
  if (schema.required) {
    result.required = schema.required;
  }
  if (schema.items) {
    result.items = jsonSchemaToGemini(schema.items as Record<string, unknown>);
  }

  return result;
}

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpClientService.name);
  private readonly servers = new Map<string, ConnectedServer>();

  constructor(
    private readonly config: ConfigService,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async onModuleInit() {
    const serversJson = this.config.get<string>('MCP_SERVERS');
    if (!serversJson) {
      this.logger.log('No external MCP servers configured (MCP_SERVERS env not set)');
      return;
    }

    try {
      const configs: McpServerConfig[] = JSON.parse(serversJson);
      for (const serverConfig of configs) {
        await this.connect(serverConfig);
      }
    } catch (error) {
      this.logger.error(`Failed to parse MCP_SERVERS config: ${error}`);
    }
  }

  async connect(serverConfig: McpServerConfig): Promise<void> {
    this.logger.log(`Connecting to MCP server: ${serverConfig.name} (${serverConfig.transport})`);

    try {
      let transport: StdioClientTransport | StreamableHTTPClientTransport;

      if (serverConfig.transport === 'stdio') {
        if (!serverConfig.command) {
          throw new Error(`MCP server "${serverConfig.name}": stdio transport requires "command"`);
        }
        transport = new StdioClientTransport({
          command: serverConfig.command,
          args: serverConfig.args ?? [],
          env: serverConfig.env,
        });
      } else {
        if (!serverConfig.url) {
          throw new Error(`MCP server "${serverConfig.name}": streamable-http transport requires "url"`);
        }
        transport = new StreamableHTTPClientTransport(new URL(serverConfig.url));
      }

      const client = new Client({
        name: 'genzite-ai-client',
        version: '1.0.0',
      });

      await client.connect(transport);

      // List tools from the remote server
      const { tools } = await client.listTools();
      const toolNames: string[] = [];

      for (const remoteTool of tools) {
        const toolName = `mcp_${serverConfig.name}_${remoteTool.name}`;
        toolNames.push(toolName);

        // Create an AiTool wrapper for the remote tool
        const aiTool = this.createRemoteToolWrapper(
          client,
          remoteTool.name,
          toolName,
          remoteTool.description ?? `Remote tool from ${serverConfig.name}`,
          remoteTool.inputSchema as Record<string, unknown>,
        );

        this.toolRegistry.registerTool(aiTool);
      }

      this.servers.set(serverConfig.name, { client, transport, tools: toolNames });
      this.logger.log(
        `Connected to MCP server "${serverConfig.name}": ${tools.length} tools registered ` +
        `(${toolNames.join(', ')})`,
      );
    } catch (error) {
      this.logger.error(`Failed to connect to MCP server "${serverConfig.name}": ${error}`);
    }
  }

  /**
   * Create an AiTool wrapper for a remote MCP tool.
   * This allows the Agent to call external MCP tools via function calling.
   */
  private createRemoteToolWrapper(
    client: Client,
    remoteName: string,
    localName: string,
    description: string,
    inputSchema: Record<string, unknown>,
  ): AiTool {
    const declaration: FunctionDeclaration = {
      name: localName,
      description: `[External MCP] ${description}`,
      parameters: jsonSchemaToGemini(inputSchema) as unknown as FunctionDeclaration['parameters'],
    };

    return {
      declaration,
      execute: async (params: Record<string, unknown>) => {
        const result = await client.callTool({ name: remoteName, arguments: params });
        // MCP returns content array, extract text
        const textContent = (result.content as Array<{ type: string; text?: string }>)
          ?.filter((c) => c.type === 'text')
          .map((c) => c.text)
          .join('\n');

        try {
          return JSON.parse(textContent);
        } catch {
          return textContent;
        }
      },
    };
  }

  async callTool(serverName: string, toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const server = this.servers.get(serverName);
    if (!server) throw new NotFoundException(`MCP server not connected: ${serverName}`);

    const result = await server.client.callTool({ name: toolName, arguments: params });
    return result;
  }

  async listServers(): Promise<Array<{ name: string; tools: string[] }>> {
    return [...this.servers.entries()].map(([name, s]) => ({
      name,
      tools: s.tools,
    }));
  }

  async onModuleDestroy() {
    for (const [name, server] of this.servers) {
      try {
        await server.client.close();
        await server.transport.close();
        this.logger.log(`Disconnected from MCP server: ${name}`);
      } catch (error) {
        this.logger.error(`Error disconnecting from ${name}: ${error}`);
      }
    }
    this.servers.clear();
  }
}
