# Anthra Document System - Implementation Summary

## Overview

The document system provides a nested, hierarchical documentation structure with automatic context inheritance and AI integration. Documents are organized as:

**Project → ContextType → Artifact → Document**

Each level can have a `.context.md` file that automatically provides context to all documents beneath it.

## Key Features

### 1. Context Inheritance
- Write context once at project, context type, or artifact level
- All documents automatically inherit context from parent levels
- No need to repeat background information

### 2. AI Flag System
- Flag items in documents with `@ai` for AI assistance
- Supports explicit routing: `@ai:cursor`, `@ai:claude`, `@ai:local`
- Multi-model support: `@ai:claude,cursor`

### 3. Intelligent Routing
- Automatically routes queries to appropriate AI model:
  - Code context → Cursor
  - Business/strategy → Claude
  - Privacy-sensitive → Local
- Learns from user overrides to improve over time

### 4. PII Redaction
- Automatically redacts email addresses and Swedish names before sending to external AIs
- Local models receive unredacted content
- GDPR compliant

### 5. Inline AI Responses
- AI responses are written directly into documents as formatted blockquotes
- Includes attribution (model, timestamp, routing reason)
- Preserves document structure

## Database Schema

New tables added:
- `ContextType` - Second level (e.g., "tech", "business", "journal")
- `Artifact` - Third level (e.g., "stripe-integration", "sprint-1")
- `Document` - Fourth level (markdown files)
- `ContextFile` - Special files for context at each level
- `AIInteraction` - Log of all AI interactions
- `RoutingPattern` - Machine learning data for routing decisions

## API Endpoints

### Documents
- `GET /api/documents/context` - Get inherited context
- `POST /api/documents` - Create document from path
- `GET /api/documents` - List documents (with filters)
- `GET /api/documents/[path]` - Get specific document
- `PATCH /api/documents/[path]` - Update document
- `DELETE /api/documents/[path]` - Delete document

### AI Integration
- `GET /api/documents/ai/flags` - Parse @ai flags from document
- `POST /api/documents/ai/flags` - Parse @ai flags from content
- `POST /api/documents/ai/route` - Route query to AI model
- `POST /api/documents/ai/reply` - Write AI response to document

## MCP Tools

New MCP tools available:
- `get_context` - Retrieve inherited context
- `write_ai_reply` - Write AI response to document
- `search_documents` - Search across documents
- `analyze_patterns` - Analyze patterns over time
- `route_query` - Determine which AI should handle a query

## Services

All services are in `lib/services/`:

1. **document-db.ts** - Database CRUD operations
2. **context-service.ts** - Context inheritance and assembly
3. **ai-flag-parser.ts** - Parse @ai flags from markdown
4. **routing-service.ts** - Intelligent AI model selection
5. **redaction-service.ts** - PII detection and redaction
6. **document-manager.ts** - High-level document operations
7. **response-writer.ts** - Write AI responses inline

## Usage Examples

### Create a Standup Document

```typescript
// Via API
POST /api/documents
{
  "path": "clyqra/journal/sprint-1/standup-2026-02-05.md",
  "content": "# Standup\n\n## Blockers\n\n- Stripe integration failing @ai\n\n## Tasks\n\n- Fix authentication bug\n"
}
```

### Get Context

```typescript
// Via API
GET /api/documents/context?project=clyqra&context_type=tech&artifact=stripe-integration&document=tech-spec.md&section=Open%20Questions
```

### Parse AI Flags

```typescript
// Via API
GET /api/documents/ai/flags?path=clyqra/journal/sprint-1/standup-2026-02-05.md
```

### Route a Query

```typescript
// Via API
POST /api/documents/ai/route
{
  "content": "Stripe integration failing with 401 error",
  "context_query": {
    "project": "clyqra",
    "context_type": "tech",
    "artifact": "stripe-integration"
  }
}
```

### Write AI Response

```typescript
// Via API
POST /api/documents/ai/reply
{
  "path": "clyqra/journal/sprint-1/standup-2026-02-05.md",
  "item_text": "- Stripe integration failing @ai",
  "ai_model": "cursor",
  "response": "Check API key configuration...",
  "routing_info": {
    "confidence": 0.9,
    "reason": "Detected code-related keywords"
  }
}
```

## UI

A basic document editor is available at `/documents`:
- Enter project, context type, and artifact to load documents
- Create new documents
- Edit document content
- Add @ai flags for AI assistance

## Setup Instructions

1. **Push Prisma Schema**
   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Rebuild Containers**
   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Test the System**
   - Create a project (if not exists)
   - Navigate to `/documents` in the UI
   - Create a document with an @ai flag
   - Test routing and response writing

## Testing Checklist

- [ ] Prisma schema pushed successfully
- [ ] Can create a document via API
- [ ] Can retrieve context with inheritance
- [ ] @ai flags are detected correctly
- [ ] Routing service selects appropriate model
- [ ] AI responses are written inline
- [ ] MCP tools are accessible
- [ ] UI loads and displays documents

## Next Steps

1. Implement full-text search for `search_documents`
2. Implement pattern analysis for `analyze_patterns`
3. Add UI for context file editing
4. Add keyboard shortcuts for @ai flagging
5. Implement auto-send to AI on flag detection
6. Add visual indicators for @ai flags in editor
7. Implement conflict detection for concurrent edits
