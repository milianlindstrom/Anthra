# Anthra - Production-Grade Task Management System

## 🎨 Design Philosophy

**Refined Apple-Inspired Aesthetic** - "Notion meets Linear meets Raycast"
- Premium rounded corners (6-14px system) for approachable feel
- 5-level refined shadow system for depth and elevation
- Glassmorphism effects on modals with backdrop blur
- Spring-based animations with natural easing curves
- Smooth micro-interactions (hover lifts, scale on press)
- Charcoal dark theme with warm hierarchy
- IBM Plex Sans + JetBrains Mono typography
- Technical credibility meets friendly approachability

## ✨ Core Features

### 🎯 5-Step Workflow System
- **Backlog** - Brain dump your ideas and future tasks (Gray accent)
- **To Do** - Prioritized, ready-to-work tasks (Blue accent)  
- **In Progress** - Active work in development (Purple accent)
- **Review** - Tasks awaiting validation/testing (Orange accent)
- **Done** - Completed tasks (Green accent)

Each column has:
- Task counter badges
- Unique color accents for visual clarity
- Beautiful empty states with motivational messages
- Smooth drag-and-drop between all statuses

### 📊 Analytics Dashboard
Comprehensive metrics and visualizations:

**Quick Stats**
- Completion rate percentage
- Active work counter (In Progress tasks)
- Total estimated hours across all tasks
- Weekly velocity (tasks completed this week)

**Visual Charts (Recharts)**
- Status Distribution (Bar chart)
- Priority Breakdown (Pie chart with percentages)
- Velocity Trend (Line chart - last 4 weeks)
- Time Distribution (Horizontal bar - hours by status)

**Project Insights**
- Tasks per project with completion rates
- Time estimates per project
- Progress bars for each project
- Sort by total tasks

**Health Metrics**
- Overdue tasks count
- Tasks due within 7 days
- Tasks with no due date
- Tasks with no time estimate
- Longest tasks in "In Progress" (potential blockers)

**Upcoming Deadlines**
- Next 7 days highlighted
- Sorted by date
- Project badges for context

**Export Options**
- Export all tasks as JSON (full data)
- Export as CSV for Excel/Google Sheets analysis
- One-click Archive Old button (archives tasks in Done 7+ days)

### 📅 Gantt Timeline View
Professional timeline visualization:
- Dark mode optimized with light text on dark background
- Color-coded by priority (vibrant bars)
  - High: Red (#f87171)
  - Medium: Yellow (#fbbf24)
  - Low: Blue (#60a5fa)
- Progress indicators by status:
  - Backlog: 0%
  - To Do: 25%
  - In Progress: 50%
  - Review: 75%
  - Done: 100%
- Automatic day calculation from estimated hours (8h = 1 day)
- Priority legend
- Statistics panel

### 🎴 Professional Task Cards
Beautiful refined card design with:
- **Rounded corners (10px)** - Apple-inspired polish
- **Hover lift effect** - smooth translateY animation
- **Refined shadows** - subtle depth with elevation system
- **Drag feedback** - scale transform + enhanced shadow
- **Smart due date indicators**:
  - 🔴 Red background: Overdue
  - 🟠 Orange background: Due today or tomorrow
  - 🟡 Yellow background: Due within 3 days
  - ⚪ Gray text: 4+ days away
- Priority badges with vibrant colors
- Project tags with rounded design
- Estimated hours badge (top right)
- Description preview (line clamped)
- Click to open detailed view
- Delete button with confirmation

### 🔍 Global Search (Ctrl/Cmd + F)
Instant search overlay:
- Searches task titles, descriptions, and projects
- Real-time filtering as you type
- Results show: title, description preview, status, priority, project
- Click result to jump to task (or open in kanban)
- Keyboard shortcut always available
- Escape to close
- Beautiful dark modal with backdrop blur

### ⚡ Quick Add (Ctrl/Cmd + K)
Lightning-fast task creation:
- Floating action button (bottom right, always visible)
- Vibrant Zap icon with hover animation
- Quick form: Title (required), Project, Priority
- Automatically adds to Backlog
- Keyboard shortcut from anywhere
- Escape to close
- Tip reminder at bottom of modal

### 🏷️ Quick Filters
One-click filter presets above kanban board:
- **All Tasks** - Show everything
- **High Priority** - Filter high priority only
- **Due Today** - Tasks due today
- **Due This Week** - Next 7 days
- **Overdue** - Past due date tasks
- **No Due Date** - Tasks without deadlines
- Badge counters show how many tasks match
- Clear Filters button when active
- Combines with project filter

### 📝 Task Details Modal
Comprehensive task view and editing:
- Click any card to open detailed modal
- **View Mode**: All task info beautifully displayed
- **Edit Mode**: Inline editing of all fields
- Markdown support for descriptions (react-markdown)
- Visual status and priority badges
- Full metadata display:
  - Created date/time
  - Last updated date/time
  - Time in current status
- **Quick Actions**:
  - Duplicate task (creates copy in Backlog)
  - Archive task (manually)
  - Delete task (with confirmation)
- Save/Cancel with keyboard shortcuts
- Responsive modal design

### 📦 Archive System
Automated task management:
- Tasks in Done status for 7+ days auto-archive
- Dedicated `/archive` route to view archived tasks
- **Archive Page Features**:
  - List all archived tasks with metadata
  - Restore tasks back to active state
  - Permanently delete archived tasks
  - Empty state with helpful message
  - Task counter badge
- Manual archiving via Analytics dashboard button
- Archived tasks hidden from main views

### 🎨 Dark Mode Excellence
Production-quality dark theme:
- Deep, rich background colors (#0B1120 base)
- Excellent text contrast (WCAG AA compliant)
- Vibrant accent colors that POP:
  - Blue: #60a5fa
  - Purple: #a855f7
  - Orange: #f97316
  - Green: #22c55e
  - Red: #ef4444
  - Yellow: #fbbf24
- Smooth color transitions
- Custom Gantt chart dark styling (global CSS injection)
- Chart colors optimized for dark backgrounds
- Subtle shadows and glows

### 🎉 Completion Animation
Celebrate finishing tasks:
- Confetti animation when dragging task to Done
- 30 colorful particles (5 different colors)
- Physics-based falling and rotation
- 3-second duration with fade out
- Non-blocking, overlay animation
- Subtle and professional (not obnoxious)

### 🚀 Performance Optimizations
- Loading states for all routes (beautiful skeletons)
- Next.js 14 App Router with automatic code splitting
- React Server Components where applicable
- Optimized re-renders with proper state management
- Lazy loading for heavy components
- Debounced search input (instant feel, optimized backend)
- Efficient drag-and-drop (60fps smooth)

### 📱 Fully Responsive
Mobile-first design:
- Mobile navigation (hamburger menu)
- Kanban columns stack vertically on mobile
- Touch-friendly drag-and-drop
- Responsive grid layouts (1 → 2 → 5 columns)
- Floating action button positioned for thumb access
- All modals mobile-optimized
- Sticky header navigation
- Proper touch targets (44x44 minimum)

### ⌨️ Keyboard Shortcuts
Power user features:
- `Ctrl/Cmd + K`: Quick add task
- `Ctrl/Cmd + F`: Global search
- `Escape`: Close modals/overlays
- Visual shortcut hints in header
- Keyboard-first navigation support

### 🎭 Beautiful UI/UX Details
- Inter font family (clean, modern, great readability)
- Proper heading hierarchy
- Smooth scrolling
- Enhanced focus states (ring on focus-visible)
- Shimmer animation for loading skeletons
- Empty states with personality and emojis
- Consistent spacing and padding
- Shadow depth hierarchy
- Hover state feedback on all interactive elements
- Satisfying micro-interactions

### 🗂️ Project Management
- Add custom project names
- Filter by project (dropdown in header)
- Project breakdown in analytics
- Project badges on task cards
- Color-coded consistency

### ⏱️ Time Tracking
- Estimated hours per task
- Total hours calculation
- Hours breakdown by status
- Hours per project in analytics
- Gantt auto-calculates durations (8h/day)

### 📆 Smart Due Dates
- Date picker in task forms
- Visual urgency coding on cards
- Upcoming deadlines section in analytics
- Overdue task tracking
- Due date filters

### 🏆 Priority System
- Three levels: Low, Medium, High
- Vibrant color coding everywhere
- Priority distribution analytics
- Filter by high priority
- Visual left-border accent on cards

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Prisma + SQLite
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix primitives)
- **Icons**: lucide-react
- **Drag & Drop**: @dnd-kit/core
- **Charts**: Recharts
- **Markdown**: react-markdown  
- **Date Handling**: date-fns
- **Animations**: Framer Motion + Custom CSS

## 🎯 Design Philosophy

**Production-Grade Quality**
- Feels like a $20/month SaaS product
- Every interaction is smooth and satisfying
- No jank, no lag, no compromises
- Professional polish throughout

**Dark Mode First**
- Dark mode is not an afterthought
- Optimized specifically for dark backgrounds
- Vibrant colors that enhance visibility
- WCAG AA contrast compliance

**Performance Matters**
- Fast load times
- Smooth 60fps animations
- Efficient re-renders
- Code splitting for optimal bundle size
- No unnecessary network requests

**User-Centric**
- Keyboard shortcuts for power users
- Mobile-friendly responsive design
- Quick actions always accessible
- Search and filter everywhere
- Visual feedback for all actions

**Data Safety**
- Archive system prevents accidental loss
- Confirmation dialogs for destructive actions
- Export options for backup
- Restore functionality

## 📈 Statistics

- **Components**: 15+ React components
- **Routes**: 7 pages (Kanban, Gantt, Analytics, Archive, etc.)
- **API Endpoints**: 4 REST endpoints
- **Features**: 50+ implemented features
- **Bundle Size**: Optimized for production
- **TypeScript**: 100% type-safe
- **Build**: ✅ Zero errors, zero warnings

## 🎨 Color Palette

**Status Colors**
- Backlog: Gray (#6b7280)
- To Do: Blue (#3b82f6)
- In Progress: Purple (#a855f7)
- Review: Orange (#f97316)
- Done: Green (#22c55e)

**Priority Colors**
- Low: Blue (#60a5fa)
- Medium: Yellow (#fbbf24)
- High: Red (#ef4444)

**UI Colors**
- Background: #0B1120
- Card: #1A1F2E
- Text: #E5E7EB
- Muted: #9CA3AF
- Primary: #60A5FA
- Border: #374151

---

**Built with ❤️ for maximum productivity**
