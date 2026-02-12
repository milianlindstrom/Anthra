/**
 * Database Service for Document System
 * 
 * Provides CRUD operations for the nested document hierarchy:
 * Project → ContextType → Artifact → Document
 * 
 * Also manages ContextFiles, AIInteractions, and RoutingPatterns
 */

import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

// ============================================================================
// Projects (already exists, but we add document-related helpers)
// ============================================================================

export async function getProjectByName(name: string) {
  return prisma.project.findFirst({
    where: { name },
  });
}

// Re-export for convenience
export { getProjectByName as getProject };

// ============================================================================
// Context Types
// ============================================================================

export interface CreateContextTypeInput {
  project_id: string;
  name: string;
}

export async function createContextType(input: CreateContextTypeInput) {
  return prisma.contextType.create({
    data: input,
  });
}

export async function getContextType(project_id: string, name: string) {
  return prisma.contextType.findUnique({
    where: {
      project_id_name: {
        project_id,
        name,
      },
    },
  });
}

export async function listContextTypes(project_id: string) {
  return prisma.contextType.findMany({
    where: { project_id },
    orderBy: { name: 'asc' },
  });
}

// ============================================================================
// Artifacts
// ============================================================================

export interface CreateArtifactInput {
  context_type_id: string;
  name: string;
  status?: 'active' | 'archived' | 'completed';
}

export async function createArtifact(input: CreateArtifactInput) {
  const artifact = await prisma.artifact.create({
    data: {
      context_type_id: input.context_type_id,
      name: input.name,
      status: input.status || 'active',
    },
  });

  // Update parent context type timestamp
  await prisma.contextType.update({
    where: { id: input.context_type_id },
    data: { updated_at: new Date() },
  });

  return artifact;
}

export async function getArtifact(context_type_id: string, name: string) {
  return prisma.artifact.findUnique({
    where: {
      context_type_id_name: {
        context_type_id,
        name,
      },
    },
  });
}

export async function listArtifacts(context_type_id: string, status?: string) {
  return prisma.artifact.findMany({
    where: {
      context_type_id,
      ...(status ? { status } : {}),
    },
    orderBy: { updated_at: 'desc' },
  });
}

export async function updateArtifactStatus(
  id: string,
  status: 'active' | 'archived' | 'completed'
) {
  return prisma.artifact.update({
    where: { id },
    data: { status, updated_at: new Date() },
  });
}

// ============================================================================
// Documents
// ============================================================================

export interface CreateDocumentInput {
  artifact_id: string;
  filename: string;
  content: string;
  metadata?: Record<string, any>;
}

export async function createDocument(input: CreateDocumentInput) {
  const document = await prisma.document.create({
    data: {
      artifact_id: input.artifact_id,
      filename: input.filename,
      content: input.content,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });

  // Update parent artifact timestamp
  await updateArtifactTimestamp(input.artifact_id);

  return document;
}

export async function getDocument(artifact_id: string, filename: string) {
  return prisma.document.findUnique({
    where: {
      artifact_id_filename: {
        artifact_id,
        filename,
      },
    },
  });
}

export async function listDocuments(
  artifact_id: string,
  options?: {
    max_age_days?: number;
    tags?: string[];
  }
) {
  const where: Prisma.DocumentWhereInput = {
    artifact_id,
  };

  if (options?.max_age_days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.max_age_days);
    where.updated_at = { gte: cutoffDate };
  }

  if (options?.tags && options.tags.length > 0) {
    // Tags are stored in metadata JSON, so we need to filter
    // This is a simplified approach - for production, consider full-text search
    where.metadata = {
      contains: JSON.stringify(options.tags),
    };
  }

  return prisma.document.findMany({
    where,
    orderBy: { updated_at: 'desc' },
  });
}

export async function updateDocument(
  artifact_id: string,
  filename: string,
  updates: {
    content?: string;
    metadata?: Record<string, any>;
  }
) {
  const updateData: Prisma.DocumentUpdateInput = {
    updated_at: new Date(),
  };

  if (updates.content !== undefined) {
    updateData.content = updates.content;
  }

  if (updates.metadata !== undefined) {
    updateData.metadata = updates.metadata
      ? JSON.stringify(updates.metadata)
      : null;
  }

  const document = await prisma.document.update({
    where: {
      artifact_id_filename: {
        artifact_id,
        filename,
      },
    },
    data: updateData,
  });

  // Update parent artifact timestamp
  await updateArtifactTimestamp(artifact_id);

  return document;
}

export async function deleteDocument(artifact_id: string, filename: string) {
  await prisma.document.delete({
    where: {
      artifact_id_filename: {
        artifact_id,
        filename,
      },
    },
  });

  // Update parent artifact timestamp
  await updateArtifactTimestamp(artifact_id);
}

async function updateArtifactTimestamp(artifact_id: string) {
  await prisma.artifact.update({
    where: { id: artifact_id },
    data: { updated_at: new Date() },
  });

  // Also update parent context type
  const artifact = await prisma.artifact.findUnique({
    where: { id: artifact_id },
    select: { context_type_id: true },
  });

  if (artifact) {
    await prisma.contextType.update({
      where: { id: artifact.context_type_id },
      data: { updated_at: new Date() },
    });
  }
}

// ============================================================================
// Context Files
// ============================================================================

export interface CreateContextFileInput {
  content: string;
  project_id?: string;
  context_type_id?: string;
  artifact_id?: string;
}

export async function createOrUpdateContextFile(input: CreateContextFileInput) {
  // Ensure exactly one foreign key is set
  const keyCount = [
    input.project_id,
    input.context_type_id,
    input.artifact_id,
  ].filter(Boolean).length;

  if (keyCount !== 1) {
    throw new Error(
      'ContextFile must have exactly one of: project_id, context_type_id, or artifact_id'
    );
  }

  // Try to find existing context file
  const existing = await prisma.contextFile.findFirst({
    where: {
      ...(input.project_id ? { project_id: input.project_id } : {}),
      ...(input.context_type_id
        ? { context_type_id: input.context_type_id }
        : {}),
      ...(input.artifact_id ? { artifact_id: input.artifact_id } : {}),
    },
  });

  if (existing) {
    return prisma.contextFile.update({
      where: { id: existing.id },
      data: {
        content: input.content,
        updated_at: new Date(),
      },
    });
  }

  return prisma.contextFile.create({
    data: {
      content: input.content,
      project_id: input.project_id || undefined,
      context_type_id: input.context_type_id || undefined,
      artifact_id: input.artifact_id || undefined,
    },
  });
}

export async function getProjectContext(project_id: string) {
  return prisma.contextFile.findFirst({
    where: { project_id },
  });
}

export async function getContextTypeContext(context_type_id: string) {
  return prisma.contextFile.findFirst({
    where: { context_type_id },
  });
}

export async function getArtifactContext(artifact_id: string) {
  return prisma.contextFile.findFirst({
    where: { artifact_id },
  });
}

// ============================================================================
// AI Interactions
// ============================================================================

export interface CreateAIInteractionInput {
  document_id: string;
  section?: string;
  item_text: string;
  ai_model: string;
  query_sent: string;
  response_received: string;
  routing_confidence?: number;
  routing_reason?: string;
  user_override?: boolean;
}

export async function createAIInteraction(input: CreateAIInteractionInput) {
  return prisma.aIInteraction.create({
    data: input,
  });
}

export async function getDocumentAIInteractions(document_id: string) {
  return prisma.aIInteraction.findMany({
    where: { document_id },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getRecentAIInteractions(
  project_id: string,
  limit: number = 50
) {
  // Get all documents in project's artifacts
  const contextTypes = await listContextTypes(project_id);
  const contextTypeIds = contextTypes.map((ct) => ct.id);

  const artifacts = await prisma.artifact.findMany({
    where: { context_type_id: { in: contextTypeIds } },
    select: { id: true },
  });

  const artifactIds = artifacts.map((a) => a.id);

  const documents = await prisma.document.findMany({
    where: { artifact_id: { in: artifactIds } },
    select: { id: true },
  });

  const documentIds = documents.map((d) => d.id);

  return prisma.aIInteraction.findMany({
    where: { document_id: { in: documentIds } },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

// ============================================================================
// Routing Patterns
// ============================================================================

export interface CreateRoutingPatternInput {
  content_pattern: string;
  suggested_model: string;
  corrected_model?: string | null;
  confidence_score: number;
}

export async function createRoutingPattern(input: CreateRoutingPatternInput) {
  return prisma.routingPattern.create({
    data: input,
  });
}

export async function getRecentRoutingPatterns(limit: number = 100) {
  return prisma.routingPattern.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}
