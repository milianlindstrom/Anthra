# Anthra Database Backup Routine

## 🎯 Purpose

This document describes the backup routine to prevent data loss and ensure you can always restore your Anthra tasks and projects.

## 📁 Backup Location

All backups are stored in: `prisma/backups/`

## 🔄 Backup Types

### 1. Automatic Backups (Every 6 Hours)

- **Frequency**: Every 6 hours (00:00, 06:00, 12:00, 18:00)
- **Rotation**: Keeps last 5 backups
- **Location**: `prisma/backups/anthra-db-YYYYMMDD-HHMMSS.db`
- **Log File**: `/home/milian/Ulrik/backup.log`

### 2. Manual Backups

Run anytime:
```bash
./backup_database.sh
```

### 3. Before Major Changes

Always backup before:
- Schema migrations
- Major updates
- Experimental changes

```bash
# Create a named backup
cp prisma/dev.db prisma/backups/anthra-db-before-migration-$(date +%Y%m%d).db
```

## 🛠️ Backup Scripts

### `backup_database.sh`
- Creates timestamped backup
- Rotates old backups (keeps last 5)
- Logs backup creation

### `setup_cron_backups.sh`
- Sets up automatic cron job
- Configures 6-hour backup schedule

## 🔧 Restoration

### Restore from Backup

```bash
# 1. Stop the application
docker compose down

# 2. Restore backup
cp prisma/backups/anthra-db-YYYYMMDD-HHMMSS.db prisma/dev.db

# 3. Restart application
docker compose up -d
```

### Emergency Restoration

If the database is corrupted:

```bash
# Find the most recent backup
ls -t prisma/backups/anthra-db-*.db | head -1

# Restore it
cp $(ls -t prisma/backups/anthra-db-*.db | head -1) prisma/dev.db

# Restart
docker compose restart anthra-ui
```

## 📊 Backup Verification

### Check Backup Integrity

```bash
# List all backups
ls -lh prisma/backups/

# Check backup size (should be ~316KB with data)
du -h prisma/backups/anthra-db-*.db
```

### Test Backup Restoration

```bash
# Test restore to a temporary file
cp prisma/backups/anthra-db-YYYYMMDD-HHMMSS.db prisma/test-restore.db

# Verify it works (requires node environment)
node -e "const {PrismaClient}=require('@prisma/client');new PrismaClient({datasourceUrl:'file:./prisma/test-restore.db'}).project.findMany().then(p=>console.log('Projects:',p.length)).catch(console.error)"
```

## 🎯 Best Practices

### 1. **Before Any Major Operation**
```bash
# Always backup before schema changes, migrations, or updates
./backup_database.sh
```

### 2. **After Important Work**
```bash
# Backup after adding many tasks or completing major work
./backup_database.sh
```

### 3. **Regular Verification**
```bash
# Check backups exist and have reasonable sizes
ls -lh prisma/backups/
```

### 4. **Off-Site Backups**
```bash
# Copy backups to cloud storage or another machine
rsync -avz prisma/backups/ user@backup-server:/path/to/backups/
```

## 🚨 Disaster Recovery

### If Database is Corrupted

1. **Don't panic** - your data is in backups
2. **Stop the application** immediately
3. **Restore from most recent backup**
4. **Verify data integrity**
5. **Restart application**

### If All Backups Are Lost

1. **Check git history** for any committed data
2. **Check other machines** where you might have run Anthra
3. **Recreate from memory** (last resort)

## 📅 Maintenance

### Monthly Backup Health Check

```bash
# 1. Verify backup count
echo "Backup count: $(ls prisma/backups/anthra-db-*.db | wc -l)"

# 2. Check backup sizes
echo "Backup sizes:"
ls -lh prisma/backups/anthra-db-*.db

# 3. Test restore from oldest backup
# (See restoration section above)
```

### Quarterly Full Backup

```bash
# Create a compressed archive of everything
zip -r anthra-full-backup-$(date +%Y%m%d).zip prisma/backups/ prisma/dev.db .env docker-compose.yml
```

## 🔗 Related Files

- `backup_database.sh` - Main backup script
- `setup_cron_backups.sh` - Cron job setup
- `switch_database.sh` - Database switcher
- `prisma/backups/` - Backup storage directory

## 💡 Pro Tips

1. **Test restores periodically** - Make sure backups actually work
2. **Store backups in multiple locations** - Local + cloud
3. **Document major changes** - Keep notes when you make big updates
4. **Use meaningful names** for manual backups (e.g., `before-migration.db`)
5. **Check logs** - Monitor `backup.log` for any issues

## 🎉 Commit Message Suggestion

When committing your rebuilt data:
```
git commit -m "The big forgot-to-commit commit"
```

This acknowledges the lesson learned while moving forward!
