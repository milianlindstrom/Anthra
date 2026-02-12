# Anthra Design System

## Design Philosophy

**"Technical but Approachable"** - A refined Apple-inspired aesthetic that balances professional credibility with friendly approachability.

Think: **Notion meets Linear meets Raycast**

### Core Principles
1. **Premium & Polished** - Ready for SaaS, feels like a paid product
2. **Minimalist Foundation** - Charcoal dark theme, generous negative space
3. **Warm & Precise** - Subtle refinements add depth without decoration
4. **Fast & Smooth** - Micro-interactions and spring animations
5. **Technical Credibility** - Maintains developer-focused aesthetic

## Color System

### Charcoal Dark Theme
```css
--background: 0 0% 3%          /* Near-black background */
--foreground: 0 0% 98%         /* Near-white text */
--card: 0 0% 5%                /* Charcoal cards */
--muted: 0 0% 10%              /* Softer muted background */
--muted-foreground: 0 0% 65%   /* Softer muted text for hierarchy */
--accent: 0 0% 14%             /* Refined hover state */
--border: 0 0% 14%             /* Softer borders */
--input: 0 0% 10%              /* Refined input background */
--ring: 220 80% 60%            /* Subtle blue focus ring - premium feel */
```

### Design Refinements
- Slightly softer muted colors (65% vs 60%) for better hierarchy
- Subtle blue focus ring instead of gray for premium feel
- Elevated popover background (6% vs 5%) for depth
- Refined secondary and input backgrounds (10% vs 8%)

## Border Radius System

**5-Tier Rounded System** - Consistent, Apple-inspired rounding

```css
--radius: 0.375rem       /* 6px - Buttons, badges, inputs */
--radius-md: 0.625rem    /* 10px - Cards, containers */
--radius-lg: 0.875rem    /* 14px - Modals, major sections */
--radius-xl: 1rem        /* 16px - Large dialogs */
--radius-full: 9999px    /* Pills, avatars */
```

### Application
- **Buttons**: `rounded-md` (6px)
- **Cards**: `rounded-lg` (10px)
- **Modals**: `rounded-xl` (14px)
- **Inputs**: `rounded-md` (6px)
- **Badges**: `rounded-md` (6px) or `rounded-full` for pills
- **Avatars**: `rounded-full`
- **Keyboard shortcuts**: `rounded` (4px)

## Shadow System

**5-Level Elevation System** - Refined shadows for depth

```css
.shadow-refined-sm     /* Subtle: buttons, badges */
.shadow-refined        /* Base: cards at rest */
.shadow-refined-md     /* Medium: elevated cards */
.shadow-refined-lg     /* Large: dropdowns, popovers */
.shadow-refined-xl     /* Extra large: modals, dialogs */
```

### Shadow Composition
Each level combines multiple shadow layers:
- Larger blur for ambient shadow
- Smaller blur for direct shadow
- Increased opacity at higher levels
- All shadows use `rgb(0 0 0 / opacity)`

## Animation System

### Timing Functions

**Spring Animation** (micro-interactions)
```css
cubic-bezier(0.34, 1.56, 0.64, 1)
```
Use for: Focus rings, hover states, small transforms

**Smooth Animation** (general transitions)
```css
cubic-bezier(0.4, 0, 0.2, 1)
```
Use for: Cards, buttons, backgrounds, opacity

### Utility Classes
```css
.transition-spring   /* 250ms spring curve */
.transition-smooth   /* 200ms smooth curve */
.hover-lift         /* Hover translateY(-2px) */
.active-press       /* Active scale(0.98) */
```

### Built-in Animations
```css
.animate-fade-in           /* Fade + translateY */
.animate-fade-in-spring    /* Fade + translateY + scale with spring */
.animate-slide-in          /* Slide from bottom */
.animate-slide-up          /* Slide from below */
.animate-scale-in          /* Scale from 95% */
```

## Glassmorphism

**Modal & Overlay Effects**

```css
.glass-effect          /* 95% opacity + 20px blur */
.glass-effect-strong   /* 98% opacity + 24px blur */
```

Application:
- Dialog content: `glass-effect`
- Critical modals: `glass-effect-strong`
- Dialog overlay: `backdrop-blur-sm` + `bg-black/85`

## Typography

### Font System
- **UI/Body**: IBM Plex Sans (Medium 500, Semibold 600)
- **Technical**: JetBrains Mono (Medium 500)

### Font Weights
```css
body, UI elements: 500 (Medium)
Headings: 600 (Semibold)
Technical badges: 500 (Medium)
```

### Applications
- Task titles, descriptions: IBM Plex Sans
- Task IDs, time estimates, priorities: JetBrains Mono
- All headings: IBM Plex Sans Semibold
- Code/technical: JetBrains Mono

## Component Patterns

### Buttons
```tsx
<Button className="rounded-md shadow-refined-sm hover:shadow-refined transition-smooth active:scale-[0.98]">
  Action
</Button>
```

### Cards
```tsx
<Card className="rounded-lg shadow-refined-sm hover-lift hover:shadow-refined transition-smooth">
  Content
</Card>
```

### Inputs
```tsx
<Input className="rounded-md bg-input transition-spring focus:border-ring/50" />
```

### Dialogs
```tsx
<DialogOverlay className="backdrop-blur-sm bg-black/85" />
<DialogContent className="rounded-xl glass-effect shadow-refined-xl" />
```

### Badges
```tsx
<Badge className="rounded-md shadow-refined-sm">Label</Badge>
<Badge className="rounded-full">Pill</Badge>
```

## Micro-Interactions

### Hover States
- **Cards**: Lift 2px upward + increase shadow
- **Buttons**: Increase shadow, subtle background shift
- **Sidebar Items**: Background change to accent color
- **Interactive Icons**: Rotate or scale slightly

### Press States
- **All Buttons**: Scale to 98% on active
- **FAB**: Scale to 95% on active, 110% on hover

### Focus States
- **All Inputs**: Blue ring with spring animation
- **Ring Offset**: 2px for clear separation
- **Border Enhancement**: Border color shifts to ring/50

## Keyboard Shortcuts

Visual style for keyboard hints:
```tsx
<kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
  Ctrl/⌘ K
</kbd>
```

## Accessibility

### Focus Indicators
- All interactive elements have visible focus rings
- 2px ring offset for clear visibility against dark backgrounds
- Blue ring color (220 80% 60%) for contrast

### Touch Targets
- Minimum 44px × 44px on mobile (automatic via globals.css)
- Increased padding on touch devices

### Color Contrast
- All text meets WCAG AA standards
- Muted text at 65% lightness for readability
- Focus indicators have sufficient contrast

## Implementation Notes

### CSS Variables
All values defined in `app/globals.css` under `:root` and `.dark`

### Tailwind Config
Extended tokens in `tailwind.config.ts` for consistent usage

### Component Library
All shadcn/ui components updated with new system

### Custom Utilities
Additional utilities in `@layer utilities` for refined shadows, glassmorphism, and animations

## Migration from Sharp/Brutalist

### What Changed
- ✅ Border radius: 0px → 6-14px system
- ✅ Shadows: Hard borders → Refined shadow system
- ✅ Animations: Basic transitions → Spring curves
- ✅ Focus rings: Gray → Blue
- ✅ Backgrounds: Flat → Subtle depth
- ✅ Interactions: Simple → Micro-interactions

### What Stayed
- ✅ Charcoal color palette
- ✅ IBM Plex Sans + JetBrains Mono
- ✅ Minimalist philosophy
- ✅ All functionality
- ✅ Component APIs

## Best Practices

### DO
✅ Use predefined radius tokens (`rounded-md`, `rounded-lg`, etc.)  
✅ Apply hover-lift to interactive cards  
✅ Use transition-smooth for most animations  
✅ Add active-press to all buttons  
✅ Use glassmorphism on modals  
✅ Apply refined shadows consistently  

### DON'T
❌ Create custom radius values  
❌ Use transition-colors (use transition-smooth)  
❌ Over-animate (keep it subtle)  
❌ Use hard borders without shadows  
❌ Mix sharp and rounded in same component  
❌ Forget focus states  

## Future Considerations

### Potential Enhancements
- Light mode theme (if requested)
- Color accent system for branding
- Motion preferences (respect prefers-reduced-motion)
- Additional animation presets
- Component-level motion controls

### Maintaining Consistency
- Review new components against this guide
- Test all interactive states
- Ensure accessibility standards
- Keep performance in mind (use CSS transforms)
- Document any new patterns
