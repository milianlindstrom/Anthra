#!/bin/bash

# Setup Cron Job for Automatic Database Backups

echo "🕐 Setting up automatic database backups..."

# Add cron job (runs every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * /bin/bash /home/milian/Ulrik/backup_database.sh >> /home/milian/Ulrik/backup.log 2>&1") | crontab -

echo "✅ Cron job added!"
echo "📅 Backup schedule: Every 6 hours"
echo "📄 Log file: /home/milian/Ulrik/backup.log"

echo "📊 Current cron jobs:"
crontab -l | grep -v "^#"
