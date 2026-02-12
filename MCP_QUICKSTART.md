# MCP Quick Start Guide

Get your Anthra MCP server running with AI assistants in 5 minutes.

## 1. Start Anthra UI

```bash
./start-dev.sh
```

Verify it's running: http://localhost:3000

## 2. Build MCP Server

```bash
cd mcp-server
npm install
npm run build
```

## 3. Test MCP Server

```bash
export ANTHRA_API_URL=http://localhost:3000
node dist/index.js
```

You should see:
```
[MCP] Starting Anthra MCP Server...
[Config] Anthra API URL: http://localhost:3000
[MCP] Server started successfully
```

Press Ctrl+C to stop.

## 4. Connect to Claude Desktop

### Find Your Full Path

```bash
cd mcp-server
pwd
```

Copy the output (example: `/Users/you/anthra/mcp-server`)

### Edit Claude Config

**macOS/Linux**: `~/.config/claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this (replace with your path):

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": ["/YOUR/PATH/anthra/mcp-server/dist/index.js"],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Restart Claude

Close and reopen Claude Desktop completely.

## 5. Test It!

In Claude Desktop, try:

> "What projects do I have in Anthra?"

Claude should list your projects using the MCP tools.

## Quick Commands to Try

```
"What should I work on today?"
"Show all high priority tasks"
"Create a task: Fix bug in login"
"How is the Frontend project doing?"
"Break down the API development task"
```

## Troubleshooting

**Tools don't show up?**
- Check path is absolute (starts with `/` or `C:\`)
- Verify Anthra UI is running on port 3000
- Check Claude logs in `~/Library/Logs/Claude/`

**Connection errors?**
```bash
# Test API is reachable
curl http://localhost:3000/api/tasks

# Test MCP server manually
cd mcp-server
ANTHRA_API_URL=http://localhost:3000 node dist/index.js
```

**Need more help?**
- Full guide: [CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md)
- MCP docs: [mcp-server/README.md](mcp-server/README.md)

## What You Can Do Now

✅ Create and manage tasks through conversation  
✅ Get AI-powered task recommendations  
✅ Analyze project health automatically  
✅ Break down complex tasks with AI help  
✅ Manage multiple projects via natural language  

Enjoy AI-powered task management! 🚀
