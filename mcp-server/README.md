# Anthra MCP Server

Model Context Protocol server for AI integration with Anthra task management system.

## Overview

The Anthra MCP Server provides AI assistants (like Claude, ChatGPT, or Open WebUI) with direct access to your Anthra task management system. Through the MCP protocol, AI assistants can:

- Create, read, update, and delete tasks
- Manage projects
- Get intelligent task recommendations
- Analyze project health
- Generate task breakdowns

## Quick Start

### Prerequisites

- Node.js 20+ installed
- Anthra UI running on `http://localhost:3000` (or configure custom URL)
- **Note**: Anthra now requires user authentication. You'll need to create an account and login before using the MCP server.

### Installation

```bash
cd mcp-server
npm install
```

### Development Mode

```bash
npm run dev
```

The server will start in watch mode and automatically reload on file changes.

### Production Build

```bash
npm run build
npm start
```

## Configuration

Create a `.env` file in the `mcp-server/` directory:

```env
ANTHRA_API_URL=http://localhost:3000
MCP_SERVER_PORT=3001
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHRA_API_URL` | URL of the Anthra API server | `http://localhost:3000` |
| `MCP_SERVER_PORT` | Port for HTTP mode (optional) | `3001` |

## Available Tools

### Task Management (7 tools)

#### `create_task`
Create a new task in Anthra.

**Parameters:**
- `title` (required): Task title
- `description`: Task description
- `project_id` (required): Project ID
- `priority`: `low` | `medium` | `high`
- `status`: `backlog` | `todo` | `in-progress` | `review` | `done`
- `start_date`: ISO date string
- `due_date`: ISO date string
- `estimated_hours`: Number of hours

**Example:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "project_id": "clx123456",
  "priority": "high",
  "status": "todo",
  "estimated_hours": 8
}
```

#### `list_tasks`
List tasks with optional filters.

**Parameters:**
- `project_id`: Filter by project
- `status`: Filter by status
- `priority`: Filter by priority
- `archived`: Include archived tasks

#### `get_task`
Get detailed information about a specific task.

**Parameters:**
- `task_id` (required): Task ID

#### `update_task`
Update any fields of an existing task.

**Parameters:**
- `task_id` (required): Task ID
- Any task fields to update

#### `delete_task`
Delete a task permanently.

**Parameters:**
- `task_id` (required): Task ID

#### `move_task_status`
Move a task to a different status column.

**Parameters:**
- `task_id` (required): Task ID
- `new_status` (required): New status value

#### `bulk_update_tasks`
Update multiple tasks at once.

**Parameters:**
- `task_ids` (required): Array of task IDs
- `updates` (required): Object with fields to update

### Project Management (4 tools)

#### `list_projects`
List all projects.

**Parameters:**
- `include_archived`: Include archived projects (default: false)

#### `create_project`
Create a new project workspace.

**Parameters:**
- `name` (required): Project name
- `description`: Project description
- `color`: Hex color code (default: #6366f1)
- `icon`: Emoji icon (default: 📁)

#### `get_project`
Get detailed information about a project.

**Parameters:**
- `project_id` (required): Project ID

#### `update_project`
Update project details.

**Parameters:**
- `project_id` (required): Project ID
- Any project fields to update

### Analytics & Smart Tools (4 tools)

#### `get_task_summary`
Get comprehensive task statistics.

**Parameters:**
- `project_id`: Filter by project (optional)

**Returns:**
- Total task count
- Breakdown by status
- Breakdown by priority
- Total estimated hours
- Overdue count
- Tasks due soon (next 7 days)

#### `what_should_i_work_on`
Get AI-curated task recommendations.

**Parameters:**
- `available_hours`: How many hours you have
- `priority_filter`: Filter by priority
- `project_id`: Filter by project

**Returns:** 2-3 recommended tasks with reasoning based on:
- Overdue tasks (highest priority)
- Tasks due within 24 hours
- High priority tasks
- Tasks already in progress
- Available time vs estimated hours

#### `analyze_project_health`
Analyze project health metrics.

**Parameters:**
- `project_id` (required): Project ID

**Returns:**
- Completion rate
- Overdue count
- Average task age
- Potentially blocked tasks
- Velocity (tasks completed last week)
- Health score: `healthy` | `at-risk` | `critical`

#### `suggest_task_breakdown`
Suggest how to break down a complex task.

**Parameters:**
- `task_id` (required): Task ID

**Returns:** Suggestions for breaking the task into smaller subtasks based on:
- Estimated hours (aims for 4-hour chunks)
- Task description length
- General breakdown strategies

## Integration Examples

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": ["/absolute/path/to/anthra/mcp-server/dist/index.js"],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**macOS/Linux:** `~/.config/claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

After configuration, restart Claude Desktop. The Anthra tools will appear in the tools menu.

### Open WebUI

1. Go to Settings → Connections → MCP Servers
2. Add new server:
   - **Name:** Anthra
   - **Command:** `node`
   - **Args:** `/absolute/path/to/anthra/mcp-server/dist/index.js`
   - **Environment Variables:**
     - `ANTHRA_API_URL=http://localhost:3000`
3. Save and restart Open WebUI

### Cline (VS Code)

Add to Cline MCP settings:

```json
{
  "anthra": {
    "command": "node",
    "args": ["/absolute/path/to/anthra/mcp-server/dist/index.js"],
    "env": {
      "ANTHRA_API_URL": "http://localhost:3000"
    }
  }
}
```

## Usage Examples

### With Claude Desktop

> **You:** What should I work on today? I have about 4 hours.

Claude will use the `what_should_i_work_on` tool to analyze your tasks and provide intelligent recommendations.

> **You:** Show me all high-priority tasks in the Clyqra project

Claude will use `list_tasks` with appropriate filters.

> **You:** Create a new task called "Implement dark mode" in the Frontend project with high priority

Claude will use `create_project` (if needed) and `create_task` to add it to your system.

> **You:** How is the Backend project doing?

Claude will use `analyze_project_health` to give you detailed metrics and recommendations.

## Development

### Project Structure

```
mcp-server/
├── src/
│   ├── index.ts           # Server entry point
│   ├── config.ts          # Configuration management
│   └── tools/
│       ├── tasks.ts       # Task management tools
│       ├── projects.ts    # Project management tools
│       └── analytics.ts   # Analytics & smart tools
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

```bash
npm run dev        # Watch mode with auto-reload
npm run build      # Build TypeScript to dist/
npm start          # Run built version
npm run typecheck  # Check types without building
```

### Adding New Tools

1. Add tool definition to appropriate file in `src/tools/`
2. Implement handler function
3. Export from the tools module
4. Tool will automatically be registered in `src/index.ts`

Example:

```typescript
export const myTools = [
  {
    name: 'my_new_tool',
    description: 'Does something useful',
    inputSchema: {
      type: 'object',
      properties: {
        param: { type: 'string' }
      },
      required: ['param']
    }
  }
];

export async function handleMyTool(name: string, args: any) {
  // Implementation
}
```

## Troubleshooting

### Server won't start

- Check that Node.js 20+ is installed: `node --version`
- Ensure dependencies are installed: `npm install`
- Verify Anthra UI is running on the configured URL

### Tools not appearing in Claude Desktop

- Verify the path in `claude_desktop_config.json` is absolute
- Check Claude Desktop logs for errors
- Restart Claude Desktop after configuration changes

### "Failed to connect to API" errors

- Ensure `ANTHRA_API_URL` is correct
- Verify Anthra UI is running: `curl http://localhost:3000/api/tasks`
- Check for network/firewall issues

### TypeScript errors

Run type checking:
```bash
npm run typecheck
```

## Architecture

The MCP server acts as a bridge between AI assistants and the Anthra API:

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│             │  stdio  │              │  HTTP   │            │
│  AI Client  │ ◄─────► │  MCP Server  │ ◄─────► │  Anthra API │
│  (Claude)   │         │              │         │   (Next.js)│
└─────────────┘         └──────────────┘         └────────────┘
```

1. AI client communicates with MCP server via stdio (standard input/output)
2. MCP server translates requests to HTTP calls to Anthra API
3. Responses are formatted and sent back to AI client

## Contributing

Contributions welcome! Please:

1. Follow the existing code style
2. Add tests for new tools
3. Update documentation
4. Test integration with at least one AI client

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review MCP protocol spec: https://modelcontextprotocol.io
