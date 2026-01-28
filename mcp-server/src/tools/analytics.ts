import { CONFIG } from '../config.js';
import type { Task } from '../../shared/types.js';

export const analyticsTools = [
  {
    name: 'get_task_summary',
    description: 'Get a comprehensive summary of tasks including counts by status, priority, hours estimated, and overdue tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Filter by project ID (optional)',
        },
      },
    },
  },
  {
    name: 'what_should_i_work_on',
    description: 'Get AI-curated task recommendations based on priorities, due dates, and available hours. Returns 2-3 concrete suggestions.',
    inputSchema: {
      type: 'object',
      properties: {
        available_hours: {
          type: 'number',
          description: 'How many hours you have available (optional)',
        },
        priority_filter: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority (optional)',
        },
        project_id: {
          type: 'string',
          description: 'Filter by project ID (optional)',
        },
      },
    },
  },
  {
    name: 'analyze_project_health',
    description: 'Analyze project health including completion rate, overdue count, velocity, and overall health score.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Project ID (required)',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'suggest_task_breakdown',
    description: 'Analyze a task and suggest how to break it down into smaller subtasks based on description and estimated hours.',
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
];

export async function handleAnalyticsTool(name: string, args: any) {
  const apiUrl = CONFIG.ULRIK_API_URL;

  try {
    switch (name) {
      case 'get_task_summary': {
        const params = new URLSearchParams();
        if (args.project_id) {
          params.append('project_id', args.project_id);
        }

        const response = await fetch(`${apiUrl}/api/tasks?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const tasks = await response.json() as Task[];
        
        // Analyze tasks
        const summary = {
          total_tasks: tasks.length,
          by_status: {
            backlog: 0,
            todo: 0,
            'in-progress': 0,
            review: 0,
            done: 0,
          },
          by_priority: {
            low: 0,
            medium: 0,
            high: 0,
          },
          total_hours_estimated: 0,
          overdue_count: 0,
          due_soon: [] as any[],
        };

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        tasks.forEach((task: any) => {
          summary.by_status[task.status as keyof typeof summary.by_status]++;
          summary.by_priority[task.priority as keyof typeof summary.by_priority]++;
          
          if (task.estimated_hours) {
            summary.total_hours_estimated += task.estimated_hours;
          }

          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            if (dueDate < now && task.status !== 'done') {
              summary.overdue_count++;
            }
            if (dueDate >= now && dueDate <= sevenDaysFromNow && task.status !== 'done') {
              summary.due_soon.push({
                id: task.id,
                title: task.title,
                due_date: task.due_date,
                priority: task.priority,
              });
            }
          }
        });

        return {
          content: [
            {
              type: 'text',
              text: `📊 Task Summary\n\nTotal Tasks: ${summary.total_tasks}\n\nBy Status:\n- Backlog: ${summary.by_status.backlog}\n- Todo: ${summary.by_status.todo}\n- In Progress: ${summary.by_status['in-progress']}\n- Review: ${summary.by_status.review}\n- Done: ${summary.by_status.done}\n\nBy Priority:\n- High: ${summary.by_priority.high}\n- Medium: ${summary.by_priority.medium}\n- Low: ${summary.by_priority.low}\n\nTotal Hours Estimated: ${summary.total_hours_estimated}h\nOverdue Tasks: ${summary.overdue_count}\n\nDue Soon (next 7 days): ${summary.due_soon.length}\n${summary.due_soon.map(t => `- [${t.priority}] ${t.title} (Due: ${t.due_date})`).join('\n')}`,
            },
          ],
        };
      }

      case 'what_should_i_work_on': {
        const params = new URLSearchParams();
        if (args.project_id) {
          params.append('project_id', args.project_id);
        }

        const response = await fetch(`${apiUrl}/api/tasks?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const tasks = await response.json() as Task[];
        
        // Filter to actionable tasks (todo or in-progress)
        let actionableTasks = tasks.filter((t: any) => 
          t.status === 'todo' || t.status === 'in-progress'
        );

        // Apply priority filter if specified
        if (args.priority_filter) {
          actionableTasks = actionableTasks.filter((t: any) => t.priority === args.priority_filter);
        }

        const now = new Date();
        
        // Score tasks based on various factors
        const scoredTasks = actionableTasks.map((task: any) => {
          let score = 0;
          
          // Overdue tasks get highest priority
          if (task.due_date && new Date(task.due_date) < now) {
            score += 1000;
          }
          
          // Due within 24 hours
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
              score += 500;
            }
          }
          
          // Priority scoring
          if (task.priority === 'high') score += 100;
          if (task.priority === 'medium') score += 50;
          if (task.priority === 'low') score += 10;
          
          // In-progress tasks get a boost
          if (task.status === 'in-progress') score += 200;
          
          // Consider available hours
          if (args.available_hours && task.estimated_hours) {
            if (task.estimated_hours <= args.available_hours) {
              score += 30;
            }
          }
          
          return { task, score };
        });

        // Sort by score and take top 3
        scoredTasks.sort((a: { task: Task; score: number }, b: { task: Task; score: number }) => b.score - a.score);
        const recommendations = scoredTasks.slice(0, 3);

        if (recommendations.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '🎉 No actionable tasks found! You\'re all caught up or there are no tasks matching your criteria.',
              },
            ],
          };
        }

        const recommendationText = recommendations.map((rec: { task: Task; score: number }, idx: number) => {
          const task = rec.task;
          let reason = '';
          
          if (task.due_date && new Date(task.due_date) < now) {
            reason = '⚠️ OVERDUE';
          } else if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursUntilDue <= 24) {
              reason = '🔥 Due within 24 hours';
            } else {
              reason = `Due: ${task.due_date}`;
            }
          } else if (task.status === 'in-progress') {
            reason = '🔄 Already in progress';
          } else if (task.priority === 'high') {
            reason = '🔴 High priority';
          }
          
          return `${idx + 1}. ${task.title}\n   Priority: ${task.priority} | Status: ${task.status}\n   ${reason}${task.estimated_hours ? `\n   Estimated: ${task.estimated_hours}h` : ''}`;
        }).join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `💡 Recommended Tasks to Work On:\n\n${recommendationText}`,
            },
          ],
        };
      }

      case 'analyze_project_health': {
        const response = await fetch(`${apiUrl}/api/tasks?project_id=${args.project_id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project tasks: ${response.statusText}`);
        }

        const tasks = await response.json() as Task[];
        
        if (tasks.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '⚠️ No tasks found for this project.',
              },
            ],
          };
        }

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let completedCount = 0;
        let overdueCount = 0;
        let totalAge = 0;
        let blockedCount = 0;
        let recentlyCompleted = 0;

        tasks.forEach((task: any) => {
          if (task.status === 'done') {
            completedCount++;
            
            const updatedAt = new Date(task.updated_at);
            if (updatedAt >= oneWeekAgo) {
              recentlyCompleted++;
            }
          }
          
          if (task.due_date && new Date(task.due_date) < now && task.status !== 'done') {
            overdueCount++;
          }
          
          // Calculate task age
          const createdAt = new Date(task.created_at);
          const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          totalAge += ageInDays;
          
          // Consider tasks stuck in backlog or review as potentially blocked
          if ((task.status === 'backlog' || task.status === 'review') && ageInDays > 14) {
            blockedCount++;
          }
        });

        const completionRate = (completedCount / tasks.length) * 100;
        const averageTaskAge = totalAge / tasks.length;
        
        let healthScore: 'healthy' | 'at-risk' | 'critical';
        if (overdueCount === 0 && completionRate > 60 && blockedCount === 0) {
          healthScore = 'healthy';
        } else if (overdueCount > 3 || completionRate < 30 || blockedCount > 5) {
          healthScore = 'critical';
        } else {
          healthScore = 'at-risk';
        }

        const healthEmoji = healthScore === 'healthy' ? '✅' : healthScore === 'at-risk' ? '⚠️' : '🔴';

        return {
          content: [
            {
              type: 'text',
              text: `${healthEmoji} Project Health Analysis\n\nCompletion Rate: ${completionRate.toFixed(1)}% (${completedCount}/${tasks.length} tasks)\nOverdue Tasks: ${overdueCount}\nAverage Task Age: ${averageTaskAge.toFixed(1)} days\nPotentially Blocked Tasks: ${blockedCount}\nVelocity (last 7 days): ${recentlyCompleted} tasks completed\n\nHealth Score: ${healthScore.toUpperCase()}\n\n${healthScore === 'critical' ? '⚠️ Action needed: This project has significant issues that need attention.' : healthScore === 'at-risk' ? '⚠️ Monitor closely: This project may need some attention.' : '✅ Looking good! Keep up the momentum.'}`,
            },
          ],
        };
      }

      case 'suggest_task_breakdown': {
        const response = await fetch(`${apiUrl}/api/tasks/${args.task_id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Task not found');
          }
          throw new Error(`Failed to get task: ${response.statusText}`);
        }

        const task = await response.json() as Task;
        
        // Analyze task complexity
        const isLarge = (task.estimated_hours && task.estimated_hours > 8) || 
                       (task.description && task.description.length > 300);

        if (!isLarge) {
          return {
            content: [
              {
                type: 'text',
                text: `This task appears to be manageable as-is. It has ${task.estimated_hours || 'no'} estimated hours${task.description ? ' and a concise description' : ''}.\n\nIf you still want to break it down, consider dividing it into:\n1. Research/Planning phase\n2. Implementation phase\n3. Testing/Review phase`,
              },
            ],
          };
        }

        const suggestions = [];
        
        if (task.estimated_hours) {
          const hours = task.estimated_hours;
          const numSubtasks = Math.ceil(hours / 4); // Aim for 4-hour chunks
          
          suggestions.push(`📋 Suggested Breakdown (based on ${hours}h estimate):\n`);
          suggestions.push(`Consider breaking into ${numSubtasks} subtasks of ~4 hours each:\n`);
          
          for (let i = 1; i <= numSubtasks; i++) {
            suggestions.push(`${i}. ${task.title} - Part ${i}/${numSubtasks}`);
          }
        }

        suggestions.push('\n💡 General breakdown strategy:');
        suggestions.push('1. Requirements & Design');
        suggestions.push('2. Core Implementation');
        suggestions.push('3. Edge Cases & Error Handling');
        suggestions.push('4. Testing & Documentation');
        suggestions.push('5. Code Review & Refinement');

        return {
          content: [
            {
              type: 'text',
              text: suggestions.join('\n'),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown analytics tool: ${name}`);
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
