import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/services/document-db';
import { prisma } from '@/lib/db';

/**
 * GET /api/documents/hierarchy
 * 
 * Get the document hierarchy for a project:
 * - Context types
 * - Artifacts (optionally filtered by context type)
 * - Documents (optionally filtered by artifact)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id parameter is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get context types for this project
    const contextTypes = await db.listContextTypes(projectId);

    // Optionally get artifacts for a specific context type
    const contextTypeId = searchParams.get('context_type_id');
    let artifacts: any[] = [];
    if (contextTypeId) {
      artifacts = await db.listArtifacts(contextTypeId);
    }

    // Optionally get documents for a specific artifact
    const artifactId = searchParams.get('artifact_id');
    let documents: any[] = [];
    if (artifactId) {
      documents = await db.listDocuments(artifactId);
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
      },
      contextTypes,
      artifacts,
      documents,
    });
  } catch (error: any) {
    console.error('Error fetching document hierarchy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hierarchy' },
      { status: 500 }
    );
  }
}
