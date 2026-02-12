import { CONFIG } from '../config.js';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../../shared/types.js';

export const projectTools = [
  {
    name: 'list_projects',
    description: 'List all projects. Excludes archived projects by default.',
    inputSchema: {
      type: 'object',
      properties: {
        include_archived: {
          type: 'boolean',
          description: 'Include archived projects (default: false)',
        },
      },
    },
  },
  {
    name: 'create_project',
    description: 'Create a new project workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Project name (required)',
        },
        description: {
          type: 'string',
          description: 'Project description',
        },
        color: {
          type: 'string',
          description: 'Project color (hex code, default: #6366f1)',
        },
        icon: {
          type: 'string',
          description: 'Project icon (emoji, default: 📁)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_project',
    description: 'Get detailed information about a project, including task count.',
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
    name: 'update_project',
    description: 'Update project details.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Project ID (required)',
        },
        name: {
          type: 'string',
          description: 'Project name',
        },
        description: {
          type: 'string',
          description: 'Project description',
        },
        color: {
          type: 'string',
          description: 'Project color (hex code)',
        },
        icon: {
          type: 'string',
          description: 'Project icon (emoji)',
        },
        archived: {
          type: 'boolean',
          description: 'Archive status',
        },
      },
      required: ['project_id'],
    },
  },
];

export async function handleProjectTool(name: string, args: any) {
  const apiUrl = CONFIG.ANTHRA_API_URL;

  try {
    switch (name) {
      case 'list_projects': {
        const params = new URLSearchParams();
        if (args.include_archived) {
          params.append('archived', 'true');
        }

        const response = await fetch(`${apiUrl}/api/projects?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to list projects: ${response.statusText}`);
        }

        const projects = await response.json() as Project[];
        
        const summary = `Found ${projects.length} project(s)`;
        const projectList = projects
          .map((p: Project) => `- ${p.icon} ${p.name} (${p._count?.tasks || 0} tasks) - ID: ${p.id}`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `${summary}\n\n${projectList || 'No projects found.'}`,
            },
          ],
        };
      }

      case 'create_project': {
        const response = await fetch(`${apiUrl}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to create project: ${response.statusText}`);
        }

        const project = await response.json() as Project;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Created project: "${project.name}" (ID: ${project.id})\nSlug: ${project.slug}\nColor: ${project.color}\nIcon: ${project.icon}`,
            },
          ],
        };
      }

      case 'get_project': {
        const response = await fetch(`${apiUrl}/api/projects/${args.project_id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error(`Failed to get project: ${response.statusText}`);
        }

        const project = await response.json() as Project;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'update_project': {
        const { project_id, ...updates } = args;
        
        const response = await fetch(`${apiUrl}/api/projects/${project_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to update project: ${response.statusText}`);
        }

        const project = await response.json() as Project;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated project: "${project.name}" (ID: ${project.id})`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown project tool: ${name}`);
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
