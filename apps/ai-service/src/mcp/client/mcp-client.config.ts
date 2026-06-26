/**
 * Configuration for connecting to an external MCP server.
 *
 * Set via env var MCP_SERVERS as JSON array:
 * MCP_SERVERS='[{"name":"example","transport":"streamable-http","url":"http://localhost:3001/mcp"}]'
 */
export interface McpServerConfig {
  /** Unique name to identify this server */
  name: string;
  /** Transport type */
  transport: 'stdio' | 'streamable-http';
  /** For stdio: command to execute */
  command?: string;
  /** For stdio: command arguments */
  args?: string[];
  /** For streamable-http: server URL */
  url?: string;
  /** Environment variables to pass (stdio only) */
  env?: Record<string, string>;
}
