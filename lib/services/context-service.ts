/**
 * Context Service
 * 
 * Assembles inherited context by walking up the hierarchy:
 * Project → ContextType → Artifact → Document → Section
 * 
 * Each level's .context.md file is automatically included.
 */

import * as db from './document-db';
import type { Prisma } from '@prisma/client';

export interface ContextQuery {
  project: string; // Required
  context_type?: string;
  artifact?: string;
  document?: string;
  section?: string;
  max_age_days?: number;
  include_stale?: boolean;
}

export interface InheritedContext {
  project_context?: string;
  type_context?: string;
  artifact_context?: string;
  document_content: string;
  metadata?: Record<string, any>;
  path: string;
  staleness_warning?: string;
}

/**
 * Extract a specific section from markdown content
 */
function extractSection(content: string, sectionName: string): string {
  const lines = content.split('\n');
  const sectionMap: Map<string, { start: number; end: number }> = new Map();

  let currentSection: { name: string; level: number; start: number } | null =
    null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch) {
      const level = headerMatch[1].length;
      const name = headerMatch[2].trim();

      // Close previous section
      if (currentSection) {
        sectionMap.set(currentSection.name, {
          start: currentSection.start,
          end: i,
        });
      }

      // Start new section
      currentSection = { name, level, start: i };
    }
  }

  // Close last section
  if (currentSection) {
    sectionMap.set(currentSection.name, {
      start: currentSection.start,
      end: lines.length,
    });
  }

  // Find matching section (case-insensitive, partial match)
  const targetSection = Array.from(sectionMap.keys()).find(
    (key) => key.toLowerCase() === sectionName.toLowerCase()
  );

  if (!targetSection) {
    // If section not found, return full content
    return content;
  }

  const sectionRange = sectionMap.get(targetSection)!;
  const sectionLines = lines.slice(sectionRange.start, sectionRange.end);

  // Also include any content before the first section (frontmatter, intro)
  if (sectionRange.start > 0) {
    const introLines = lines.slice(0, sectionRange.start);
    return [...introLines, ...sectionLines].join('\n');
  }

  return sectionLines.join('\n');
}

/**
 * Get inherited context for a query
 */
export async function getContext(
  query: ContextQuery
): Promise<InheritedContext | null> {
  // 1. Get project
  const project = await db.getProjectByName(query.project);
  if (!project) {
    return null;
  }

  const context: InheritedContext = {
    document_content: '',
    path: query.project,
  };

  // 2. Get project-level context file
  const projectContext = await db.getProjectContext(project.id);
  if (projectContext) {
    context.project_context = projectContext.content;
  }

  // 3. If context type specified, get it and its context file
  if (query.context_type) {
    const contextType = await db.getContextType(project.id, query.context_type);
    if (!contextType) {
      throw new Error(
        `Context type "${query.context_type}" not found in project "${query.project}"`
      );
    }

    context.path += `/${query.context_type}`;

    const typeContext = await db.getContextTypeContext(contextType.id);
    if (typeContext) {
      context.type_context = typeContext.content;
    }

    // 4. If artifact specified, get it and its context file
    if (query.artifact) {
      const artifact = await db.getArtifact(
        contextType.id,
        query.artifact
      );
      if (!artifact) {
        throw new Error(
          `Artifact "${query.artifact}" not found in context type "${query.context_type}"`
        );
      }

      context.path += `/${query.artifact}`;

      const artifactContext = await db.getArtifactContext(artifact.id);
      if (artifactContext) {
        context.artifact_context = artifactContext.content;
      }

      // 5. If document specified, get it
      if (query.document) {
        const document = await db.getDocument(artifact.id, query.document);
        if (!document) {
          throw new Error(
            `Document "${query.document}" not found in artifact "${query.artifact}"`
          );
        }

        context.path += `/${query.document}`;

        // Parse metadata
        if (document.metadata) {
          try {
            context.metadata = JSON.parse(document.metadata);
          } catch (e) {
            // Invalid JSON, ignore
          }
        }

        // Check staleness
        if (!query.include_stale && query.max_age_days !== undefined) {
          const maxAge = query.max_age_days || 7;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - maxAge);

          if (document.updated_at < cutoffDate) {
            const daysOld = Math.floor(
              (Date.now() - document.updated_at.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            context.staleness_warning = `⚠️ This document is ${daysOld} days old. Consider updating it for more accurate context.`;
          }
        }

        // Extract section if specified
        let documentContent = document.content;
        if (query.section) {
          documentContent = extractSection(document.content, query.section);
          context.path += `#${query.section}`;
        }

        context.document_content = documentContent;
      }
    }
  }

  return context;
}

/**
 * Format inherited context as a single markdown string for AI consumption
 */
export function formatContextForAI(context: InheritedContext): string {
  const parts: string[] = [];

  if (context.project_context) {
    parts.push('# Project Context\n');
    parts.push(context.project_context);
    parts.push('\n');
  }

  if (context.type_context) {
    parts.push('# Context Type Context\n');
    parts.push(context.type_context);
    parts.push('\n');
  }

  if (context.artifact_context) {
    parts.push('# Artifact Context\n');
    parts.push(context.artifact_context);
    parts.push('\n');
  }

  if (context.staleness_warning) {
    parts.push(`\n${context.staleness_warning}\n\n`);
  }

  parts.push('# Current Document\n');
  parts.push(`Path: ${context.path}\n\n`);
  parts.push(context.document_content);

  return parts.join('\n');
}
