import { CONFIG } from '../config.js';
import type { 
  Task, 
  TaskDependency, 
  RecurringTaskTemplate,
  CreateTaskInput,
  UpdateTaskInput
} from '../../shared/types.js';

export const taskTools = [
  {
    name: 'create_task',
    description: 'Create a new task in Ulrik. Requires title and project_id.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title (required)',
        },
        description: {
          type: 'string',
          description: 'Detailed task description',
        },
        project_id: {
          type: 'string',
          description: 'Project ID (required)',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority',
        },
        status: {
          type: 'string',
          enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
          description: 'Initial status (default: backlog)',
        },
        start_date: {
          type: 'string',
          description: 'When work begins (ISO date string)',
        },
        due_date: {
          type: 'string',
          description: 'When task should be completed (ISO date string)',
        },
        estimated_hours: {
          type: 'number',
          description: 'Estimated hours to complete',
        },
      },
      required: ['title', 'project_id'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks with optional filters. Returns up to 50 tasks by default.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Filter by project ID',
        },
        status: {
          type: 'string',
          enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
          description: 'Filter by status',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority',
        },
        archived: {
          type: 'boolean',
          description: 'Include archived tasks',
        },
      },
    },
  },
  {
    name: 'get_task',
    description: 'Get detailed information about a specific task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'update_task',
    description: 'Update any fields of an existing task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
        title: {
          type: 'string',
          description: 'Task title',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        status: {
          type: 'string',
          enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
          description: 'Task status',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority',
        },
        project_id: {
          type: 'string',
          description: 'Project ID',
        },
        start_date: {
          type: 'string',
          description: 'Start date (ISO string)',
        },
        due_date: {
          type: 'string',
          description: 'Due date (ISO string)',
        },
        estimated_hours: {
          type: 'number',
          description: 'Estimated hours',
        },
        archived: {
          type: 'boolean',
          description: 'Archive status',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task permanently.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'move_task_status',
    description: 'Move a task to a different status column.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
        new_status: {
          type: 'string',
          enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
          description: 'New status (required)',
        },
      },
      required: ['task_id', 'new_status'],
    },
  },
  {
    name: 'bulk_update_tasks',
    description: 'Update multiple tasks at once with the same changes.',
    inputSchema: {
      type: 'object',
      properties: {
        task_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of task IDs (required)',
        },
        updates: {
          type: 'object',
          description: 'Fields to update on all tasks',
          properties: {
            status: {
              type: 'string',
              enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            project_id: {
              type: 'string',
            },
            archived: {
              type: 'boolean',
            },
          },
        },
      },
      required: ['task_ids', 'updates'],
    },
  },
  // Dependencies
  {
    name: 'add_task_dependency',
    description: 'Add a dependency between tasks. The first task will be blocked by the second task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task that will be blocked (required)',
        },
        depends_on_task_id: {
          type: 'string',
          description: 'Task that must be completed first (required)',
        },
      },
      required: ['task_id', 'depends_on_task_id'],
    },
  },
  {
    name: 'remove_task_dependency',
    description: 'Remove a dependency between tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
        depends_on_task_id: {
          type: 'string',
          description: 'Dependency to remove (required)',
        },
      },
      required: ['task_id', 'depends_on_task_id'],
    },
  },
  {
    name: 'get_blocked_tasks',
    description: 'Get all tasks that are currently blocked by incomplete dependencies.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_dependency_chain',
    description: 'Get the full dependency chain for a task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
      },
      required: ['task_id'],
    },
  },
  // Subtasks
  {
    name: 'create_subtask',
    description: 'Create a subtask under a parent task.',
    inputSchema: {
      type: 'object',
      properties: {
        parent_task_id: {
          type: 'string',
          description: 'Parent task ID (required)',
        },
        title: {
          type: 'string',
          description: 'Subtask title (required)',
        },
        description: {
          type: 'string',
          description: 'Subtask description',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Subtask priority',
        },
        estimated_hours: {
          type: 'number',
          description: 'Estimated hours',
        },
      },
      required: ['parent_task_id', 'title'],
    },
  },
  {
    name: 'list_subtasks',
    description: 'List all subtasks of a parent task.',
    inputSchema: {
      type: 'object',
      properties: {
        parent_task_id: {
          type: 'string',
          description: 'Parent task ID (required)',
        },
      },
      required: ['parent_task_id'],
    },
  },
  // Recurring Tasks
  {
    name: 'create_recurring_template',
    description: 'Create a template for recurring tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Template title (required)',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        project_id: {
          type: 'string',
          description: 'Project ID (required)',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority',
        },
        estimated_hours: {
          type: 'number',
          description: 'Estimated hours',
        },
        recurrence_pattern: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Recurrence pattern (required)',
        },
        recurrence_config: {
          type: 'object',
          description: 'Recurrence configuration',
          properties: {
            day_of_week: {
              type: 'number',
              description: 'For weekly: 0=Sunday, 1=Monday, etc.',
            },
            day_of_month: {
              type: 'number',
              description: 'For monthly: day of month (1-31)',
            },
            time: {
              type: 'string',
              description: 'Time in HH:MM format (default: 09:00)',
            },
          },
        },
      },
      required: ['title', 'project_id', 'recurrence_pattern'],
    },
  },
  {
    name: 'list_recurring_templates',
    description: 'List all recurring task templates.',
    inputSchema: {
      type: 'object',
      properties: {
        active_only: {
          type: 'boolean',
          description: 'Only return active templates',
        },
      },
    },
  },
  {
    name: 'update_recurring_template',
    description: 'Update a recurring task template.',
    inputSchema: {
      type: 'object',
      properties: {
        template_id: {
          type: 'string',
          description: 'Template ID (required)',
        },
        title: {
          type: 'string',
          description: 'Template title',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        active: {
          type: 'boolean',
          description: 'Active status',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
        },
        estimated_hours: {
          type: 'number',
        },
      },
      required: ['template_id'],
    },
  },
  {
    name: 'delete_recurring_template',
    description: 'Delete a recurring task template.',
    inputSchema: {
      type: 'object',
      properties: {
        template_id: {
          type: 'string',
          description: 'Template ID (required)',
        },
      },
      required: ['template_id'],
    },
  },
  {
    name: 'trigger_recurring_generation',
    description: 'Manually generate a task from a recurring template.',
    inputSchema: {
      type: 'object',
      properties: {
        template_id: {
          type: 'string',
          description: 'Template ID (required)',
        },
      },
      required: ['template_id'],
    },
  },
  // AI Briefings
  {
    name: 'get_pending_briefings',
    description: 'Get all recurring tasks that need AI acknowledgment. CRITICAL: Call this regularly to see new recurring tasks.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'acknowledge_briefing',
    description: 'Acknowledge a recurring task briefing. MUST be called after reviewing a pending briefing.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'Task ID to acknowledge (required)',
        },
      },
      required: ['task_id'],
    },
  },
];

export async function handleTaskTool(name: string, args: any) {
  const apiUrl = CONFIG.ULRIK_API_URL;

  try {
    switch (name) {
      case 'create_task': {
        const response = await fetch(`${apiUrl}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to create task: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Created task: "${task.title}" (ID: ${task.id})\nStatus: ${task.status}\nPriority: ${task.priority}\nProject: ${task.project?.name || task.project_id}`,
            },
          ],
        };
      }

      case 'list_tasks': {
        const params = new URLSearchParams();
        if (args.project_id) params.append('project_id', args.project_id);
        if (args.status) params.append('status', args.status);
        if (args.priority) params.append('priority', args.priority);
        if (args.archived !== undefined) params.append('archived', String(args.archived));

        const response = await fetch(`${apiUrl}/api/tasks?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to list tasks: ${response.statusText}`);
        }

        const tasks = await response.json() as Task[];
        
        const summary = `Found ${tasks.length} task(s)`;
        const taskList = tasks
          .map((t: any) => `- [${t.status}] ${t.title} (${t.priority} priority) - ID: ${t.id} - Project: ${t.project?.name || t.project_id}`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `${summary}\n\n${taskList || 'No tasks found.'}`,
            },
          ],
        };
      }

      case 'get_task': {
        const response = await fetch(`${apiUrl}/api/tasks/${args.task_id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Task not found');
          }
          throw new Error(`Failed to get task: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(task, null, 2),
            },
          ],
        };
      }

      case 'update_task': {
        const { task_id, ...updates } = args;
        
        const response = await fetch(`${apiUrl}/api/tasks/${task_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to update task: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated task: "${task.title}" (ID: ${task.id})\n${JSON.stringify(updates, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_task': {
        const response = await fetch(`${apiUrl}/api/tasks/${args.task_id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Task not found');
          }
          throw new Error(`Failed to delete task: ${response.statusText}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Deleted task ID: ${args.task_id}`,
            },
          ],
        };
      }

      case 'move_task_status': {
        const response = await fetch(`${apiUrl}/api/tasks/${args.task_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: args.new_status }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to move task: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Moved task "${task.title}" to ${args.new_status}`,
            },
          ],
        };
      }

      case 'bulk_update_tasks': {
        const results = [];
        const errors = [];

        for (const taskId of args.task_ids) {
          try {
            const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(args.updates),
            });

            if (!response.ok) {
              errors.push(`Task ${taskId}: ${response.statusText}`);
            } else {
              const task = await response.json() as Task;
              results.push(task);
            }
          } catch (error: any) {
            errors.push(`Task ${taskId}: ${error.message}`);
          }
        }

        const summary = `✅ Updated ${results.length} task(s)`;
        const errorSummary = errors.length > 0 ? `\n⚠️ Errors: ${errors.length}\n${errors.join('\n')}` : '';

        return {
          content: [
            {
              type: 'text',
              text: `${summary}${errorSummary}`,
            },
          ],
        };
      }

      // Dependencies
      case 'add_task_dependency': {
        const response = await fetch(`${apiUrl}/api/tasks/dependencies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to add dependency: ${response.statusText}`);
        }

        const dependency = await response.json() as TaskDependency;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Added dependency: Task "${dependency.task!.title}" now depends on "${dependency.depends_on_task!.title}"`,
            },
          ],
        };
      }

      case 'remove_task_dependency': {
        const response = await fetch(
          `${apiUrl}/api/tasks/dependencies?task_id=${args.task_id}&depends_on_task_id=${args.depends_on_task_id}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to remove dependency: ${response.statusText}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Removed dependency`,
            },
          ],
        };
      }

      case 'get_blocked_tasks': {
        const response = await fetch(`${apiUrl}/api/tasks/dependencies?action=blocked`);

        if (!response.ok) {
          throw new Error(`Failed to get blocked tasks: ${response.statusText}`);
        }

        const tasks = await response.json() as Task[];
        const taskList = tasks
          .map((t: Task) => {
            const blockingTasks = t.dependencies!
              .filter((d: TaskDependency) => d.depends_on_task!.status !== 'done')
              .map((d: TaskDependency) => d.depends_on_task!.title)
              .join(', ');
            return `- ${t.title} (blocked by: ${blockingTasks})`;
          })
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${tasks.length} blocked task(s)\n\n${taskList || 'No blocked tasks.'}`,
            },
          ],
        };
      }

      case 'get_dependency_chain': {
        const response = await fetch(
          `${apiUrl}/api/tasks/dependencies?action=chain&task_id=${args.task_id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to get dependency chain: ${response.statusText}`);
        }

        const chain = await response.json() as Task[];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(chain, null, 2),
            },
          ],
        };
      }

      // Subtasks
      case 'create_subtask': {
        const { parent_task_id, ...taskData } = args;
        const response = await fetch(`${apiUrl}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...taskData,
            parent_task_id,
            status: 'todo',
          }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to create subtask: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Created subtask: "${task.title}" under parent task`,
            },
          ],
        };
      }

      case 'list_subtasks': {
        const response = await fetch(`${apiUrl}/api/tasks?project_id=${args.parent_task_id}`);

        if (!response.ok) {
          throw new Error(`Failed to list subtasks: ${response.statusText}`);
        }

        const allTasks = await response.json() as Task[];
        const subtasks = allTasks.filter((t: Task) => t.parent_task_id === args.parent_task_id);

        const taskList = subtasks
          .map((t: any) => `- [${t.status}] ${t.title}`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${subtasks.length} subtask(s)\n\n${taskList || 'No subtasks found.'}`,
            },
          ],
        };
      }

      // Recurring Tasks
      case 'create_recurring_template': {
        const response = await fetch(`${apiUrl}/api/recurring`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to create template: ${response.statusText}`);
        }

        const template = await response.json() as RecurringTaskTemplate;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Created recurring template: "${template.title}"\nPattern: ${template.recurrence_pattern}\nNext generation: ${template.next_generation_at}`,
            },
          ],
        };
      }

      case 'list_recurring_templates': {
        const params = new URLSearchParams();
        if (args.active_only) params.append('active', 'true');

        const response = await fetch(`${apiUrl}/api/recurring?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to list templates: ${response.statusText}`);
        }

        const templates = await response.json() as RecurringTaskTemplate[];
        const templateList = templates
          .map((t: RecurringTaskTemplate) => `- ${t.title} (${t.recurrence_pattern}, ${t.active ? 'active' : 'paused'})`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${templates.length} template(s)\n\n${templateList || 'No templates found.'}`,
            },
          ],
        };
      }

      case 'update_recurring_template': {
        const { template_id, ...updates } = args;
        const response = await fetch(`${apiUrl}/api/recurring/${template_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to update template: ${response.statusText}`);
        }

        const template = await response.json() as RecurringTaskTemplate;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated recurring template: "${template.title}"`,
            },
          ],
        };
      }

      case 'delete_recurring_template': {
        const response = await fetch(`${apiUrl}/api/recurring/${args.template_id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete template: ${response.statusText}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Deleted recurring template`,
            },
          ],
        };
      }

      case 'trigger_recurring_generation': {
        const response = await fetch(`${apiUrl}/api/recurring/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template_id: args.template_id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate task: ${response.statusText}`);
        }

        const result = await response.json() as { generated: number; tasks: Task[] };
        return {
          content: [
            {
              type: 'text',
              text: `✅ Generated ${result.generated} task(s) from template`,
            },
          ],
        };
      }

      // AI Briefings
      case 'get_pending_briefings': {
        const response = await fetch(`${apiUrl}/api/recurring/generate?action=pending-briefings`);

        if (!response.ok) {
          throw new Error(`Failed to get pending briefings: ${response.statusText}`);
        }

        const tasks = await response.json() as Task[];
        const taskList = tasks
          .map((t: Task) => `- ${t.title} (from template: ${t.recurring_template?.title || 'unknown'})`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `⚠️ ${tasks.length} task(s) need acknowledgment:\n\n${taskList || 'No pending briefings.'}`,
            },
          ],
        };
      }

      case 'acknowledge_briefing': {
        const response = await fetch(`${apiUrl}/api/tasks/${args.task_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ needs_ai_briefing: false }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to acknowledge briefing: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Acknowledged briefing for: "${task.title}"`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown task tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
