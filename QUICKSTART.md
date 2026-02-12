# Quick Start Guide

## TL;DR - Get Running in 60 Seconds

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push
npm run db:seed

# 3. Make startup script executable
chmod +x start-dev.sh

# 4. Start the app
./start-dev.sh
```

Then open **http://localhost:3000** in your browser!

## Important Notes

### Always use `./start-dev.sh` to start the server

**Don't use** `npm run dev` directly - it won't set the database path correctly.

**Do use** `./start-dev.sh` - this sets up the environment properly.

### What You Get

- **Kanban Board** at `/kanban` (default page)
  - Drag tasks between Todo, In Progress, and Done
  - Filter by project
  - Create new tasks
  - Delete tasks

- **Gantt Timeline** at `/gantt`
  - Visual timeline of tasks
  - Color-coded by priority
  - Grouped by project

### Sample Data

The seed script creates 6 example tasks across 3 projects:
- **Clyqra** - 3 tasks
- **Rookie** - 2 tasks
- **Study** - 1 task

### Troubleshooting

**"Failed to fetch tasks" error:**
- Stop the server (Ctrl+C)
- Run `./start-dev.sh` again

**Port 3000 in use:**
- The app will automatically try port 3001
- Check the terminal output for the actual port

**Database errors:**
- Make sure `prisma/dev.db` exists
- Run `npm run db:push` again
- Check file permissions: `chmod 666 prisma/dev.db`

### Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + SQLite
- Tailwind CSS
- @dnd-kit for drag-and-drop
- gantt-task-react for timeline

Enjoy Anthra! 🚀
