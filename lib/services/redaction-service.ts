/**
 * Redaction Service
 * 
 * Detects and redacts PII before sending to external AI services.
 * Supports:
 * - Email addresses
 * - Swedish personal names
 * - Custom patterns
 * 
 * Stores redaction mappings for de-redaction when displaying to users.
 */

export interface RedactionMap {
  [placeholder: string]: string; // placeholder → original value
}

// Common Swedish first names
const SWEDISH_FIRST_NAMES = [
  'anders',
  'anna',
  'björn',
  'carolina',
  'daniel',
  'elin',
  'emma',
  'erik',
  'fredrik',
  'gustav',
  'hanna',
  'henrik',
  'johan',
  'karl',
  'lars',
  'linda',
  'magnus',
  'maria',
  'mikael',
  'niklas',
  'olof',
  'per',
  'peter',
  'sara',
  'sofia',
  'stefan',
  'thomas',
  'tobias',
  'ulf',
  'viktor',
  'åsa',
  'östen',
];

// Common Swedish last names
const SWEDISH_LAST_NAMES = [
  'andersson',
  'berg',
  'björk',
  'dahl',
  'eriksson',
  'forsberg',
  'gustafsson',
  'hansson',
  'johansson',
  'karlsson',
  'larsson',
  'lindberg',
  'lindqvist',
  'lindström',
  'nilsson',
  'olsson',
  'persson',
  'sandberg',
  'sjöberg',
  'svensson',
  'wallin',
  'wikström',
];

/**
 * Detect and redact email addresses
 */
function redactEmails(
  content: string,
  redactionMap: RedactionMap
): string {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  let counter = 1;

  return content.replace(emailPattern, (email) => {
    const placeholder = `{{user_email_${counter}}}`;
    redactionMap[placeholder] = email;
    counter++;
    return placeholder;
  });
}

/**
 * Detect and redact Swedish names
 */
function redactSwedishNames(
  content: string,
  redactionMap: RedactionMap
): string {
  const words = content.split(/\s+/);
  let counter = 1;
  const redactedWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[.,!?;:]$/, '');
    const nextWord =
      i + 1 < words.length
        ? words[i + 1].toLowerCase().replace(/[.,!?;:]$/, '')
        : '';

    // Check for "Firstname Lastname" pattern
    if (
      SWEDISH_FIRST_NAMES.includes(word) &&
      SWEDISH_LAST_NAMES.includes(nextWord)
    ) {
      const fullName = `${words[i]} ${words[i + 1]}`;
      const placeholder = `{{user_name_${counter}}}`;
      redactionMap[placeholder] = fullName;
      redactedWords.push(placeholder);
      i++; // Skip next word
      counter++;
    } else {
      redactedWords.push(words[i]);
    }
  }

  return redactedWords.join(' ');
}

/**
 * Redact PII from content
 */
export function redactPII(
  content: string,
  options?: {
    redactEmails?: boolean;
    redactNames?: boolean;
  }
): { redactedContent: string; redactionMap: RedactionMap } {
  const redactionMap: RedactionMap = {};
  let redactedContent = content;

  const shouldRedactEmails = options?.redactEmails !== false; // Default true
  const shouldRedactNames = options?.redactNames !== false; // Default true

  if (shouldRedactEmails) {
    redactedContent = redactEmails(redactedContent, redactionMap);
  }

  if (shouldRedactNames) {
    redactedContent = redactSwedishNames(redactedContent, redactionMap);
  }

  return { redactedContent, redactionMap };
}

/**
 * De-redact content (restore original values)
 */
export function deredactContent(
  content: string,
  redactionMap: RedactionMap
): string {
  let deredacted = content;

  for (const [placeholder, original] of Object.entries(redactionMap)) {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    deredacted = deredacted.replace(regex, original);
  }

  return deredacted;
}

/**
 * Check if content should be redacted for a given model
 */
export function shouldRedactForModel(model: string): boolean {
  // External AIs always redact
  if (model === 'claude') {
    return true;
  }

  // Local models don't redact
  if (model === 'local') {
    return false;
  }

  // Cursor is in local IDE, default to no redaction but configurable
  if (model === 'cursor') {
    return process.env.REDACTION_ENABLED === 'true';
  }

  // Default: redact for unknown models
  return true;
}
