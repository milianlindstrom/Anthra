/**
 * Routing Service
 * 
 * Intelligently routes queries to appropriate AI models:
 * - Code context → Cursor
 * - Business/strategy → Claude
 * - Privacy-sensitive → Local
 * 
 * Learns from user overrides to improve over time.
 */

import * as db from './document-db';

export interface RoutingDecision {
  model: string;
  confidence: number; // 0.0 to 1.0
  reason: string;
  should_ask_user: boolean;
  alternatives?: string[];
}

// Keywords for different contexts
const CODE_KEYWORDS = [
  'bug',
  'error',
  'fails',
  'webpack',
  'typescript',
  'javascript',
  'python',
  'function',
  'class',
  'import',
  'export',
  'api',
  'endpoint',
  'database',
  'sql',
  'migration',
  'deploy',
  'docker',
  'npm',
  'package.json',
  'tsconfig',
  'prisma',
  'schema',
  'component',
  'hook',
  'route',
  'middleware',
  'stack trace',
  'exception',
  'debug',
  'test',
  'spec',
  'implementation',
  'refactor',
  'optimize',
  'performance',
];

const BUSINESS_KEYWORDS = [
  'pricing',
  'market',
  'strategy',
  'vat',
  'swedish',
  'customer',
  'positioning',
  'competitor',
  'revenue',
  'profit',
  'cost',
  'budget',
  'sales',
  'marketing',
  'brand',
  'value proposition',
  'target audience',
  'go-to-market',
  'business model',
  'partnership',
  'investment',
  'funding',
  'roi',
  'metrics',
  'kpi',
];

const PRIVACY_KEYWORDS = [
  'authentication',
  'password',
  'user data',
  'personal',
  'gdpr',
  'sensitive',
  'privacy',
  'consent',
  'data protection',
  'pii',
  'encryption',
  'security',
  'access control',
  'permissions',
  'authorization',
];

/**
 * Analyze content and determine routing
 */
export async function routeQuery(
  content: string,
  inheritedContext?: string
): Promise<RoutingDecision> {
  const fullText = `${content}\n${inheritedContext || ''}`.toLowerCase();

  // Count keyword matches
  const codeMatches = CODE_KEYWORDS.filter((kw) =>
    fullText.includes(kw.toLowerCase())
  ).length;
  const businessMatches = BUSINESS_KEYWORDS.filter((kw) =>
    fullText.includes(kw.toLowerCase())
  ).length;
  const privacyMatches = PRIVACY_KEYWORDS.filter((kw) =>
    fullText.includes(kw.toLowerCase())
  ).length;

  // Calculate scores
  const codeScore = codeMatches / CODE_KEYWORDS.length;
  const businessScore = businessMatches / BUSINESS_KEYWORDS.length;
  const privacyScore = privacyMatches / PRIVACY_KEYWORDS.length;

  // Special handling for privacy-sensitive content
  if (privacyScore > 0.1) {
    return {
      model: 'local',
      confidence: 0.9,
      reason: 'Content contains privacy-sensitive keywords. Using local model to ensure data stays on your machine.',
      should_ask_user: false,
    };
  }

  // Determine primary context
  const maxScore = Math.max(codeScore, businessScore);
  const confidence = Math.min(maxScore * 2, 0.95); // Scale to 0-0.95 range

  if (codeScore > businessScore && codeScore > 0.1) {
    return {
      model: 'cursor',
      confidence,
      reason: `Detected ${codeMatches} code-related keywords. Cursor has direct repository integration and is best for technical debugging.`,
      should_ask_user: confidence < 0.6,
      alternatives: confidence < 0.85 ? ['claude', 'local'] : undefined,
    };
  }

  if (businessScore > codeScore && businessScore > 0.1) {
    return {
      model: 'claude',
      confidence,
      reason: `Detected ${businessMatches} business-related keywords. Claude has longer context window and better reasoning for strategic questions.`,
      should_ask_user: confidence < 0.6,
      alternatives: confidence < 0.85 ? ['cursor', 'local'] : undefined,
    };
  }

  // Low confidence - ambiguous context
  return {
    model: 'claude', // Default to Claude for ambiguous queries
    confidence: 0.5,
    reason: 'Context is ambiguous. Claude is a good default for general queries.',
    should_ask_user: true,
    alternatives: ['cursor', 'local'],
  };
}

/**
 * Log routing pattern for learning
 */
export async function logRoutingPattern(
  content: string,
  suggestedModel: string,
  userChoice?: string,
  confidence: number = 0.5
) {
  // Extract key phrases from content (simplified - could be more sophisticated)
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 10)
    .join(' ');

  await db.createRoutingPattern({
    content_pattern: words,
    suggested_model: suggestedModel,
    corrected_model: userChoice || null,
    confidence_score: confidence,
  });
}

/**
 * Learn from historical patterns
 */
export async function learnFromHistory(): Promise<Map<string, string>> {
  const patterns = await db.getRecentRoutingPatterns(1000);
  const learnedPatterns = new Map<string, string>();

  // Group by content pattern and see what users actually chose
  const patternGroups = new Map<string, Array<{ model: string; corrected?: string }>>();

  for (const pattern of patterns) {
    const key = pattern.content_pattern.toLowerCase();
    if (!patternGroups.has(key)) {
      patternGroups.set(key, []);
    }
    patternGroups.get(key)!.push({
      model: pattern.suggested_model,
      corrected: pattern.corrected_model || undefined,
    });
  }

  // For each pattern, if users consistently override, learn that
  for (const [pattern, decisions] of Array.from(patternGroups.entries())) {
    const overrides = decisions.filter((d) => d.corrected);
    if (overrides.length > 3) {
      // If more than 3 overrides, check if they're consistent
      const modelCounts = new Map<string, number>();
      for (const override of overrides) {
        const model = override.corrected!;
        modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
      }

      // If one model is chosen >60% of the time, learn it
      for (const [model, count] of Array.from(modelCounts.entries())) {
        if (count / overrides.length > 0.6) {
          learnedPatterns.set(pattern, model);
          break;
        }
      }
    }
  }

  return learnedPatterns;
}
