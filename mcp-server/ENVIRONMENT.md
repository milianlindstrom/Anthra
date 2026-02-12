# Environment Configuration Guide

## Environment Variables

The MCP server uses environment variables for configuration. These can be set via:

1. `.env` file in `mcp-server/` directory
2. System environment variables
3. Claude Desktop config (for AI integration)
4. Docker environment variables

## Variables Reference

### ANTHRA_API_URL (Required)

The URL where the Anthra UI/API is running.

**Default:** `http://localhost:3000`

**Examples:**

```bash
# Local development
ANTHRA_API_URL=http://localhost:3000

# Custom port
ANTHRA_API_URL=http://localhost:8080

# Remote server
ANTHRA_API_URL=http://192.168.1.100:3000

# Production domain
ANTHRA_API_URL=https://anthra.example.com
```

**Important:**
- Must include protocol (`http://` or `https://`)
- No trailing slash
- Must be accessible from where MCP server runs

### MCP_SERVER_PORT (Optional)

Port for HTTP mode (not used in stdio mode with Claude).

**Default:** `3001`

**Examples:**

```bash
MCP_SERVER_PORT=3001
MCP_SERVER_PORT=8080
```

## Configuration Methods

### Method 1: .env File (Recommended for Development)

Create `mcp-server/.env`:

```env
ANTHRA_API_URL=http://localhost:3000
MCP_SERVER_PORT=3001
```

Then run:
```bash
npm run dev
```

### Method 2: Environment Variables (Shell)

**Bash/Zsh:**
```bash
export ANTHRA_API_URL=http://localhost:3000
npm run dev
```

**Fish:**
```fish
set -x ANTHRA_API_URL http://localhost:3000
npm run dev
```

**Windows CMD:**
```cmd
set ANTHRA_API_URL=http://localhost:3000
npm run dev
```

**Windows PowerShell:**
```powershell
$env:ANTHRA_API_URL="http://localhost:3000"
npm run dev
```

### Method 3: Claude Desktop Config

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "anthra": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "ANTHRA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Method 4: Docker Compose

In `docker-compose.yml`:

```yaml
services:
  anthra-mcp:
    environment:
      - ANTHRA_API_URL=http://anthra-ui:3000
      - MCP_SERVER_PORT=3001
```

## Common Scenarios

### Scenario 1: All on Same Machine

```env
ANTHRA_API_URL=http://localhost:3000
```

This is the default and works when:
- Anthra UI on port 3000
- MCP server running on same machine
- Claude Desktop on same machine

### Scenario 2: Anthra on Remote Server

```env
ANTHRA_API_URL=http://192.168.1.50:3000
```

When:
- Anthra UI on another machine
- MCP server connects over network
- Claude Desktop on your local machine

### Scenario 3: Custom Port

```env
ANTHRA_API_URL=http://localhost:8080
```

When:
- Anthra UI running on non-standard port
- Useful for development with multiple apps

### Scenario 4: Production with SSL

```env
ANTHRA_API_URL=https://tasks.company.com
```

When:
- Anthra deployed with HTTPS
- Domain name configured
- SSL certificate installed

### Scenario 5: Docker Compose

```env
ANTHRA_API_URL=http://anthra-ui:3000
```

When using Docker Compose:
- Service-to-service communication
- Uses Docker network names
- Not localhost!

## Validation

The MCP server validates configuration on startup:

```
[Config] Anthra API URL: http://localhost:3000
[Config] MCP Server Port: 3001
```

If configuration is invalid, you'll see an error:
```
Error: ANTHRA_API_URL is required
```

## Testing Configuration

### Test 1: API Reachability

```bash
curl $ANTHRA_API_URL/api/tasks
```

Should return JSON array of tasks.

### Test 2: MCP Server Startup

```bash
cd mcp-server
ANTHRA_API_URL=http://localhost:3000 node dist/index.js
```

Should show:
```
[MCP] Starting Anthra MCP Server...
[Config] Anthra API URL: http://localhost:3000
[MCP] Server started successfully
```

### Test 3: Full Integration

With MCP server connected to Claude Desktop:

Ask Claude: "List my projects"

Claude should successfully call the API.

## Security Considerations

### Development

```env
# OK for local development
ANTHRA_API_URL=http://localhost:3000
```

### Production

```env
# Use HTTPS in production
ANTHRA_API_URL=https://anthra.example.com

# Consider authentication headers (future enhancement)
# ANTHRA_API_KEY=your-secret-key
```

**Important:**
- Never commit `.env` files to git
- Use `.env.example` for templates
- Use environment variables in production
- Consider API authentication for production use

## Environment Variable Precedence

Order of priority (highest to lowest):

1. Command line environment variables
2. `.env` file
3. System environment variables
4. Default values in code

Example:
```bash
# .env file has: ANTHRA_API_URL=http://localhost:3000
# But command line overrides:
ANTHRA_API_URL=http://localhost:8080 npm run dev
# Result: Uses http://localhost:8080
```

## Troubleshooting

### Error: "Failed to connect to API"

**Check:**
1. Is `ANTHRA_API_URL` set correctly?
   ```bash
   echo $ANTHRA_API_URL
   ```

2. Is Anthra UI running?
   ```bash
   curl $ANTHRA_API_URL/api/tasks
   ```

3. Firewall/network issues?
   ```bash
   ping hostname
   telnet hostname 3000
   ```

### Error: "ANTHRA_API_URL is required"

**Solution:**
Set the environment variable before running:
```bash
export ANTHRA_API_URL=http://localhost:3000
```

Or create `.env` file.

### Error: "Cannot reach localhost"

**Common in Docker:**
Use `host.docker.internal` instead of `localhost`:
```env
ANTHRA_API_URL=http://host.docker.internal:3000
```

**Or use Docker network:**
```env
ANTHRA_API_URL=http://anthra-ui:3000
```

## Advanced Configuration

### Multiple Environments

Create separate env files:

```bash
# .env.development
ANTHRA_API_URL=http://localhost:3000

# .env.production
ANTHRA_API_URL=https://anthra.company.com
```

Load with:
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start
```

### Dynamic Configuration

For advanced use cases, modify `mcp-server/src/config.ts`:

```typescript
export const CONFIG = {
  ANTHRA_API_URL: process.env.ANTHRA_API_URL || detectApiUrl(),
  MCP_SERVER_PORT: parseInt(process.env.MCP_SERVER_PORT || '3001', 10),
};

function detectApiUrl() {
  // Custom logic to detect API URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://anthra.company.com';
  }
  return 'http://localhost:3000';
}
```

## Environment Files to Git

**DO commit:**
- `.env.example` - Template for users
- `ENVIRONMENT.md` - This documentation

**DON'T commit:**
- `.env` - Contains secrets/local config
- `.env.local`
- `.env.*.local`

Add to `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
```

## Need Help?

- Review [MCP Server README](README.md)
- Check [Claude Integration Guide](../CLAUDE_INTEGRATION.md)
- Test API connectivity with `curl`
- Check MCP server logs for configuration output
