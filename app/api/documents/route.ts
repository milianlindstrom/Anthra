import { NextRequest, NextResponse } from 'next/server';
import {
  createDocumentFromPath,
  loadDocumentByPath,
  updateDocumentByPath,
  parsePath,
} from '@/lib/services/document-manager';
import * as db from '@/lib/services/document-db';

/**
 * POST /api/documents
 * 
 * Create a new document from path
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, content, metadata } = body;

    if (!path || !content) {
      return NextResponse.json(
        { error: 'path and content are required' },
        { status: 400 }
      );
    }

    const result = await createDocumentFromPath(path, content, metadata);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents
 * 
 * List documents with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const project = searchParams.get('project');
    const context_type = searchParams.get('context_type');
    const artifact = searchParams.get('artifact');

    if (!project) {
      return NextResponse.json(
        { error: 'project parameter is required' },
        { status: 400 }
      );
    }

    // If all hierarchy levels specified, list documents in artifact
    if (project && context_type && artifact) {
      const proj = await db.getProjectByName(project);
      if (!proj) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const ct = await db.getContextType(proj.id, context_type);
      if (!ct) {
        return NextResponse.json(
          { error: 'Context type not found' },
          { status: 404 }
        );
      }

      const art = await db.getArtifact(ct.id, artifact);
      if (!art) {
        return NextResponse.json(
          { error: 'Artifact not found' },
          { status: 404 }
        );
      }

      const max_age_days = searchParams.get('max_age_days')
        ? parseInt(searchParams.get('max_age_days')!)
        : undefined;

      const documents = await db.listDocuments(art.id, {
        max_age_days,
      });

      return NextResponse.json(documents);
    }

    // Otherwise return error - need full path
    return NextResponse.json(
      {
        error:
          'Please specify project, context_type, and artifact to list documents',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list documents' },
      { status: 500 }
    );
  }
}
