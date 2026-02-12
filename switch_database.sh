#!/bin/bash

# Database Switcher Script for Anthra
# Usage: ./switch_database.sh [database_file_path]

echo "🔄 Anthra Database Switcher"
echo "=========================="

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a database file path"
    echo "Usage: $0 /path/to/your/database.db"
    echo ""
    echo "Available database files in prisma/:"
    ls -la prisma/*.db
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "❌ Error: Database file '$1' does not exist"
    exit 1
fi

echo "📋 Switching to database: $1"

# Stop the container
echo "🛑 Stopping anthra-ui container..."
docker compose down

# Backup current database
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "💾 Backing up current database to: prisma/backup-before-switch-$TIMESTAMP.db"
cp prisma/dev.db "prisma/backup-before-switch-$TIMESTAMP.db"

# Copy new database
echo "🔄 Copying new database file..."
cp "$1" prisma/dev.db

# Restart the container
echo "🚀 Restarting anthra-ui container..."
docker compose up -d

echo "✅ Database switch completed!"
echo "📊 New database info:"
ls -la prisma/dev.db
echo ""
echo "🔗 Access the application at: http://localhost:3000"
