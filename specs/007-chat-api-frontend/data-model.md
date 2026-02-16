# Data Model: Chat API, Persistence, and Frontend Integration

**Branch**: `007-chat-api-frontend` | **Date**: 2026-02-12

## Existing Entities (from Spec 2 — no changes)

### Conversation

| Field | Type | Constraints | Status |
|-------|------|-------------|--------|
| id | UUID | PK | EXISTS |
| user_id | UUID | FK → user.id, indexed | EXISTS |
| title | Optional[str] | max 200 | EXISTS |
| created_at | datetime | auto | EXISTS |
| updated_at | datetime | auto | EXISTS |

### Message

| Field | Type | Constraints | Status |
|-------|------|-------------|--------|
| id | UUID | PK | EXISTS |
| conversation_id | UUID | FK → conversation.id, indexed | EXISTS |
| role | str | "user" or "assistant" | EXISTS |
| content | str | NOT NULL | EXISTS |
| tool_calls | JSON | nullable | EXISTS |
| created_at | datetime | auto | EXISTS |

## No New Entities Required

All database models needed for this spec already exist from Spec 2.
The delta is purely at the API routing layer (new path-param
endpoint) and the frontend layer (ChatKit UI).

## API Response Schemas

### Chat Response (unchanged from Spec 2)

```json
{
  "conversation_id": "uuid-string",
  "response_text": "Agent reply text",
  "tool_calls": [
    {
      "tool": "tool_name",
      "arguments": "json-string",
      "result": "tool-output-string"
    }
  ]
}
```

### Conversation List Response (unchanged from Spec 2)

```json
{
  "conversations": [
    {"id": "uuid", "title": "...", "created_at": "...", "updated_at": "..."}
  ],
  "count": 1
}
```

### Message List Response (unchanged from Spec 2)

```json
{
  "messages": [
    {"id": "uuid", "role": "user", "content": "...", "tool_calls": null, "created_at": "..."}
  ],
  "count": 1
}
```
