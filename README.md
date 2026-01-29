# Ulrik

A minimal, AI-native task management system with SQLite backend, Next.js frontend, and AI integration via Model Context Protocol (MCP). Features a Kanban board, Gantt timeline view, local authentication, mandatory onboarding, and a powerful MCP server for AI assistants.

## Features

### Core Features
- **Local Authentication**: JWT-based user authentication with secure session management
- **Mandatory Onboarding**: One-time onboarding flow that guides new users through the system
- **Personalized Dashboard**: Welcome message with username and key performance indicators (KPIs)
- **Kanban Board**: Drag tasks between 5 stages (Backlog → To Do → In Progress → Review → Done)
- **Gantt Timeline**: Visual timeline showing task duration and deadlines
- **Project Management**: Organize tasks into projects with custom colors and icons
- **Priority Management**: Low, medium, and high priority levels with subtle color indicators
- **Task Tracking**: Track estimated hours and due dates
- **Minimalist Design**: Charcoal-based dark theme with sharp angles, generous negative space, and clean typography
- **Two-Font System**: IBM Plex Sans for UI/body text, JetBrains Mono for technical elements
- **Sidebar Navigation**: Project-centric navigation with persistent project selection
- **Analytics Dashboard**: Track completion rates, velocity, and project health

### Advanced Task Management ✨
- **Task Dependencies**: Create relationships between tasks (Task A blocks Task B)
  - Automatic validation prevents moving blocked tasks to in-progress
  - Visual indicators show blocked status on cards
  - Circular dependency detection
  
- **Recurring Tasks**: Auto-generate tasks on a schedule
  - Daily, weekly, and monthly patterns
  - AI briefing system ensures every recurring task is reviewed
  - Pause/resume templates as needed
  
- **Subtasks**: Break down complex tasks into smaller pieces
  - Quick inline creation
  - Progress tracking (X/Y completed)
  - Checkbox toggles for quick completion
  
- **Onboarding Flow**: Mandatory interactive tutorial for new users
  - 5-slide walkthrough covering all features
  - Keyboard navigation support
  - One-time completion tracked in database
  - Required before accessing the main application

### Security 🔒
- **Local User Authentication**: JWT-based authentication with secure httpOnly cookies
- **User Accounts**: Username/password authentication with SHA-256 password hashing
- **Session Management**: 30-day session tokens with automatic renewal
- **API Key Authentication**: Secure API access with key management for MCP integration
- **Settings UI**: Generate and manage multiple API keys
- **Development Mode**: Optional authentication bypass for local dev
- **Last Used Tracking**: Monitor API key usage

### AI Integration 🤖
- **MCP Server**: Connect AI assistants (Claude, ChatGPT, Open WebUI) to your tasks
- **30+ MCP Tools**: Complete API coverage for AI assistants
- **Smart Recommendations**: AI-powered "what should I work on?" suggestions
- **Project Health Analysis**: Automated project health monitoring
- **Dependency Management**: AI helps prevent circular dependencies
- **Task Breakdown**: AI creates subtasks from complex tasks
- **Recurring Task Briefings**: AI acknowledges and prioritizes generated tasks
- **Natural Language Control**: Manage tasks through conversation with AI

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│   AI Clients    │ ◄─────► │   MCP Server     │ ◄─────► │  Ulrik UI   │
│  (Claude, etc)  │  stdio  │   (Port 3001)    │  HTTP   │ (Port 3000) │
│                 │         │                  │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │   SQLite    │
                                                          │   Database  │
                                                          └─────────────┘
```

## Tech Stack

### UI (Next.js)
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- shadcn/ui components (customized for minimalist design)
- IBM Plex Sans (UI/body text)
- JetBrains Mono (technical elements)
- @dnd-kit for drag-and-drop
- gantt-task-react for timeline view
- Lucide icons

### MCP Server
- Model Context Protocol SDK
- TypeScript
- Node.js 20+
- RESTful API integration

## Quick Start

### Option 1: Docker (Recommended for Production)

Run both UI and MCP server together:

```bash
docker-compose up -d
```

- UI available at: http://localhost:3000
- MCP server available at: http://localhost:3001

### Option 2: Manual Setup (Development)

#### UI Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Setup Database**

Push the Prisma schema to create the database:

```bash
npm run db:push
```

3. **Seed Sample Data**

Load example tasks into the database:

```bash
npm run db:seed
```

This creates example tasks across different projects.

4. **Run Development Server**

```bash
./start-dev.sh
```

Or manually:

```bash
export DATABASE_URL="file:$(pwd)/prisma/dev.db"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### MCP Server Setup

1. **Install Dependencies**

```bash
cd mcp-server
npm install
```

2. **Configure Environment**

Create `.env` file:

```env
ULRIK_API_URL=http://localhost:3000
```

3. **Run MCP Server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

See [mcp-server/README.md](mcp-server/README.md) for detailed MCP server documentation.

## Usage

### Getting Started

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Authenticate at `/login`
3. **Onboarding**: Complete the mandatory onboarding flow
4. **Dashboard**: View your personalized dashboard with welcome message and KPIs

### Web Interface

#### Dashboard (`/`)
- **Welcome Message**: Personalized greeting with username
- **Quick Links**: Access to Kanban, Projects, and Analytics
- **KPIs**: Key performance indicators (coming soon)

#### Kanban Board (`/kanban`)

- **Drag and Drop**: Drag task cards between columns to update their status
- **Project Context**: Tasks automatically filtered by selected project in sidebar
- **Bulk Actions**: Select multiple tasks and update their status simultaneously
- **Create Task**: Click "New Task" button to add a new task (pre-filled with current project)
- **Delete Task**: Click the trash icon on any task card
- **Priority Indicators**: Subtle background color tints (blue/yellow/red) indicate priority

#### Gantt Timeline (`/gantt`)

- **View Timeline**: See tasks displayed on a timeline based on due dates
- **Color Coding**: Tasks are color-coded by priority (Red=High, Yellow=Medium, Blue=Low)
- **Progress Indicator**: Progress bars show task status (0%=Todo, 50%=In Progress, 100%=Done)
- **Filter by Project**: Use the dropdown to filter the timeline

### AI Integration (MCP)

#### Connecting to Claude Desktop

1. Build the MCP server:
```bash
cd mcp-server
npm install
npm run build
```

2. Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ulrik": {
      "command": "node",
      "args": ["/absolute/path/to/ulrik/mcp-server/dist/index.js"],
      "env": {
        "ULRIK_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

3. Restart Claude Desktop

#### Using with AI

Once connected, you can:

- **"What should I work on today?"** - Get smart task recommendations
- **"Show me all high priority tasks"** - List and filter tasks
- **"Create a task to implement user authentication in the Backend project"** - Create tasks via conversation
- **"How is the Frontend project doing?"** - Get project health analysis
- **"Break down the 'Build API' task"** - Get suggestions for task decomposition

See [mcp-server/README.md](mcp-server/README.md) for complete MCP documentation and integration examples.

## Database Schema

**Task** model:
- `id`: Unique identifier
- `title`: Task title (required)
- `description`: Task description (optional)
- `status`: backlog | todo | in-progress | review | done
- `priority`: low | medium | high
- `project_id`: Foreign key to Project
- `estimated_hours`: Estimated hours to complete
- `start_date`, `due_date`: Date range for work
- `parent_task_id`: For subtasks (nullable)
- `is_recurring`: Generated from recurring template
- `recurring_template_id`: Link to template (nullable)
- `needs_ai_briefing`: Requires AI acknowledgment
- `created_at`, `updated_at`: Timestamps

**TaskDependency** model:
- `id`: Unique identifier
- `task_id`: Task that is blocked
- `depends_on_task_id`: Task that must be completed first

**RecurringTaskTemplate** model:
- `id`: Unique identifier
- `title`, `description`: Task details
- `project_id`: Foreign key to Project
- `priority`, `estimated_hours`: Default values
- `recurrence_pattern`: daily | weekly | monthly
- `recurrence_config`: JSON config (day_of_week, day_of_month, time)
- `active`: Whether template is generating tasks
- `last_generated_at`, `next_generation_at`: Scheduling

**User** model:
- `id`: Unique identifier
- `username`: Unique username
- `password_hash`: SHA-256 hashed password
- `onboarding_completed`: Boolean flag for onboarding status
- `created_at`, `updated_at`: Timestamps

**ApiKey** model:
- `id`: Unique identifier
- `key_hash`: SHA-256 hashed API key
- `name`: Friendly label
- `last_used_at`: Last access timestamp

**Project** model:
- `id`: Unique identifier
- `name`: Project name
- `slug`: URL-safe identifier
- `description`: Project description (optional)
- `color`: Hex color code
- `icon`: Emoji icon (deprecated - logo used instead)
- `archived`: Soft delete flag

## API Endpoints

### Task Endpoints

- `GET /api/tasks` - List all tasks
  - Query params: `project_id`, `status`, `priority`, `archived`
- `GET /api/tasks/[id]` - Get task details
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Project Endpoints

- `GET /api/projects` - List all projects
  - Query params: `archived`
- `GET /api/projects/[id]` - Get project details
- `POST /api/projects` - Create new project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Dependency Endpoints

- `POST /api/tasks/dependencies` - Add task dependency
- `DELETE /api/tasks/dependencies` - Remove task dependency
- `GET /api/tasks/dependencies?action=blocked` - Get all blocked tasks
- `GET /api/tasks/dependencies?action=chain&task_id=X` - Get dependency chain

### Recurring Task Endpoints

- `GET /api/recurring` - List recurring templates
- `POST /api/recurring` - Create recurring template
- `PATCH /api/recurring/[id]` - Update recurring template
- `DELETE /api/recurring/[id]` - Delete recurring template
- `POST /api/recurring/generate` - Generate tasks from templates
- `GET /api/recurring/generate?action=pending-briefings` - Get pending AI briefings

### Authentication Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/session` - Get current user session
- `POST /api/auth/onboarding-complete` - Mark onboarding as completed

### API Key Endpoints

- `GET /api/auth/api-keys` - List API keys
- `POST /api/auth/api-keys` - Create new API key
- `DELETE /api/auth/api-keys?id=X` - Revoke API key

### MCP Tools (via AI clients)

30+ tools available for AI assistants:

- **Task Management**: create_task, list_tasks, get_task, update_task, delete_task, move_task_status, bulk_update_tasks
- **Project Management**: list_projects, create_project, get_project, update_project
- **Dependencies**: add_task_dependency, remove_task_dependency, get_blocked_tasks, get_dependency_chain
- **Subtasks**: create_subtask, list_subtasks
- **Recurring Tasks**: create_recurring_template, list_recurring_templates, update_recurring_template, delete_recurring_template, trigger_recurring_generation
- **AI Briefings**: get_pending_briefings, acknowledge_briefing
- **Analytics**: get_task_summary, what_should_i_work_on, analyze_project_health, suggest_task_breakdown

See [mcp-server/README.md](mcp-server/README.md) for detailed tool documentation.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with example data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
ulrik/
├── app/                          # Next.js UI
│   ├── api/
│   │   ├── auth/                # Authentication routes (login, signup, session)
│   │   ├── tasks/               # Task API routes
│   │   └── projects/            # Project API routes
│   ├── kanban/                  # Kanban board page
│   ├── gantt/                   # Gantt timeline page
│   ├── analytics/               # Analytics dashboard
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── onboarding/              # Mandatory onboarding flow
│   ├── page.tsx                 # Dashboard with welcome message
│   └── layout.tsx               # Root layout with sidebar navigation
├── components/
│   ├── ui/                      # shadcn/ui base components (customized)
│   ├── sidebar.tsx              # Main sidebar navigation
│   ├── mobile-sidebar.tsx       # Mobile sidebar toggle
│   ├── kanban-column.tsx        # Kanban column component
│   ├── task-card.tsx            # Task card with drag support
│   ├── new-task-dialog.tsx      # Create task dialog
│   └── custom-gantt.tsx         # Gantt chart component
├── contexts/
│   └── project-context.tsx      # Global project selection context
├── lib/
│   ├── db.ts                    # Prisma client instance
│   ├── auth-server.ts           # Authentication utilities (JWT, cookies)
│   ├── auth.ts                  # API key authentication
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
├── middleware.ts                # Next.js middleware for auth & onboarding
├── shared/                      # Shared types between UI and MCP
│   └── types.ts                 # Task, Project interfaces
├── mcp-server/                  # MCP Server for AI integration
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── config.ts           # Configuration
│   │   └── tools/
│   │       ├── tasks.ts        # Task management tools
│   │       ├── projects.ts     # Project management tools
│   │       └── analytics.ts    # Analytics tools
│   ├── dist/                   # Built JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md               # MCP server documentation
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── docker-compose.yml          # Docker orchestration
├── package.json                # Root package.json
└── README.md                   # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# API Configuration (for MCP server)
ULRIK_API_URL=http://localhost:3000
MCP_SERVER_PORT=3001

# Environment
NODE_ENV=development
```

## Docker Deployment

### Build and Run

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

## Development

### UI Development

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### MCP Server Development

```bash
cd mcp-server
npm run dev          # Watch mode with auto-reload
npm run build        # Build TypeScript
npm run typecheck    # Type checking
```

## Design System

### Typography
- **Body/UI Text**: IBM Plex Sans (Medium weight, 500)
- **Headers**: IBM Plex Sans (Semibold weight, 600)
- **Technical Elements**: JetBrains Mono (Medium weight, 500, tighter letter spacing)
  - Task IDs, time estimates, priority badges, status badges

### Color Palette
- **Background**: Near-black (#000000 / hsl(0 0% 3%))
- **Primary**: Charcoal (#333333 / hsl(0 0% 20%))
- **Cards**: Dark charcoal (#0d0d0d / hsl(0 0% 5%))
- **Borders**: Subtle gray (hsl(0 0% 12%))
- **Priority Indicators**: Subtle faded tints
  - Low: Blue (bg-blue-500/5)
  - Medium: Yellow (bg-yellow-500/5)
  - High: Red (bg-red-500/5)

### Design Principles
- **Sharp Angles**: No rounded corners (border-radius: 0px)
- **Minimal Shadows**: Flat design with minimal depth
- **Negative Space**: Generous padding and spacing throughout
- **Clean Icons**: Lucide icon library for consistent iconography

## Notes

- **Local Authentication**: JWT-based user authentication with secure sessions
- **Mandatory Onboarding**: All new users must complete onboarding before accessing the app
- **Project Context**: Global project selection persists across page reloads
- **Local Storage**: All data is stored in a local SQLite database
- **Mobile Responsive**: Optimized for desktop but works on mobile
- **Dark Mode Default**: Minimalist charcoal dark theme enabled by default
- **AI-Ready**: Connect any MCP-compatible AI assistant (Claude, Open WebUI, Cline, etc.)

## Documentation

### Getting Started
- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [MCP Server Documentation](mcp-server/README.md) - Complete MCP integration guide
- [Feature List](FEATURES.md) - Detailed feature documentation

### Feature Guides
- [Dependencies Guide](DEPENDENCIES_GUIDE.md) - How to use task dependencies
- [Recurring Tasks Guide](RECURRING_TASKS_GUIDE.md) - Setting up recurring tasks
- [Subtasks Guide](SUBTASKS_GUIDE.md) - Breaking down complex tasks

### Reference
- [Changelog](CHANGELOG.md) - Version history
- [Setup Instructions](SETUP.md) - Detailed setup guide
- [Testing Checklist](TESTING_CHECKLIST.md) - QA testing guide

## Contributing

Contributions welcome! This project is designed to be a reference implementation for:
- Next.js 14 with App Router
- Prisma with SQLite
- Model Context Protocol (MCP) integration
- AI-first task management

## Support & Community

- **Issues**: Report bugs and request features via GitHub Issues
- **MCP Protocol**: https://modelcontextprotocol.io
- **AI Integration**: See mcp-server/README.md for examples

## License

MIT - Free to use and modify
