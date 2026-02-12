import { NextRequest, NextResponse } from 'next/server';
import { writeResponse } from '@/lib/services/response-writer';
import { createAIInteraction } from '@/lib/services/document-db';
import { loadDocumentByPath, parsePath } from '@/lib/services/document-manager';
import * as db from '@/lib/services/document-db';

/**
 * POST /api/documents/ai/reply
 * 
 * Write an AI response back to a document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      path,
      item_text,
      ai_model,
      response,
      routing_info,
      query_sent,
      section,
    } = body;

    if (!path || !item_text || !ai_model || !response) {
      return NextResponse.json(
        {
          error:
            'path, item_text, ai_model, and response are required',
        },
        { status: 400 }
      );
    }

    // Parse path to get artifact_id and filename
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

    const document = await db.getDocument(artifact.id, parsed.filename);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Write response to document
    const writeResult = await writeResponse({
      artifact_id: artifact.id,
      filename: parsed.filename,
      item_text,
      ai_model,
      response,
      routing_info,
    });

    // Log AI interaction
    await createAIInteraction({
      document_id: document.id,
      section: section || undefined,
      item_text,
      ai_model,
      query_sent: query_sent || '',
      response_received: response,
      routing_confidence: routing_info?.confidence,
      routing_reason: routing_info?.reason,
      user_override: false, // TODO: track if user overrode routing
    });

    return NextResponse.json(writeResult);
  } catch (error: any) {
    console.error('Error writing AI reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to write AI reply' },
      { status: 500 }
    );
  }
}
