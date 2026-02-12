import { NextRequest, NextResponse } from 'next/server';
import { parseAIFlags } from '@/lib/services/ai-flag-parser';
import { loadDocumentByPath } from '@/lib/services/document-manager';

/**
 * GET /api/documents/ai/flags
 * 
 * Parse @ai flags from a document
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'path parameter is required' },
        { status: 400 }
      );
    }

    const { document } = await loadDocumentByPath(path);
    const flags = parseAIFlags(document.content);

    return NextResponse.json({ flags });
  } catch (error: any) {
    console.error('Error parsing AI flags:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse AI flags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/ai/flags
 * 
 * Parse @ai flags from provided content (without loading from DB)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const flags = parseAIFlags(content);

    return NextResponse.json({ flags });
  } catch (error: any) {
    console.error('Error parsing AI flags:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse AI flags' },
      { status: 500 }
    );
  }
}
