# Recurring Tasks Guide

## Overview

Recurring tasks automatically generate new tasks on a schedule. Perfect for daily standups, weekly reviews, monthly reports, or any repetitive work.

## Key Concepts

### Templates vs. Instances

- **Template**: The blueprint that defines what tasks to create and when
- **Instance**: An actual task generated from a template
- Templates stay active and keep generating tasks on schedule
- Each instance is a normal task that can be completed, edited, or deleted

### AI Briefing System

**Important**: When recurring tasks are generated, they're flagged for AI review:
- Task shows "⚠️ Needs AI review" badge
- AI assistant MUST acknowledge the task using `acknowledge_briefing(task_id)`
- This ensures your AI sees every recurring task and can prioritize/adjust as needed
- Prevents tasks from piling up unnoticed

## Creating Recurring Templates

### Via UI

1. Navigate to `/recurring`
2. Click "New Template"
3. Fill in template details:
   - **Title**: What the task will be called
   - **Description**: Task details (optional)
   - **Project**: Which project to create tasks in
   - **Priority**: Default priority for generated tasks
   - **Estimated Hours**: Default time estimate
4. Choose recurrence pattern:
   - **Daily**: Every day at specified time
   - **Weekly**: Every [day of week] at specified time
   - **Monthly**: Every [day of month] at specified time
5. Set generation time (default: 9:00 AM)
6. Click "Create Template"

### Via MCP/AI

```
"Create a recurring task template for daily standup at 9 AM in the Work project"
```

The AI will call:
```typescript
create_recurring_template({
  title: "Daily Standup",
  project_id: "work_project_id",
  recurrence_pattern: "daily",
  recurrence_config: { time: "09:00" },
  priority: "medium"
})
```

## Recurrence Patterns

### Daily

Generates a new task every day at the specified time.

**Example**: Daily standup, end-of-day review
```json
{
  "recurrence_pattern": "daily",
  "recurrence_config": { "time": "09:00" }
}
```

### Weekly

Generates a new task every week on a specific day.

**Days**: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

**Example**: Weekly team meeting every Monday
```json
{
  "recurrence_pattern": "weekly",
  "recurrence_config": { 
    "day_of_week": 1,
    "time": "10:00" 
  }
}
```

### Monthly

Generates a new task on a specific day of each month.

**Example**: Monthly report on the 1st
```json
{
  "recurrence_pattern": "monthly",
  "recurrence_config": { 
    "day_of_month": 1,
    "time": "09:00" 
  }
}
```

**Note**: If day_of_month is 31 and the month only has 30 days, it generates on the last day of that month.

## Managing Templates

### Viewing Templates

Navigate to `/recurring` to see all templates with:
- Current status (active/paused)
- Next generation time
- Recurrence pattern description
- Number of tasks generated

### Pausing Templates

Click the pause button to temporarily stop generating tasks.
- Existing instances remain unchanged
- No new tasks will be created
- Can be resumed anytime

### Editing Templates

1. Click the edit button on a template
2. Modify any field
3. Save changes
4. Next generation time is recalculated automatically

### Deleting Templates

1. Click the delete button
2. Confirm deletion
3. **Note**: Existing instances are NOT deleted
4. Only the template is removed

### Manual Generation

For testing or immediate needs:
1. Click "Generate Now" on a template
2. Creates a task immediately
3. Updates the next generation time as scheduled

## Generated Tasks

### Task Properties

Generated tasks include:
- All fields from the template (title, description, priority, etc.)
- Status: Set to `todo` by default
- Special flags:
  - `is_recurring: true`
  - `recurring_template_id`: Link to source template
  - `recurrence_instance_date`: When it was generated
  - `needs_ai_briefing: true` (requires AI acknowledgment)

### Task Indicators

**Kanban Card**:
- 🔁 **Recurring** badge
- Hover shows: "From template: [template name]"
- ⚠️ **Needs AI review** badge (until acknowledged)

**Task Detail Modal**:
- Purple box showing template name
- Link to the source template
- Acknowledgment button for AI review

### Completing Recurring Tasks

Completing a recurring task instance:
- ✅ Marks this instance as done
- ❌ Does NOT affect the template
- ❌ Does NOT stop future generations
- The template continues generating on schedule

## AI Briefing Workflow

### Why Briefings Matter

Recurring tasks can pile up if ignored. The briefing system ensures:
1. Every generated task is reviewed by your AI
2. AI can prioritize, reschedule, or adjust tasks
3. You stay aware of all pending recurring work

### Briefing Process

1. **Task is generated** → Flagged with `needs_ai_briefing: true`
2. **AI checks briefings** → Calls `get_pending_briefings()`
3. **AI reviews task** → Analyzes priority, timing, context
4. **AI acknowledges** → Calls `acknowledge_briefing(task_id)`
5. **Badge removed** → Task is now actionable

### For AI Assistants

**Check regularly** (recommended: every hour or on user request):
```typescript
const briefings = await get_pending_briefings()
// Review each task
// Acknowledge after review
await acknowledge_briefing(task_id)
```

**Sample AI workflow**:
```
User: "What's on my plate today?"

AI:
1. Calls get_pending_briefings()
2. Sees "Daily Standup" needs review
3. Responds: "You have a Daily Standup task generated this morning"
4. Calls acknowledge_briefing(task_id)
5. Suggests priorities for the day
```

## Automation Setup

### Cron Job (Production)

To automatically generate recurring tasks:

**Option 1: External Cron**
```bash
# Add to crontab (runs every hour)
0 * * * * curl -X POST https://your-anthra.com/api/recurring/generate
```

**Option 2: System Service**
```bash
# Create systemd timer (Linux)
# anthra-recurring.service
# anthra-recurring.timer
```

### Environment Variables

```bash
# .env
RECURRING_GENERATION_ENABLED=true
```

### Manual Trigger

For development or testing:
```bash
curl -X POST http://localhost:3000/api/recurring/generate
```

Or via MCP:
```typescript
trigger_recurring_generation(template_id)
```

## MCP Tools Reference

```typescript
// Create template
create_recurring_template({
  title, description, project_id,
  priority, estimated_hours,
  recurrence_pattern, recurrence_config
})

// List templates
list_recurring_templates({ active_only: true })

// Update template
update_recurring_template(template_id, { active: false })

// Delete template
delete_recurring_template(template_id)

// Manual generation
trigger_recurring_generation(template_id)

// AI Briefings (CRITICAL)
get_pending_briefings() // Check regularly!
acknowledge_briefing(task_id) // After reviewing
```

## Best Practices

### Template Design

1. **Clear titles**: Include frequency in title (e.g., "Daily Standup", not just "Standup")
2. **Useful descriptions**: Add context, links, checklists
3. **Realistic estimates**: Set accurate estimated_hours
4. **Right priority**: Most recurring tasks are medium priority
5. **Smart timing**: Generate tasks when you'll actually do them

### Organization

1. **Group by project**: Use projects to organize recurring work
2. **Review templates**: Monthly review of active templates
3. **Archive completed**: Remove templates that are no longer needed
4. **Use subtasks**: For recurring tasks with multiple steps

### Common Patterns

**Daily**:
- Morning standup
- End-of-day reflection
- Daily report generation

**Weekly**:
- Monday planning session
- Friday retrospective
- Weekly team sync
- Weekend review

**Monthly**:
- Monthly report (1st of month)
- Mid-month check-in (15th)
- Last day wrap-up

## Troubleshooting

### Tasks not generating

**Check**:
1. Template is active (not paused)
2. `next_generation_at` is in the past
3. Cron job is running (if configured)
4. Manual trigger works: `/api/recurring/generate`

**Solution**:
- Edit template to recalculate generation time
- Manually trigger once
- Check server logs for errors

### Too many pending briefings

**Problem**: AI hasn't acknowledged generated tasks

**Solution**:
1. Call `get_pending_briefings()` to see backlog
2. Review and acknowledge each task
3. Consider pausing high-frequency templates
4. Set up automated AI check

### Wrong generation time

**Problem**: Tasks generating at unexpected times

**Solution**:
1. Check `recurrence_config.time` in template
2. Consider timezone differences
3. Edit template and set correct time
4. Next generation will use new time

## See Also

- [Dependencies Guide](./DEPENDENCIES_GUIDE.md) - For related tasks
- [Subtasks Guide](./SUBTASKS_GUIDE.md) - For breaking down recurring work
- [MCP Integration](./MCP_QUICKSTART.md) - Full MCP command reference
