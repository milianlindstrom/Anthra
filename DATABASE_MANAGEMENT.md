# Anthra Database Management

## Current Status

The application is currently using the database at `prisma/dev.db` which has been seeded with test data:
- 3 projects (Clyqra, Rookie, Learning)
- 4 tasks
- 1 test user (username: `testuser`)

## How to Switch Databases

If you find your original database or want to use a different one:

### Method 1: Using the Switch Script

```bash
./switch_database.sh /path/to/your/database.db
```

### Method 2: Manual Switch

1. Stop the container:
   ```bash
   docker compose down
   ```

2. Backup current database (recommended):
   ```bash
   cp prisma/dev.db prisma/backup-$(date +%Y-%m-%d).db
   ```

3. Copy your database file:
   ```bash
   cp /path/to/your/database.db prisma/dev.db
   ```

4. Restart the container:
   ```bash
   docker compose up -d
   ```

## Database Backups

### Creating Backups

```bash
# Create a timestamped backup
cp prisma/dev.db prisma/backup-$(date +%Y-%m-%d).db

# Or use the backup script
node prisma/backup-tasks.ts
```

### Restoring from Backup

```bash
# Stop container
docker compose down

# Restore backup
cp prisma/your-backup.db prisma/dev.db

# Restart container
docker compose up -d
```

## Database Location

The application uses SQLite databases located in:
- `prisma/dev.db` (current active database)
- `prisma/prisma/dev.db` (alternative location)

## Troubleshooting

### Database is empty

If your database appears empty, you can:
1. Restore from a backup
2. Run the seed script: `node simple_seed.js`
3. Check if you're using the correct database file

### Connection errors

Make sure:
- The database file exists at `prisma/dev.db`
- The file has proper permissions
- The Docker container has access to the file

## Available Database Files

```bash
ls -la prisma/*.db
```

This will show you all available database files with their sizes and dates.

## Important Notes

1. **Always backup** before making changes
2. SQLite files can be corrupted if not handled properly
3. Don't edit database files while the application is running
4. Use proper shutdown procedures (`docker compose down`)

## Contact

If you need help finding or restoring your original database, please provide:
- Any backup files you might have
- When you last remember the database working
- Any error messages you're seeing

I can help you restore from backups or migrate data if needed.
