#!/bin/bash

# Start the development server with proper environment variables
export DATABASE_URL="file:$(pwd)/prisma/dev.db"

echo "Starting Ulrik..."
echo "DATABASE_URL=$DATABASE_URL"

npm run dev
