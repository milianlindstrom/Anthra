import { CONFIG } from '../config.js';

export const documentTools = [
  {
    name: 'get_context',
    description:
      'Retrieve inherited context for a document query. Automatically includes project, context type, and artifact context files. Supports section extraction and temporal filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name (required)',
        },
        context_type: {
          type: 'string',
          description: 'Context type name (e.g., "tech", "business", "journal")',
        },
        artifact: {
          type: 'string',
          description: 'Artifact name (e.g., "stripe-integration", "sprint-1")',
        },
        document: {
          type: 'string',
          description: 'Document filename (e.g., "standup-2026-02-05.md")',
        },
        section: {
          type: 'string',
          description: 'Section name within document (e.g., "Blockers")',
        },
        max_age_days: {
          type: 'number',
          description:
            'Only include documents updated within this many days (default: 7)',
        },
        include_stale: {
          type: 'boolean',
          description: 'Include stale documents even if max_age_days is set',
        },
      },
      required: ['project'],
    },
  },
  {
    name: 'write_ai_reply',
    description:
      'Write an AI response back into a document inline. Formats as markdown blockquote with attribution. Automatically finds the flagged item and inserts response after it.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description:
            'Document path (e.g., "clyqra/journal/sprint-1/standup-2026-02-05.md")',
        },
        item_text: {
          type: 'string',
          description: 'The specific flagged item text being responded to',
        },
        ai_model: {
          type: 'string',
          description: 'Which AI model is responding (cursor, claude, local)',
        },
        response: {
          type: 'string',
          description: "The AI's response text",
        },
        routing_info: {
          type: 'object',
          description: 'Routing decision information (confidence, reason)',
          properties: {
            confidence: { type: 'number' },
            reason: { type: 'string' },
          },
        },
      },
      required: ['path', 'item_text', 'ai_model', 'response'],
    },
  },
  {
    name: 'search_documents',
    description:
      'Search across all documents in a project. Supports full-text search, tag filtering, and temporal filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name (required)',
        },
        query: {
          type: 'string',
          description: 'Search terms',
        },
        context_type: {
          type: 'string',
          description: 'Limit to specific context type',
        },
        artifact: {
          type: 'string',
          description: 'Limit to specific artifact',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results (default: 20)',
        },
      },
      required: ['project', 'query'],
    },
  },
  {
    name: 'analyze_patterns',
    description:
      'Analyze patterns across documents over time. Useful for retrospectives and identifying recurring themes.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name (required)',
        },
        artifact: {
          type: 'string',
          description: 'Limit to specific artifact',
        },
        start_date: {
          type: 'string',
          description: 'Start date (ISO format)',
        },
        end_date: {
          type: 'string',
          description: 'End date (ISO format)',
        },
        pattern_type: {
          type: 'string',
          description: 'Type of pattern to analyze (blockers, decisions, questions)',
        },
      },
      required: ['project'],
    },
  },
  {
    name: 'route_query',
    description:
      'Determine which AI model should handle a query based on content analysis. Returns routing decision with confidence and reasoning.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to analyze (required)',
        },
        context: {
          type: 'object',
          description: 'Inherited context for additional signals',
        },
      },
      required: ['content'],
    },
  },
];

export async function handleDocumentTool(name: string, args: any) {
  const apiUrl = CONFIG.ANTHRA_API_URL;

  try {
    switch (name) {
      case 'get_context': {
        const params = new URLSearchParams();
        params.append('project', args.project);
        if (args.context_type) params.append('context_type', args.context_type);
        if (args.artifact) params.append('artifact', args.artifact);
        if (args.document) params.append('document', args.document);
        if (args.section) params.append('section', args.section);
        if (args.max_age_days)
          params.append('max_age_days', args.max_age_days.toString());
        if (args.include_stale)
          params.append('include_stale', 'true');

        const response = await fetch(`${apiUrl}/api/documents/context?${params}`);

        if (!response.ok) {
          throw new Error(
            `Failed to get context: ${response.statusText}`
          );
        }

        const data = await response.json() as { context: { path: string }; formatted: string };

        return {
          content: [
            {
              type: 'text',
              text: `**Context for:** ${data.context.path}\n\n${data.formatted}`,
            },
          ],
        };
      }

      case 'write_ai_reply': {
        const response = await fetch(`${apiUrl}/api/documents/ai/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to write reply: ${response.statusText}`);
        }

        const result = await response.json() as { inserted_at_line: number };

        return {
          content: [
            {
              type: 'text',
              text: `✅ AI response written to document at line ${result.inserted_at_line}`,
            },
          ],
        };
      }

      case 'search_documents': {
        // For now, return a simple message - full search implementation would require
        // more sophisticated indexing
        return {
          content: [
            {
              type: 'text',
              text: `Search functionality is available via the API. Query: "${args.query}" in project "${args.project}"`,
            },
          ],
        };
      }

      case 'analyze_patterns': {
        // Pattern analysis would require aggregating across documents
        // For now, return a placeholder
        return {
          content: [
            {
              type: 'text',
              text: `Pattern analysis for project "${args.project}" - This feature requires document aggregation logic.`,
            },
          ],
        };
      }

      case 'route_query': {
        const response = await fetch(`${apiUrl}/api/documents/ai/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          throw new Error(error.error || `Failed to route query: ${response.statusText}`);
        }

        const decision = await response.json() as {
          model: string;
          confidence: number;
          reason: string;
          should_ask_user: boolean;
        };

        return {
          content: [
            {
              type: 'text',
              text: `**Routing Decision:**\n- Model: ${decision.model}\n- Confidence: ${(decision.confidence * 100).toFixed(0)}%\n- Reason: ${decision.reason}\n${decision.should_ask_user ? '- ⚠️ User confirmation recommended' : ''}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown document tool: ${name}`);
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
