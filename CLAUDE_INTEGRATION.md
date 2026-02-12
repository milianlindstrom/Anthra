# Integrating Anthra with Claude Desktop

This guide walks you through connecting the Anthra MCP server to Claude Desktop for AI-powered task management.

## Prerequisites

1. ✅ Anthra UI running on `http://localhost:3000`
2. ✅ Claude Desktop installed ([download here](https://claude.ai/download))
3. ✅ Node.js 20+ installed

## Step 1: Build the MCP Server

```bash
cd mcp-server
npm install
npm run build
```

This creates the compiled JavaScript in `mcp-server/dist/`.

## Step 2: Locate Claude Desktop Config File

The config file location depends on your OS:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

If the file doesn't exist, create it.

## Step 3: Add Anthra MCP Server

Open the config file and add the Anthra server configuration:

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": [
        "/absolute/path/to/anthra/mcp-server/dist/index.js"
      ],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/anthra` with the actual absolute path to your Anthra installation.

### Finding Your Absolute Path

**macOS/Linux:**
```bash
cd /path/to/anthra
pwd
```

**Windows PowerShell:**
```powershell
cd C:\path\to\anthra
(Get-Location).Path
```

### Example Configuration

**macOS:**
```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": [
        "/Users/john/Projects/anthra/mcp-server/dist/index.js"
      ],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": [
        "C:\\Users\\John\\Projects\\anthra\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

Close Claude Desktop completely and reopen it. The MCP server will automatically connect on startup.

## Step 5: Verify Connection

In Claude Desktop, look for the 🔌 tools icon. Click it to see available tools. You should see:

- ✅ 7 task management tools
- ✅ 4 project management tools
- ✅ 4 analytics tools

## Step 6: Try It Out!

Start a conversation with Claude:

> **You:** "What projects do I have in Anthra?"

Claude will use the `list_projects` tool to fetch your projects.

> **You:** "What should I work on today? I have 4 hours available."

Claude will use `what_should_i_work_on` to give you personalized recommendations.

> **You:** "Create a task called 'Fix login bug' in the Backend project with high priority"

Claude will use `create_task` to add it to your system.

## Advanced Configuration

### Custom API URL

If your Anthra UI is running on a different port or host:

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": ["/absolute/path/to/anthra/mcp-server/dist/index.js"],
      "env": {
        "ANTHRA_API_URL": "http://192.168.1.100:3000"
      }
    }
  }
}
```

### Running Over Network

If Anthra is on another machine:

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": ["/absolute/path/to/anthra/mcp-server/dist/index.js"],
      "env": {
        "ANTHRA_API_URL": "http://your-server-ip:3000"
      }
    }
  }
}
```

## Troubleshooting

### Tools Not Showing Up

1. **Check the logs**: View Claude Desktop logs
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`
   - Linux: `~/.config/claude/logs/`

2. **Verify the path**: Make sure the path to `index.js` is absolute and correct

3. **Test the build**: Run manually to check for errors:
   ```bash
   cd mcp-server
   node dist/index.js
   ```

### "Failed to Connect" Errors

1. **Check Anthra is running**: 
   ```bash
   curl http://localhost:3000/api/tasks
   ```

2. **Verify Node version**:
   ```bash
   node --version  # Should be 20+
   ```

3. **Check environment variables**: Ensure `ANTHRA_API_URL` matches where Anthra is running

### Permission Errors

On macOS/Linux, ensure the script is executable:
```bash
chmod +x mcp-server/dist/index.js
```

### Network Connection Issues

If Anthra UI and Claude are on the same machine but connection fails:

1. Try `127.0.0.1` instead of `localhost`:
   ```json
   "ANTHRA_API_URL": "http://127.0.0.1:3000"
   ```

2. Check firewall settings

3. Ensure no VPN is interfering

## Example Conversations

### Project Management

> **You:** "Show me all my projects"  
> **Claude:** *Uses `list_projects` and shows your projects*

> **You:** "Create a new project called 'Mobile App' with a 📱 icon"  
> **Claude:** *Uses `create_project`*

### Task Management

> **You:** "List all high priority tasks"  
> **Claude:** *Uses `list_tasks` with priority filter*

> **You:** "Move task abc123 to in-progress"  
> **Claude:** *Uses `move_task_status`*

### Smart Analytics

> **You:** "How is the Frontend project doing?"  
> **Claude:** *Uses `analyze_project_health` and provides detailed metrics*

> **You:** "What should I focus on?"  
> **Claude:** *Uses `what_should_i_work_on` and recommends tasks*

### Bulk Operations

> **You:** "Set all backlog tasks in Project X to todo status"  
> **Claude:** *Uses `list_tasks` + `bulk_update_tasks`*

## Tips for Best Results

1. **Be specific**: Include project names and priorities when creating tasks
2. **Use natural language**: Claude understands conversational requests
3. **Ask for analysis**: Claude can interpret the data and provide insights
4. **Combine operations**: Ask Claude to create multiple related tasks at once

## Next Steps

- Try the analytics tools for project insights
- Use Claude to help plan your work schedule
- Let Claude break down large tasks into subtasks
- Ask Claude to analyze overdue tasks and suggest priorities

## Getting Help

- MCP Server Documentation: [mcp-server/README.md](mcp-server/README.md)
- Main README: [README.md](README.md)
- Claude Desktop Support: https://support.anthropic.com
- MCP Protocol: https://modelcontextprotocol.io
