# AI Service (Port 3006)

The AI Service is the brain of the Genzite platform. Powered by Google Gemini and the Model Context Protocol (MCP), it provides a robust, multi-agent architecture capable of complex reasoning, tool execution, and dynamic UI generation.

## Architecture Highlights

The AI Service is structured into several advanced layers:

### 1. Multi-Agent System (Async Execution via BullMQ)
- **Tool-Calling Agent** (`POST /api/v1/ai/agent/chat`): Reactive, single-turn agent that uses Gemini Function Calling to execute internal tools (e.g., CV analysis, Site Generation, CMS creation).
- **Planning Agent** (`POST /api/v1/ai/agent/plan`): Advanced multi-step agent. It breaks complex goals into a structured execution plan (with dependencies), executes steps in order, and automatically re-plans if a step fails.
- **UI Design Agent** (`POST /api/v1/ai/agent/ui`): Specialized frontend architect. Uses deep UX psychology (Hick's Law, Fitts' Law), 8pt grid, and 60-30-10 color rules to generate production-ready React/TSX components and pages. Enforces anti-cliché rules (no bento grids, no default purple).

> **Note:** All Agent endpoints operate asynchronously. They immediately return an `HTTP 202 Accepted` with a `jobId`, while the actual AI execution runs securely in the background via BullMQ workers (`AgentWorker`, `CareerCoachingWorker`, `MockInterviewWorker`). The execution logs and states are persisted in the `AiTaskLog` database table.

### 2. Pipeline Engine
For predictable, sequential tasks, the AI Service uses a Pipeline Engine:
- **CvAnalysisPipeline**: A 5-step pipeline for parsing resumes, extracting skills, matching JDs, generating reports, and optionally saving to DB.
- **SiteBuilderPipeline**: A 4-step intelligent site builder.
Pipelines are wrapped as standard tools in the Tool Registry, allowing the Agents to trigger them dynamically.

### 3. Model Context Protocol (MCP) Integration
The service fully implements both MCP Server and Client sides, bridging internal capabilities with external tools:
- **MCP Server** (`POST /api/v1/ai/mcp`): Exposes all internal AI tools (Site Gen, Pipelines, UI Gen) to external AI clients (like Claude Desktop or IDE agents) via Streamable HTTP.
- **MCP Client**: Automatically connects to external MCP servers on startup. It dynamically translates remote tools into Gemini Function Declarations and registers them in the local Tool Registry.
  - **codebase-memory MCP**: Used for fast semantic code search and context scanning without consuming massive tokens.
  - **stitch MCP**: Used to pull in design component patterns and tokens to enhance the UI Design Agent.

## Environment Variables

See `.env.example` in this directory for MCP Server configuration.
Required global variables:
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `GEMINI_MODEL`: Default is `gemini-2.0-flash`.
- `MCP_SERVERS`: JSON array of external servers to connect to.

## Available Tools (Tool Registry)

The registry acts as the single source of truth for both Agents and the MCP Server.
- **Built-in Direct Tools**: `generate_site`, `generate_cms`, `analyze_cv`, `start_interview`, `career_coaching`
- **UI Tools**: `generate_ui_component`, `generate_ui_page`
- **Pipeline Tools**: `pipeline_cv_analysis`, `pipeline_build_site`
- **External Tools**: `mcp_codebase_*`, `mcp_stitch_*` (dynamically loaded via MCP Client)

## Development

```bash
# From the project root:
pnpm run dev:ai
```
