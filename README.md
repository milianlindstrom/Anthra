# Ulrik

A minimal task management system with SQLite backend and Next.js frontend. Features a Kanban board with drag-and-drop and a Gantt timeline view.

## Features

- **Kanban Board**: Drag tasks between Todo, In Progress, and Done columns
- **Gantt Timeline**: Visual timeline showing task duration and deadlines
- **Project Filtering**: Filter tasks by project (Clyqra, Rookie, Study, etc.)
- **Priority Management**: Low, medium, and high priority levels
- **Task Tracking**: Track estimated hours and due dates
- **Dark Mode**: Default dark theme with clean, minimal design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- shadcn/ui components
- @dnd-kit for drag-and-drop
- gantt-task-react for timeline view

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

The database configuration is handled automatically by the startup script.
If you need to manually configure it, the DATABASE_URL should use an absolute path to the database file.

### 3. Initialize Database

Push the Prisma schema to create the database:

```bash
npm run db:push
```

### 4. Seed Sample Data

Load example tasks into the database:

```bash
npm run db:seed
```

This creates 6 example tasks across different projects (Clyqra, Rookie, Study).

### 5. Run Development Server

Use the provided startup script:

```bash
./start-dev.sh
```

Or manually with:

```bash
export DATABASE_URL="file:$(pwd)/prisma/dev.db"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Kanban Board (`/kanban`)

- **Drag and Drop**: Drag task cards between columns to update their status
- **Filter by Project**: Use the dropdown to filter tasks by project
- **Create Task**: Click "New Task" button to add a new task
- **Delete Task**: Click the trash icon on any task card

### Gantt Timeline (`/gantt`)

- **View Timeline**: See tasks displayed on a timeline based on due dates
- **Color Coding**: Tasks are color-coded by priority (Red=High, Yellow=Medium, Blue=Low)
- **Progress Indicator**: Progress bars show task status (0%=Todo, 50%=In Progress, 100%=Done)
- **Filter by Project**: Use the dropdown to filter the timeline

## Database Schema

**Task** model:
- `id`: Unique identifier
- `title`: Task title (required)
- `description`: Task description (optional)
- `status`: todo | in-progress | done
- `priority`: low | medium | high
- `project`: Project name (e.g., "Clyqra", "Rookie", "Study")
- `estimated_hours`: Estimated hours to complete
- `due_date`: Target completion date
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## API Endpoints

All endpoints return JSON:

- `GET /api/tasks` - List all tasks (optional `?project=` filter)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with example data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
├── app/
│   ├── api/tasks/           # API routes
│   ├── kanban/              # Kanban board page
│   ├── gantt/               # Gantt timeline page
│   └── layout.tsx           # Root layout with navigation
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── kanban-column.tsx    # Kanban column component
│   ├── task-card.tsx        # Task card with drag support
│   └── new-task-dialog.tsx  # Create task dialog
├── lib/
│   ├── db.ts                # Prisma client instance
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
└── package.json
```

## Notes

- **No Authentication**: This is a single-tenant system with no user management
- **Local Storage**: All data is stored in a local SQLite database
- **Mobile Responsive**: Optimized for desktop but works on mobile
- **Dark Mode Default**: Dark theme enabled by default

## License

MIT
