# Ulrik Interface Design System

## Domain & Intent

**Domain:** Project management, task tracking, productivity tools
**Concepts:** Projects, tasks, workflow stages, priorities, deadlines, dependencies, analytics, Gantt charts, Kanban boards
**Metaphors:** Construction projects, assembly lines, command centers, control panels, flight decks

**Who is this human?** Project managers, developers, team leads who need to track progress and make data-driven decisions
**What must they accomplish?** Monitor project health, identify bottlenecks, track completion rates, manage dependencies
**How should it feel?** Technical yet approachable, data-rich but not overwhelming, like a control panel with clear status indicators

## Color World

**Construction/Control Panel Inspired:**
- Dark blues/grays: `#1e40af`, `#1e3a8a`, `#1e293b`, `#0f172a` (base surfaces)
- Safety orange spectrum: `#ea580c`, `#f97316`, `#fb923c`, `#fdba74` (highlights, warnings)
- Steel blues: `#06b6d4`, `#0891b2`, `#0e7490` (accents, interactive elements)
- Caution yellows: `#f59e0b`, `#d97706`, `#b45309`, `#92400e` (attention-grabbing elements)

## Signature Element

**Status Light Indicators:** Task status indicators that look like physical control panel lights with subtle glow effects, using domain-specific colors:
- Backlog: Slate blue `#64748b`
- To Do: Blue `#3b82f6` 
- In Progress: Purple `#a855f7`
- Review: Orange `#f97316`
- Done: Green `#10b981`

## Depth Strategy

**Borders-only approach:** Clean, technical feel suitable for dense project management tools
- Standard borders: `border border-border` (1px, low opacity)
- Emphasis borders: `border-2 border-primary` (2px, higher contrast)
- Surface separation: Subtle border color shifts rather than shadows

## Spacing Base Unit

`8px` base unit with consistent multiples:
- Micro: `4px` (icon gaps, tight spacing)
- Component: `8px, 12px, 16px` (internal padding, gaps)
- Section: `24px, 32px` (between major sections)
- Major: `48px, 64px` (page-level separation)

## Typography

**Font Family:** System sans-serif (Inter fallback) for clean, technical readability
**Hierarchy:**
- Headings: `font-bold` with tight letter-spacing
- Body: `font-normal` for comfortable reading
- Labels: `font-medium` at smaller sizes
- Data: Monospace for numbers and technical values

**Text Colors:**
- Primary: `text-foreground` (high contrast)
- Secondary: `text-muted-foreground` (supporting text)
- Tertiary: `text-muted-foreground/80` (metadata)
- Muted: `text-muted-foreground/60` (disabled/placeholder)

## Component Patterns

### Cards
- Base: `bg-card border border-border rounded-lg`
- Hover: `hover:shadow-lg transition-all`
- Status indicator: `border-l-4` with project/status color
- Padding: `p-4` internal, `gap-4` between cards

### Buttons
- Primary: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Outline: `border border-input bg-transparent`
- Ghost: `hover:bg-accent hover:text-accent-foreground`

### Badges
- Default: `bg-primary text-primary-foreground`
- Outline: `border border-border bg-transparent`
- Destructive: `bg-destructive text-destructive-foreground`

### Navigation
- Same background as content with border separation
- Subtle active state indicators
- Consistent icon + label spacing

## Rejected Defaults

1. **Generic card grids** → Domain-specific layouts reflecting workflow stages
2. **Standard color palettes** → Construction/control panel inspired colors with meaning
3. **Basic typography** → Technical monospace for data, friendly sans-serif for labels
4. **Shadow-heavy depth** → Border-based separation for technical feel
5. **Random spacing values** → Consistent 8px grid system

## Implementation Notes

- All text elements explicitly use `text-foreground` for consistency
- Card titles and headings use proper text color classes
- Status indicators use domain-specific color mapping
- Hover states use subtle transitions and glow effects
- Interactive elements have clear focus states
- Data visualization uses consistent color schemes across charts