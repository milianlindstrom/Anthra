/**
 * Document Manager Service
 * 
 * High-level document management operations:
 * - Path-based operations (create from path string)
 * - Auto-create missing hierarchy levels
 * - Metadata management
 * - Template system
 */

import * as db from './document-db';
import { getProjectByName } from './document-db';

export interface DocumentPath {
  project: string;
  context_type: string;
  artifact: string;
  filename: string;
}

/**
 * Parse a path string like "clyqra/journal/sprint-1/standup-2026-02-05.md"
 */
export function parsePath(path: string): DocumentPath {
  const parts = path.split('/');
  if (parts.length !== 4) {
    throw new Error(
      `Invalid path format. Expected: "project/context-type/artifact/filename", got: "${path}"`
    );
  }

  return {
    project: parts[0],
    context_type: parts[1],
    artifact: parts[2],
    filename: parts[3],
  };
}

/**
 * Create document from path, auto-creating missing hierarchy levels
 */
export async function createDocumentFromPath(
  path: string,
  content: string,
  metadata?: Record<string, any>
) {
  const parsed = parsePath(path);

  // 1. Get or create project
  let project = await getProjectByName(parsed.project);
  if (!project) {
    // Project must exist - don't auto-create
    throw new Error(`Project "${parsed.project}" not found`);
  }

  // 2. Get or create context type
  let contextType = await db.getContextType(project.id, parsed.context_type);
  if (!contextType) {
    contextType = await db.createContextType({
      project_id: project.id,
      name: parsed.context_type,
    });
  }

  // 3. Get or create artifact
  let artifact = await db.getArtifact(contextType.id, parsed.artifact);
  if (!artifact) {
    artifact = await db.createArtifact({
      context_type_id: contextType.id,
      name: parsed.artifact,
      status: 'active',
    });
  }

  // 4. Create document
  const document = await db.createDocument({
    artifact_id: artifact.id,
    filename: parsed.filename,
    content,
    metadata,
  });

  return {
    document,
    path: `${parsed.project}/${parsed.context_type}/${parsed.artifact}/${parsed.filename}`,
  };
}

/**
 * Load document by path
 */
export async function loadDocumentByPath(path: string) {
  const parsed = parsePath(path);

  const project = await getProjectByName(parsed.project);
  if (!project) {
    throw new Error(`Project "${parsed.project}" not found`);
  }

  const contextType = await db.getContextType(project.id, parsed.context_type);
  if (!contextType) {
    throw new Error(
      `Context type "${parsed.context_type}" not found in project "${parsed.project}"`
    );
  }

  const artifact = await db.getArtifact(contextType.id, parsed.artifact);
  if (!artifact) {
    throw new Error(
      `Artifact "${parsed.artifact}" not found in context type "${parsed.context_type}"`
    );
  }

  const document = await db.getDocument(artifact.id, parsed.filename);
  if (!document) {
    throw new Error(
      `Document "${parsed.filename}" not found in artifact "${parsed.artifact}"`
    );
  }

  let metadata: Record<string, any> = {};
  if (document.metadata) {
    try {
      metadata = JSON.parse(document.metadata);
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  return {
    document,
    metadata,
    path: `${parsed.project}/${parsed.context_type}/${parsed.artifact}/${parsed.filename}`,
  };
}

/**
 * Update document by path
 */
export async function updateDocumentByPath(
  path: string,
  updates: {
    content?: string;
    metadata?: Record<string, any>;
  }
) {
  const parsed = parsePath(path);

  const project = await getProjectByName(parsed.project);
  if (!project) {
    throw new Error(`Project "${parsed.project}" not found`);
  }

  const contextType = await db.getContextType(project.id, parsed.context_type);
  if (!contextType) {
    throw new Error(
      `Context type "${parsed.context_type}" not found in project "${parsed.project}"`
    );
  }

  const artifact = await db.getArtifact(contextType.id, parsed.artifact);
  if (!artifact) {
    throw new Error(
      `Artifact "${parsed.artifact}" not found in context type "${parsed.context_type}"`
    );
  }

  return db.updateDocument(artifact.id, parsed.filename, updates);
}

/**
 * Parse YAML frontmatter from markdown
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, any>;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = match[1];
  const body = match[2];

  // Simple YAML parser (for production, use a proper YAML library)
  const frontmatter: Record<string, any> = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Parse arrays (simple format: - item1, - item2)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1);
        frontmatter[key] = value.split(',').map((v) => v.trim());
      } else {
        frontmatter[key] = value;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Merge frontmatter with database metadata
 */
export function mergeMetadata(
  frontmatter: Record<string, any>,
  dbMetadata?: Record<string, any>
): Record<string, any> {
  return {
    ...(dbMetadata || {}),
    ...frontmatter,
  };
}

/**
 * Document templates
 */
export const TEMPLATES = {
  standup: {
    content: `---
date: ${new Date().toISOString().split('T')[0]}
status: draft
tags: [standup]
---

# Standup ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Blockers

- 

## Tasks

- 

## Notes

- 
`,
  },
  'tech-spec': {
    content: `---
date: ${new Date().toISOString().split('T')[0]}
status: draft
tags: [tech-spec]
---

# Technical Specification

## Goal

## Current State

## Open Questions

## Decisions

`,
  },
  retro: {
    content: `---
date: ${new Date().toISOString().split('T')[0]}
status: draft
tags: [retrospective]
---

# Retrospective

## What Went Well

## What Didn't Go Well

## Action Items

## Patterns

`,
  },
  'business-context': {
    content: `---
date: ${new Date().toISOString().split('T')[0]}
status: draft
tags: [business]
---

# Business Context

## Overview

## Market Position

## Key Metrics

## Strategic Priorities

`,
  },
};

/**
 * Create document from template
 */
export async function createFromTemplate(
  path: string,
  templateName: keyof typeof TEMPLATES
) {
  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const { frontmatter, body } = parseFrontmatter(template.content);

  return createDocumentFromPath(path, body, frontmatter);
}
