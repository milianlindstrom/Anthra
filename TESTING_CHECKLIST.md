# Anthra MCP Server - Testing Checklist

Use this checklist to verify your Anthra MCP server installation is working correctly.

## Pre-Installation Checks

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git repository cloned
- [ ] Terminal access available

## Installation Tests

### UI Installation

- [ ] Run `npm install` in root directory
- [ ] No errors during installation
- [ ] Run `npm run db:push`
- [ ] Database created at `prisma/dev.db`
- [ ] Run `npm run db:seed`
- [ ] Sample data loaded successfully

### MCP Server Installation

- [ ] Run `cd mcp-server && npm install`
- [ ] No errors during installation
- [ ] Run `npm run build`
- [ ] `dist/` directory created
- [ ] `dist/index.js` exists
- [ ] No TypeScript errors

## Functional Tests

### Test 1: UI Server

```bash
./start-dev.sh
```

**Expected Results:**
- [ ] Server starts without errors
- [ ] Accessible at http://localhost:3000
- [ ] Kanban board loads
- [ ] Tasks are visible
- [ ] Can create new task
- [ ] Can drag tasks between columns

**API Test:**
```bash
curl http://localhost:3000/api/tasks
```

- [ ] Returns JSON array
- [ ] Contains task objects
- [ ] Status code 200

### Test 2: MCP Server Build

```bash
cd mcp-server
npm run build
ls -la dist/
```

**Expected Results:**
- [ ] Build completes without errors
- [ ] `dist/index.js` exists
- [ ] `dist/index.d.ts` exists
- [ ] `dist/config.js` exists
- [ ] `dist/tools/` directory exists

### Test 3: MCP Server Startup

```bash
cd mcp-server
export ANTHRA_API_URL=http://localhost:3000
node dist/index.js
```

**Expected Output:**
```
[MCP] Starting Anthra MCP Server...
[Config] Anthra API URL: http://localhost:3000
[Config] MCP Server Port: 3001
[MCP] Server started successfully
[MCP] Ready to receive requests via stdio
```

**Checks:**
- [ ] No error messages
- [ ] Config values displayed correctly
- [ ] Server stays running (doesn't crash)
- [ ] Press Ctrl+C to stop

### Test 4: Type Checking

```bash
cd mcp-server
npm run typecheck
```

**Expected Results:**
- [ ] No TypeScript errors
- [ ] Type checking passes

### Test 5: Docker Build (Optional)

```bash
docker-compose build
```

**Expected Results:**
- [ ] Both services build successfully
- [ ] No build errors
- [ ] Images created

```bash
docker-compose up -d
```

**Checks:**
- [ ] Both containers start
- [ ] UI accessible at http://localhost:3000
- [ ] MCP server running (check logs)
- [ ] No crash loops

```bash
docker-compose logs anthra-mcp
```

- [ ] Shows MCP server startup messages
- [ ] No error messages

## Integration Tests

### Test 6: Claude Desktop Integration

**Prerequisites:**
- [ ] Claude Desktop installed
- [ ] MCP server built
- [ ] UI server running

**Steps:**

1. **Get absolute path:**
```bash
cd mcp-server
pwd
```
- [ ] Copied full path

2. **Edit config file:**

macOS/Linux: `~/.config/claude/claude_desktop_config.json`  
Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/anthra/mcp-server/dist/index.js"],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

- [ ] Config file edited
- [ ] Absolute path used (not relative)
- [ ] Path points to `dist/index.js`

3. **Restart Claude Desktop:**
- [ ] Closed Claude completely
- [ ] Reopened Claude

4. **Check tools:**
- [ ] Click tools icon (🔌)
- [ ] See "anthra" in tool list
- [ ] 15 tools listed

5. **Test basic query:**

Ask Claude: "List my projects in Anthra"

- [ ] Claude responds without error
- [ ] Shows project list
- [ ] Data matches Anthra UI

6. **Test task creation:**

Ask Claude: "Create a task called 'Test MCP integration' in any project with high priority"

- [ ] Claude creates task
- [ ] Returns task ID
- [ ] Task visible in Anthra UI
- [ ] Priority is high

7. **Test recommendations:**

Ask Claude: "What should I work on today?"

- [ ] Claude analyzes tasks
- [ ] Provides recommendations
- [ ] Reasoning is clear
- [ ] Suggestions are relevant

8. **Test analytics:**

Ask Claude: "How is my [project name] project doing?"

- [ ] Claude analyzes project
- [ ] Shows completion rate
- [ ] Shows overdue tasks
- [ ] Provides health score
- [ ] Gives recommendations

## API Tests

### Test 7: All Task Tools

Use Claude or test manually:

1. **create_task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "Testing MCP",
    "project_id": "YOUR_PROJECT_ID",
    "priority": "high",
    "status": "todo"
  }'
```
- [ ] Returns created task
- [ ] Task has ID
- [ ] Status code 201

2. **list_tasks:**
- [ ] Via Claude: "Show all tasks"
- [ ] Returns task list
- [ ] Includes recent test task

3. **get_task:**
- [ ] Via Claude: "Show details of task [ID]"
- [ ] Returns full task object
- [ ] All fields present

4. **update_task:**
- [ ] Via Claude: "Change task [ID] status to in-progress"
- [ ] Task updated
- [ ] Visible in UI

5. **move_task_status:**
- [ ] Via Claude: "Move task [ID] to done"
- [ ] Status changed
- [ ] Confirmed in UI

6. **delete_task:**
- [ ] Via Claude: "Delete task [ID]"
- [ ] Task deleted
- [ ] Gone from UI

7. **bulk_update_tasks:**
- [ ] Via Claude: "Set all backlog tasks to todo"
- [ ] Multiple tasks updated
- [ ] Changes visible

### Test 8: All Project Tools

1. **list_projects:**
- [ ] Via Claude: "List all projects"
- [ ] Returns all projects
- [ ] Shows task counts

2. **create_project:**
- [ ] Via Claude: "Create project 'Test Project'"
- [ ] Project created
- [ ] Has slug, color, icon

3. **get_project:**
- [ ] Via Claude: "Show project [ID] details"
- [ ] Returns project info
- [ ] Includes task count

4. **update_project:**
- [ ] Via Claude: "Update project [ID] color to #ff0000"
- [ ] Project updated
- [ ] Visible in UI

### Test 9: All Analytics Tools

1. **get_task_summary:**
- [ ] Via Claude: "Give me a task summary"
- [ ] Shows total tasks
- [ ] Breakdown by status
- [ ] Breakdown by priority
- [ ] Hours estimated
- [ ] Overdue count

2. **what_should_i_work_on:**
- [ ] Via Claude: "What should I work on? I have 3 hours"
- [ ] Returns 2-3 recommendations
- [ ] Includes reasoning
- [ ] Considers available time

3. **analyze_project_health:**
- [ ] Via Claude: "Analyze [project] health"
- [ ] Completion rate shown
- [ ] Overdue count shown
- [ ] Health score provided
- [ ] Recommendations given

4. **suggest_task_breakdown:**
- [ ] Via Claude: "Break down task [ID]"
- [ ] Provides suggestions
- [ ] Considers task size
- [ ] Offers alternatives

## Error Handling Tests

### Test 10: Error Scenarios

1. **Invalid task ID:**
- [ ] Ask Claude for non-existent task
- [ ] Returns clear error message
- [ ] Doesn't crash

2. **Missing required fields:**
- [ ] Try create task without title
- [ ] Error returned
- [ ] Error is descriptive

3. **Invalid project ID:**
- [ ] Create task with fake project_id
- [ ] Error returned
- [ ] Message is clear

4. **API server down:**
- [ ] Stop Anthra UI
- [ ] Try using MCP tools
- [ ] Connection error returned
- [ ] Doesn't crash server

5. **Network timeout:**
- [ ] Simulate slow network
- [ ] Request times out gracefully
- [ ] Error message is helpful

## Performance Tests

### Test 11: Load Testing

1. **Large task list:**
- [ ] Create 50+ tasks
- [ ] List tasks via Claude
- [ ] Response under 5 seconds
- [ ] No timeout errors

2. **Bulk operations:**
- [ ] Bulk update 20+ tasks
- [ ] Completes successfully
- [ ] Reports results correctly

3. **Complex queries:**
- [ ] Multi-filter list (project + status + priority)
- [ ] Returns correct results
- [ ] Response time acceptable

## Documentation Tests

### Test 12: Documentation Accuracy

- [ ] All commands in README work
- [ ] Environment variables documented correctly
- [ ] Tool schemas match implementation
- [ ] Examples produce expected results
- [ ] Links work (no 404s)
- [ ] Code samples are valid

## Security Tests

### Test 13: Security Checks

- [ ] `.env` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] API only accepts expected methods
- [ ] No SQL injection vulnerabilities
- [ ] Error messages don't leak sensitive info

## Final Verification

### Test 14: End-to-End Workflow

Complete this realistic workflow:

1. [ ] Ask Claude: "What projects do I have?"
2. [ ] Ask Claude: "Create a project 'Testing' with 🧪 icon"
3. [ ] Ask Claude: "Create 3 tasks in Testing project: Setup, Implementation, Testing"
4. [ ] Ask Claude: "What should I work on?"
5. [ ] Ask Claude: "Move the first task to in-progress"
6. [ ] Check Anthra UI - verify all changes
7. [ ] Ask Claude: "How is Testing project doing?"
8. [ ] Ask Claude: "Mark Setup task as done"
9. [ ] Verify in UI

**All steps completed without errors:** ✅

## Troubleshooting Reference

If tests fail, check:

1. **Node version:** Must be 20+
2. **UI running:** Must be on port 3000
3. **Absolute paths:** In Claude config
4. **Environment variables:** Set correctly
5. **Build artifacts:** `dist/` folder exists
6. **Network:** No firewall blocking
7. **Logs:** Check terminal output

## Test Results

Date: ___________  
Tester: ___________

### Summary

- Total Tests: 14
- Passed: ___ / 14
- Failed: ___ / 14
- Skipped: ___ / 14

### Issues Found

1. ________________________________
2. ________________________________
3. ________________________________

### Notes

_________________________________________________
_________________________________________________
_________________________________________________

---

**All tests passing? You're ready to use Anthra with AI! 🎉**
