# Quick Setup Guide

Follow these steps to get Anthra running:

## 1. Install Dependencies
```bash
npm install
```

## 2. Make Startup Script Executable
```bash
chmod +x start-dev.sh
```

## 3. Initialize Database
```bash
npm run db:push
```

## 4. Seed Example Data
```bash
npm run db:seed
```

## 5. Start Development Server
```bash
./start-dev.sh
```

Then open http://localhost:3000 in your browser!

**Note:** Use `./start-dev.sh` instead of `npm run dev` to ensure the database path is set correctly.

## What You'll See

- The app will redirect to `/kanban` by default
- You'll see 6 example tasks across different projects
- Try dragging tasks between columns
- Click "New Task" to create a new task
- Switch to `/gantt` view to see the timeline

## Troubleshooting

**If you get Prisma errors:**
- Make sure you're using `./start-dev.sh` to start the server
- Run `npm run db:push` again
- Check that `prisma/dev.db` file exists and has proper permissions

**If you see "Module not found" errors:**
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then run `npm install`

**If drag-and-drop doesn't work:**
- Make sure you're not in mobile device emulation mode
- Try refreshing the page

Enjoy your task manager! 🚀
