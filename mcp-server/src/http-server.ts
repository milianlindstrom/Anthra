#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { validateConfig } from './config.js';
import { taskTools, handleTaskTool } from './tools/tasks.js';
import { projectTools, handleProjectTool } from './tools/projects.js';
import { analyticsTools, handleAnalyticsTool } from './tools/analytics.js';

// Validate configuration
validateConfig();

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3001;

// Create MCP server
const server = new Server(
  {
    name: 'ulrik-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Combine all tools
const allTools = [...taskTools, ...projectTools, ...analyticsTools];

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`[MCP] Listing ${allTools.length} available tools`);
  return {
    tools: allTools,
  };
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`[MCP] Executing tool: ${name}`);
  console.error(`[MCP] Arguments:`, JSON.stringify(args, null, 2));

  try {
    // Route to appropriate handler
    if (name.startsWith('create_task') || name.startsWith('list_tasks') ||
        name.startsWith('get_task') || name.startsWith('update_task') ||
        name.startsWith('delete_task') || name.startsWith('move_task') ||
        name.startsWith('bulk_update_tasks')) {
      return await handleTaskTool(name, args);
    } else if (name.startsWith('list_projects') || name.startsWith('create_project') ||
               name.startsWith('get_project') || name.startsWith('update_project')) {
      return await handleProjectTool(name, args);
    } else if (name.startsWith('get_task_summary') || name.startsWith('what_should_i_work_on') ||
               name.startsWith('analyze_project_health') || name.startsWith('suggest_task_breakdown')) {
      return await handleAnalyticsTool(name, args);
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    console.error(`[MCP] Error executing tool ${name}:`, error.message);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// SSE endpoint for MCP
app.get('/sse', async (req, res) => {
  console.error('[MCP] New SSE connection');
  const transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

// Message endpoint
app.post('/messages', express.json(), async (req, res) => {
  // Handled by SSE transport
  res.status(200).end();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'ulrik-mcp' });
});

// Start server
app.listen(PORT, () => {
  console.error(`[MCP] HTTP server listening on :${PORT}`);
  console.error('[MCP] SSE endpoint: /sse');
  console.error('[MCP] Ready for Open WebUI connections');
});
