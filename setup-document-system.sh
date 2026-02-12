#!/bin/bash

# Setup script for Anthra Document System
# Run this after pulling the latest changes

set -e

echo "🚀 Setting up Anthra Document System..."

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ Error: prisma/schema.prisma not found. Are you in the project root?"
  exit 1
fi

echo "📦 Pushing Prisma schema to database..."
npx prisma db push

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🏗️  Building MCP server..."
cd mcp-server
npm run build
cd ..

echo "✅ Document system setup complete!"
echo ""
echo "Next steps:"
echo "1. Rebuild containers: docker compose build"
echo "2. Start containers: docker compose up -d"
echo "3. Navigate to /documents in the UI to test"
echo ""
echo "See DOCUMENT_SYSTEM_README.md for usage examples."
