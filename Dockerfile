# Multi-stage build for Next.js application
FROM node:20 AS base

# Install dependencies only when needed
FROM base AS deps

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure logo is in public folder (must be done before build)
RUN mkdir -p public && \
    if [ -f anthralogo.svg ]; then \
      cp anthralogo.svg public/anthralogo.svg && \
      echo "Logo copied to public folder"; \
    else \
      echo "Warning: Logo file not found"; \
    fi && \
    ls -la public/ || echo "Public folder created"

# Generate Prisma Client with DATABASE_URL from build args
ARG DATABASE_URL
RUN DATABASE_URL="$DATABASE_URL" npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Verify public folder contents before switching user
RUN ls -la public/ && echo "Public folder verified"

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
