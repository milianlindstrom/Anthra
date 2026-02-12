import { NextRequest, NextResponse } from 'next/server';
import {
  loadDocumentByPath,
  updateDocumentByPath,
  parsePath,
} from '@/lib/services/document-manager';
import * as db from '@/lib/services/document-db';

/**
 * GET /api/documents/[path]
 * 
 * Get a specific document by path
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const path = decodeURIComponent(params.path);
    const result = await loadDocumentByPath(path);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error loading document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load document' },
      { status: 404 }
    );
  }
}

/**
 * PATCH /api/documents/[path]
 * 
 * Update a document by path
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const path = decodeURIComponent(params.path);
    const body = await request.json();
    const { content, metadata } = body;

    const result = await updateDocumentByPath(path, {
      content,
      metadata,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[path]
 * 
 * Delete a document by path
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const path = decodeURIComponent(params.path);
    const parsed = parsePath(path);

    const project = await db.getProjectByName(parsed.project);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const contextType = await db.getContextType(project.id, parsed.context_type);
    if (!contextType) {
      return NextResponse.json(
        { error: 'Context type not found' },
        { status: 404 }
      );
    }

    const artifact = await db.getArtifact(contextType.id, parsed.artifact);
    if (!artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    await db.deleteDocument(artifact.id, parsed.filename);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
