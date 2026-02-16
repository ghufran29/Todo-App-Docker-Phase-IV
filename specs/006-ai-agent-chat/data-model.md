# Data Model: AI Agent and Chat Orchestration Layer

**Branch**: `006-ai-agent-chat` | **Date**: 2026-02-11

## New Entities

### Conversation

Represents a chat session between a user and the AI agent.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | Unique conversation identifier |
| user_id | UUID | FK → user.id, NOT NULL, indexed | Owner of the conversation |
| title | string | max 200 chars, optional | Auto-generated from first message |
| created_at | datetime | NOT NULL, auto-generated | When conversation started |
| updated_at | datetime | NOT NULL, auto-updated | Last activity timestamp |

### Message

An individual message within a conversation.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | Unique message identifier |
| conversation_id | UUID | FK → conversation.id, NOT NULL, indexed | Parent conversation |
| role | string(enum) | NOT NULL, values: "user", "assistant" | Who sent the message |
| content | text | NOT NULL | Message text content |
| tool_calls | JSON | optional, nullable | Array of tool invocations (assistant only) |
| created_at | datetime | NOT NULL, auto-generated | When message was sent |

**Relationships**:
- Conversation → Messages: one-to-many (ordered by created_at ASC)
- User → Conversations: one-to-many (filtered by user_id)

### Agent Response (Runtime Only — Not Persisted as Entity)

The structured output from a single agent invocation.

| Field | Type | Notes |
|-------|------|-------|
| conversation_id | string | The conversation this response belongs to |
| response_text | string | Human-readable agent reply |
| tool_calls | array | List of {tool, arguments, result} objects |

## Existing Entities Referenced

### Task (from Spec 1)

Used by MCP tools. The agent does not access this directly.

### User (from Phase II)

Referenced by Conversation.user_id for ownership.

## Tool Call Schema (within Message.tool_calls JSON)

```json
[
  {
    "tool": "add_task",
    "arguments": {"user_id": "...", "title": "..."},
    "result": {"success": true, "data": {...}, "error": null}
  }
]
```

## Error Codes (from Spec 1, passed through agent)

The agent interprets these from MCP tool responses:

| Code | Meaning |
|------|---------|
| MISSING_USER_ID | user_id parameter not provided |
| INVALID_USER_ID | user_id is not a valid UUID |
| MISSING_TASK_ID | task_id parameter not provided |
| INVALID_TASK_ID | task_id is not a valid UUID |
| TASK_NOT_FOUND | Task does not exist or access denied |
| DB_ERROR | Database operation failed |
| MISSING_TITLE | title parameter not provided |
| VALIDATION_ERROR | Input failed validation rules |
| NO_FIELDS_TO_UPDATE | No update fields provided |
