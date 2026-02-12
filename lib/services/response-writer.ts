/**
 * Response Writer Service
 * 
 * Writes AI responses back into documents inline.
 * Formats responses as markdown blockquotes with attribution.
 */

import * as db from './document-db';

export interface WriteResponseInput {
  artifact_id: string;
  filename: string;
  item_text: string;
  ai_model: string;
  response: string;
  routing_info?: {
    confidence?: number;
    reason?: string;
  };
}

/**
 * Format AI response as markdown blockquote
 */
function formatResponse(
  ai_model: string,
  response: string,
  routing_info?: { confidence?: number; reason?: string }
): string {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const modelName =
    ai_model === 'cursor'
      ? 'Cursor'
      : ai_model === 'claude'
      ? 'Claude'
      : ai_model === 'local'
      ? 'Local AI'
      : ai_model;

  let attribution = `> **AI (${modelName}, ${timestamp}):**\n`;

  if (routing_info?.reason) {
    attribution += `> *${routing_info.reason}*\n`;
  }

  attribution += `>\n`;

  // Format response lines as blockquote
  const responseLines = response.split('\n');
  const quotedLines = responseLines.map((line) => {
    if (line.trim() === '') {
      return '>';
    }
    // Handle code blocks - don't quote the fence markers
    if (line.trim().startsWith('```')) {
      return line;
    }
    return `> ${line}`;
  });

  return attribution + quotedLines.join('\n');
}

/**
 * Find insertion point for response in document
 */
function findInsertionPoint(
  content: string,
  itemText: string
): { found: boolean; insertAfter: number } {
  const lines = content.split('\n');
  const itemLines = itemText.split('\n');
  const firstItemLine = itemLines[0].trim();

  // Find the line containing the flagged item
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(firstItemLine)) {
      // Found the item, now find where it ends
      let itemEnd = i;

      // Look for end of item (empty line, next list item, or end of file)
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j].trim();
        if (line === '') {
          // Check if next non-empty line is a new item
          let k = j + 1;
          while (k < lines.length && lines[k].trim() === '') {
            k++;
          }
          if (k < lines.length && lines[k].match(/^[-*]\s|^\d+\.\s/)) {
            itemEnd = j;
            break;
          }
        } else if (line.match(/^[-*]\s|^\d+\.\s/)) {
          itemEnd = j;
          break;
        }
        itemEnd = j;
      }

      // Check if there's already a response after this item
      let insertAfter = itemEnd;
      for (let j = itemEnd + 1; j < lines.length; j++) {
        const line = lines[j].trim();
        if (line.startsWith('> **AI (')) {
          // Found existing response, insert after it
          // Find end of this response block
          while (j < lines.length && (lines[j].trim().startsWith('>') || lines[j].trim() === '')) {
            j++;
          }
          insertAfter = j - 1;
          break;
        }
        if (line !== '' && !line.startsWith('>')) {
          // Non-empty, non-quoted line - end of response block
          break;
        }
        insertAfter = j;
      }

      return { found: true, insertAfter };
    }
  }

  return { found: false, insertAfter: content.split('\n').length };
}

/**
 * Write AI response to document
 */
export async function writeResponse(input: WriteResponseInput) {
  // Load document
  const document = await db.getDocument(input.artifact_id, input.filename);
  if (!document) {
    throw new Error(
      `Document "${input.filename}" not found in artifact "${input.artifact_id}"`
    );
  }

  // Format response
  const formattedResponse = formatResponse(
    input.ai_model,
    input.response,
    input.routing_info
  );

  // Find insertion point
  const { found, insertAfter } = findInsertionPoint(
    document.content,
    input.item_text
  );

  if (!found) {
    throw new Error(
      `Could not find flagged item in document. Item text: "${input.item_text.substring(0, 50)}..."`
    );
  }

  // Insert response
  const lines = document.content.split('\n');
  const newLines = [
    ...lines.slice(0, insertAfter + 1),
    '', // Empty line before response
    formattedResponse,
    '', // Empty line after response
    ...lines.slice(insertAfter + 1),
  ];

  const updatedContent = newLines.join('\n');

  // Update document
  await db.updateDocument(input.artifact_id, input.filename, {
    content: updatedContent,
  });

  return {
    success: true,
    inserted_at_line: insertAfter + 2,
  };
}
