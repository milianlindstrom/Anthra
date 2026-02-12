import { NextRequest, NextResponse } from 'next/server';
import { getContext, formatContextForAI } from '@/lib/services/context-service';

/**
 * GET /api/documents/context
 * 
 * Retrieve inherited context for a query
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const project = searchParams.get('project');
    if (!project) {
      return NextResponse.json(
        { error: 'project parameter is required' },
        { status: 400 }
      );
    }

    const context_type = searchParams.get('context_type') || undefined;
    const artifact = searchParams.get('artifact') || undefined;
    const document = searchParams.get('document') || undefined;
    const section = searchParams.get('section') || undefined;
    const max_age_days = searchParams.get('max_age_days')
      ? parseInt(searchParams.get('max_age_days')!)
      : undefined;
    const include_stale = searchParams.get('include_stale') === 'true';

    const context = await getContext({
      project,
      context_type,
      artifact,
      document,
      section,
      max_age_days,
      include_stale,
    });

    if (!context) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const formatted = formatContextForAI(context);

    return NextResponse.json({
      context,
      formatted,
    });
  } catch (error: any) {
    console.error('Error fetching context:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch context' },
      { status: 500 }
    );
  }
}
