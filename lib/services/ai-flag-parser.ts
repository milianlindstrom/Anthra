/**
 * AI Flag Parser Service
 * 
 * Detects and extracts @ai flags from markdown documents.
 * Supports:
 * - Simple flag: @ai (auto-route)
 * - Explicit model: @ai:cursor, @ai:claude, @ai:local
 * - Multi-model: @ai:claude,cursor
 */

export interface AIFlag {
  line_number: number;
  section: string;
  item_text: string;
  model_override?: string | string[]; // undefined = auto-route, string = single model, array = multiple models
  surrounding_context?: string;
}

/**
 * Find the section header for a given line number
 */
function findSectionHeader(lines: string[], lineIndex: number): string {
  // Look backwards for the nearest header
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i];
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      return headerMatch[1].trim();
    }
  }
  return 'Introduction'; // Default if no section found
}

/**
 * Extract the full item text (including continuation lines)
 */
function extractItemText(
  lines: string[],
  flagLineIndex: number
): { text: string; startLine: number; endLine: number } {
  const flagLine = lines[flagLineIndex];
  
  // Find start of item (look backwards for list marker or empty line)
  let startLine = flagLineIndex;
  for (let i = flagLineIndex - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === '') {
      break; // Empty line indicates new item
    }
    if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
      startLine = i;
      break;
    }
    startLine = i;
  }

  // Find end of item (look forwards for next list item or empty line)
  let endLine = flagLineIndex;
  for (let i = flagLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      // Check if next non-empty line is a new list item
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') {
        j++;
      }
      if (j < lines.length && lines[j].match(/^[-*]\s|^\d+\.\s/)) {
        endLine = i;
        break;
      }
    }
    if (line.match(/^[-*]\s|^\d+\.\s/)) {
      endLine = i;
      break;
    }
    endLine = i;
  }

  const itemLines = lines.slice(startLine, endLine + 1);
  return {
    text: itemLines.join('\n').trim(),
    startLine,
    endLine,
  };
}

/**
 * Extract surrounding context (previous items in same section)
 */
function extractSurroundingContext(
  lines: string[],
  itemStartLine: number,
  itemEndLine: number,
  sectionStartLine: number
): string {
  const contextLines: string[] = [];
  
  // Get up to 3 previous items in the same section
  let itemsFound = 0;
  let currentItemStart = itemStartLine - 1;

  while (currentItemStart >= sectionStartLine && itemsFound < 3) {
    const line = lines[currentItemStart].trim();
    
    if (line === '') {
      currentItemStart--;
      continue;
    }

    if (line.match(/^[-*]\s|^\d+\.\s/)) {
      // Found start of an item
      let itemEnd = currentItemStart;
      for (let i = currentItemStart + 1; i < itemStartLine; i++) {
        const nextLine = lines[i].trim();
        if (nextLine === '' || nextLine.match(/^[-*]\s|^\d+\.\s/)) {
          itemEnd = i - 1;
          break;
        }
        itemEnd = i;
      }

      const itemText = lines
        .slice(currentItemStart, itemEnd + 1)
        .join('\n')
        .trim();
      contextLines.unshift(itemText);
      itemsFound++;
    }

    currentItemStart--;
  }

  return contextLines.join('\n\n');
}

/**
 * Parse @ai flags from markdown content
 */
export function parseAIFlags(content: string): AIFlag[] {
  const lines = content.split('\n');
  const flags: AIFlag[] = [];

  // Pattern to match @ai flags
  const flagPattern = /@ai(?::([a-z,]+))?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(flagPattern);

    if (match) {
      // Extract model override if specified
      let modelOverride: string | string[] | undefined;
      if (match[1]) {
        const models = match[1].split(',').map((m) => m.trim().toLowerCase());
        modelOverride = models.length === 1 ? models[0] : models;
      }

      // Find section header
      const section = findSectionHeader(lines, i);

      // Extract item text
      const itemInfo = extractItemText(lines, i);

      // Find section start (for context extraction)
      let sectionStartLine = 0;
      for (let j = i; j >= 0; j--) {
        if (lines[j].match(/^##\s+/)) {
          sectionStartLine = j;
          break;
        }
      }

      // Extract surrounding context
      const surroundingContext = extractSurroundingContext(
        lines,
        itemInfo.startLine,
        itemInfo.endLine,
        sectionStartLine
      );

      flags.push({
        line_number: i + 1, // 1-indexed for user display
        section,
        item_text: itemInfo.text,
        model_override: modelOverride,
        surrounding_context:
          surroundingContext || undefined,
      });
    }
  }

  return flags;
}

/**
 * Remove @ai flags from content (for display purposes)
 */
export function removeAIFlags(content: string): string {
  const lines = content.split('\n');
  return lines
    .map((line) => line.replace(/@ai(?::[a-z,]+)?/gi, '').trimEnd())
    .join('\n');
}
