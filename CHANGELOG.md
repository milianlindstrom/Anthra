# Changelog

All notable changes to Ulrik will be documented in this file.

## [Unreleased]

### Added
- **Local Authentication System**: JWT-based user authentication with secure session management
  - User signup and login pages
  - Password hashing with SHA-256
  - 30-day session tokens with httpOnly cookies
  - Middleware protection for all routes
- **Mandatory Onboarding**: One-time onboarding flow that must be completed before accessing the app
  - Database-tracked completion status
  - Removed skip functionality
  - Automatic redirects based on onboarding status
- **Personalized Dashboard**: Welcome page with username and quick access links
  - Personalized greeting: "Welcome, {username}!"
  - Quick navigation cards to Kanban, Projects, and Analytics
- **Minimalist Charcoal UI Design**: Complete visual overhaul
  - Charcoal primary color scheme (near-black background)
  - Sharp angles (no rounded corners)
  - Removed all shadows for flat design
  - Increased negative space throughout
  - Removed all emojis from UI
  - Subtle priority color indicators (faded blue/yellow/red backgrounds)
- **Two-Font Typography System**:
  - IBM Plex Sans for body/UI text and headers (Medium 500, Semibold 600)
  - JetBrains Mono for technical elements (task IDs, time estimates, badges)
- **Sidebar Navigation**: Replaced topbar with project-centric sidebar
  - Project selection at the top
  - Navigation links nested under selected project
  - Persistent project selection across page reloads
  - Mobile-responsive with toggle
- **Logo Implementation**: Ulrik logo integrated throughout
  - Sidebar header
  - Login and signup pages
  - Favicon configuration
- **Project Context**: Global project state management
  - `ProjectContext` for persistent project selection
  - Automatic task filtering by selected project
  - Pre-filled project selection in task creation dialogs
- **Widescreen Optimization**: Better scaling for 21:9 displays
  - Max-width container (2400px)
  - Improved grid layouts
  - Increased spacing

### Changed
- **Onboarding**: Changed from optional to mandatory, one-time per user
- **Task Creation**: Automatically uses selected project (no manual selection needed)
- **UI Design**: Complete redesign from blue/rounded to charcoal/sharp
- **Typography**: Replaced default fonts with IBM Plex Sans and JetBrains Mono
- **Navigation**: Moved from topbar to sidebar with project-centric structure
- **Priority Indicators**: Changed from left border to subtle background color tints

### Fixed
- **Middleware Edge Runtime**: Fixed Prisma usage in middleware (now uses token verification only)
- **Cookie Security**: Fixed secure cookie flag for HTTP environments
- **Task ID Visibility**: Task IDs now included in all MCP tool outputs
- **API Endpoints**: Added missing GET handler for `/api/tasks/[id]`
- **Search Functionality**: Added search_tasks and find_task_by_title MCP tools

### Technical
- Added `User` model to Prisma schema
- Created `lib/auth-server.ts` for authentication utilities
- Implemented Next.js middleware for route protection
- Added `contexts/project-context.tsx` for global state
- Updated Dockerfile to handle logo file copying
- Configured two-font system in Tailwind and global CSS

## [Previous Versions]

See git history for earlier changelog entries.
