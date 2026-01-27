FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY mcp-server/package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy shared types
COPY shared /app/shared

# Copy source code
COPY mcp-server/src ./src
COPY mcp-server/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY mcp-server/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose MCP server port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
