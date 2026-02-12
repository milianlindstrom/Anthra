#!/bin/bash

# Automatic Database Backup Script for Anthra
# This script creates rotating backups to prevent filling up disk space

BACKUP_DIR="prisma/backups"
MAX_BACKUPS=5  # Keep last 5 backups
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/anthra-db-$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "💾 Creating database backup..."
echo "Source: prisma/dev.db"
echo "Backup: $BACKUP_FILE"

# Copy the database
cp prisma/dev.db "$BACKUP_FILE"

# Verify the backup
echo "✅ Backup created: $(ls -lh "$BACKUP_FILE")"

# Clean up old backups (keep only the most recent $MAX_BACKUPS)
echo "🧹 Cleaning up old backups..."
ls -t "$BACKUP_DIR"/anthra-db-*.db | tail -n +$((MAX_BACKUPS + 1)) | xargs -I {} rm -f "{}"

echo "📊 Current backups:"
ls -lh "$BACKUP_DIR"/anthra-db-*.db | tail -n $MAX_BACKUPS

echo "✨ Backup complete!"
