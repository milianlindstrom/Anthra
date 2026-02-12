import { NextRequest, NextResponse } from 'next/server';
import { routeQuery } from '@/lib/services/routing-service';
import { getContext, formatContextForAI } from '@/lib/services/context-service';

/**
 * POST /api/documents/ai/route
 * 
 * Determine which AI model should handle a query
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, context_query } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    // If context_query provided, fetch inherited context
    let inheritedContext: string | undefined;
    if (context_query) {
      const context = await getContext(context_query);
      if (context) {
        inheritedContext = formatContextForAI(context);
      }
    }

    const decision = await routeQuery(content, inheritedContext);

    return NextResponse.json(decision);
  } catch (error: any) {
    console.error('Error routing query:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to route query' },
      { status: 500 }
    );
  }
}
