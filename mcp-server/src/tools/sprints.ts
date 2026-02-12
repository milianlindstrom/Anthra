import { CONFIG } from '../config.js';
import type { 
  Sprint, 
  SprintTask,
  SprintStatus,
  CreateSprintInput,
  UpdateSprintInput
} from '../../shared/types.js';

export const sprintTools = [
  {
    name: 'list_sprints',
    description: 'List all sprints with optional filters. Returns sprints with task counts and story points.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Filter by project ID (optional)',
        },
        status: {
          type: 'string',
          enum: ['planned', 'active', 'completed'],
          description: 'Filter by sprint status (optional)',
        },
      },
    },
  },
  {
    name: 'create_sprint',
    description: 'Create a new sprint. Requires name, start_date, end_date, and project_id.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Sprint name (required)',
        },
        description: {
          type: 'string',
          description: 'Sprint description',
        },
        start_date: {
          type: 'string',
          description: 'Sprint start date (ISO date string, required)',
        },
        end_date: {
          type: 'string',
          description: 'Sprint end date (ISO date string, required)',
        },
        project_id: {
          type: 'string',
          description: 'Project ID (required)',
        },
        status: {
          type: 'string',
          enum: ['planned', 'active', 'completed'],
          description: 'Sprint status (default: planned)',
        },
      },
      required: ['name', 'start_date', 'end_date', 'project_id'],
    },
  },
  {
    name: 'get_sprint',
    description: 'Get detailed information about a sprint, including all tasks and velocity metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
      },
      required: ['sprint_id'],
    },
  },
  {
    name: 'update_sprint',
    description: 'Update sprint details.',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
        name: {
          type: 'string',
          description: 'Sprint name',
        },
        description: {
          type: 'string',
          description: 'Sprint description',
        },
        start_date: {
          type: 'string',
          description: 'Sprint start date (ISO date string)',
        },
        end_date: {
          type: 'string',
          description: 'Sprint end date (ISO date string)',
        },
        status: {
          type: 'string',
          enum: ['planned', 'active', 'completed'],
          description: 'Sprint status',
        },
      },
      required: ['sprint_id'],
    },
  },
  {
    name: 'delete_sprint',
    description: 'Delete a sprint and all its associated sprint tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
      },
      required: ['sprint_id'],
    },
  },
  {
    name: 'add_task_to_sprint',
    description: 'Add a task to a sprint with optional story points.',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
        story_points: {
          type: 'number',
          description: 'Story point estimate (optional)',
        },
        order: {
          type: 'number',
          description: 'Order within sprint (optional, auto-assigned if not provided)',
        },
        status: {
          type: 'string',
          description: 'Status within sprint context (optional, default: todo)',
        },
      },
      required: ['sprint_id', 'task_id'],
    },
  },
  {
    name: 'remove_task_from_sprint',
    description: 'Remove a task from a sprint.',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
      },
      required: ['sprint_id', 'task_id'],
    },
  },
  {
    name: 'update_sprint_task',
    description: 'Update a task within a sprint (story points, order, status).',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
        task_id: {
          type: 'string',
          description: 'Task ID (required)',
        },
        story_points: {
          type: 'number',
          description: 'Story point estimate',
        },
        order: {
          type: 'number',
          description: 'Order within sprint',
        },
        status: {
          type: 'string',
          description: 'Status within sprint context',
        },
      },
      required: ['sprint_id', 'task_id'],
    },
  },
  {
    name: 'get_sprint_velocity',
    description: 'Get velocity metrics for a sprint including planned points, completed points, and completion rates.',
    inputSchema: {
      type: 'object',
      properties: {
        sprint_id: {
          type: 'string',
          description: 'Sprint ID (required)',
        },
      },
      required: ['sprint_id'],
    },
  },
];

export async function handleSprintTool(name: string, args: any) {
  const apiUrl = CONFIG.ANTHRA_API_URL;

  try {
    switch (name) {
      case 'list_sprints': {
        const params = new URLSearchParams();
        if (args.project_id) {
          params.append('project_id', args.project_id);
        }
        if (args.status) {
          params.append('status', args.status);
        }

        const response = await fetch(`${apiUrl}/api/sprints?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to list sprints: ${response.statusText}`);
        }

        const sprints = await response.json() as (Sprint & { total_points?: number })[];
        
        const summary = `Found ${sprints.length} sprint(s)`;
        const sprintList = sprints
          .map((s: Sprint & { total_points?: number }) => {
            const dates = `${new Date(s.start_date).toLocaleDateString()} - ${new Date(s.end_date).toLocaleDateString()}`;
            return `- ${s.name} (${s.status}) - ${dates} - ${s._count?.sprint_tasks || 0} tasks, ${s.total_points || 0} points - ID: ${s.id}`;
          })
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `${summary}\n\n${sprintList || 'No sprints found.'}`,
            },
          ],
        };
      }

      case 'create_sprint': {
        const response = await fetch(`${apiUrl}/api/sprints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to create sprint: ${response.statusText}`);
        }

        const sprint = await response.json() as Sprint;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Created sprint: "${sprint.name}" (ID: ${sprint.id})\nStatus: ${sprint.status}\nDates: ${new Date(sprint.start_date).toLocaleDateString()} - ${new Date(sprint.end_date).toLocaleDateString()}`,
            },
          ],
        };
      }

      case 'get_sprint': {
        const response = await fetch(`${apiUrl}/api/sprints/${args.sprint_id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Sprint not found');
          }
          throw new Error(`Failed to get sprint: ${response.statusText}`);
        }

        const sprint = await response.json() as Sprint & { total_points?: number };
        
        const taskCount = sprint._count?.sprint_tasks || 0;
        const totalPoints = sprint.total_points || 0;
        const dates = `${new Date(sprint.start_date).toLocaleDateString()} - ${new Date(sprint.end_date).toLocaleDateString()}`;
        
        return {
          content: [
            {
              type: 'text',
              text: `Sprint: ${sprint.name}\nStatus: ${sprint.status}\nDates: ${dates}\nTasks: ${taskCount}\nStory Points: ${totalPoints}\n\n${sprint.description || 'No description'}\n\n${JSON.stringify(sprint, null, 2)}`,
            },
          ],
        };
      }

      case 'update_sprint': {
        const { sprint_id, ...updates } = args;
        
        const response = await fetch(`${apiUrl}/api/sprints/${sprint_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to update sprint: ${response.statusText}`);
        }

        const sprint = await response.json() as Sprint;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated sprint: "${sprint.name}" (ID: ${sprint.id})`,
            },
          ],
        };
      }

      case 'delete_sprint': {
        const response = await fetch(`${apiUrl}/api/sprints/${args.sprint_id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to delete sprint: ${response.statusText}`);
        }

        const result = await response.json() as { success: boolean; message: string };
        return {
          content: [
            {
              type: 'text',
              text: `✅ ${result.message}`,
            },
          ],
        };
      }

      case 'add_task_to_sprint': {
        const { sprint_id, task_id, ...taskData } = args;
        
        const response = await fetch(`${apiUrl}/api/sprints/${sprint_id}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id,
            ...taskData,
          }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to add task to sprint: ${response.statusText}`);
        }

        const sprintTask = await response.json() as SprintTask;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Added task "${sprintTask.task?.title || task_id}" to sprint\nStory Points: ${sprintTask.story_points || 'Not set'}\nOrder: ${sprintTask.order}`,
            },
          ],
        };
      }

      case 'remove_task_from_sprint': {
        const { sprint_id, task_id } = args;
        
        const response = await fetch(`${apiUrl}/api/sprints/${sprint_id}/tasks?task_id=${task_id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to remove task from sprint: ${response.statusText}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Removed task from sprint`,
            },
          ],
        };
      }

      case 'update_sprint_task': {
        const { sprint_id, task_id, ...updates } = args;
        
        const response = await fetch(`${apiUrl}/api/sprints/${sprint_id}/tasks`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id,
            ...updates,
          }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to update sprint task: ${response.statusText}`);
        }

        const sprintTask = await response.json() as SprintTask;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated task in sprint\nStory Points: ${sprintTask.story_points || 'Not set'}\nOrder: ${sprintTask.order}\nStatus: ${sprintTask.status}`,
            },
          ],
        };
      }

      case 'get_sprint_velocity': {
        const response = await fetch(`${apiUrl}/api/sprints/${args.sprint_id}/velocity`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Sprint not found');
          }
          throw new Error(`Failed to get sprint velocity: ${response.statusText}`);
        }

        const velocity = await response.json() as any;
        
        return {
          content: [
            {
              type: 'text',
              text: `Sprint Velocity Metrics:\nPlanned Points: ${velocity.planned_points}\nCompleted Points: ${velocity.completed_points}\nCompleted Tasks: ${velocity.completed_tasks}/${velocity.total_tasks}\nCompletion Rate: ${velocity.completion_rate?.toFixed(1) || 0}%\nPoints Completion Rate: ${velocity.points_completion_rate?.toFixed(1) || 0}%`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown sprint tool: ${name}`);
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
