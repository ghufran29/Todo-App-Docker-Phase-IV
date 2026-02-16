# API Contract: Chat Endpoint

**Branch**: `006-ai-agent-chat` | **Date**: 2026-02-11

## POST /api/chat

Send a message to the AI agent and receive a response with tool calls.

### Request

```json
{
  "conversation_id": "uuid-string (optional, auto-created if null)",
  "message": "Add a task called Buy groceries"
}
```

**Headers**: `Authorization: Bearer <jwt-token>`

**Authentication**: JWT token required. `user_id` extracted from token
by auth middleware (not passed in body).

### Response (200 OK)

```json
{
  "conversation_id": "uuid-of-conversation",
  "response_text": "I've created a new task 'Buy groceries' for you.",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {
        "user_id": "user-uuid",
        "title": "Buy groceries"
      },
      "result": {
        "success": true,
        "data": {
          "id": "task-uuid",
          "user_id": "user-uuid",
          "title": "Buy groceries",
          "status": "pending"
        },
        "error": null
      }
    }
  ]
}
```

### Response (401 Unauthorized)

```json
{
  "detail": "Invalid token or expired token."
}
```

### Response (422 Validation Error)

```json
{
  "detail": "message field is required"
}
```

### Response (500 Internal Server Error)

```json
{
  "conversation_id": "uuid-if-available",
  "response_text": "I encountered an error processing your request. Please try again.",
  "tool_calls": []
}
```

---

## GET /api/conversations

List all conversations for the authenticated user.

### Response (200 OK)

```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Task management",
      "created_at": "2026-02-11T10:00:00Z",
      "updated_at": "2026-02-11T10:05:00Z"
    }
  ],
  "count": 1
}
```

---

## GET /api/conversations/{conversation_id}/messages

Retrieve message history for a specific conversation.

### Response (200 OK)

```json
{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Add a task called Buy groceries",
      "tool_calls": null,
      "created_at": "2026-02-11T10:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "I've created a new task 'Buy groceries' for you.",
      "tool_calls": [{"tool": "add_task", "arguments": {...}, "result": {...}}],
      "created_at": "2026-02-11T10:00:01Z"
    }
  ],
  "count": 2
}
```

### Response (404 Not Found)

```json
{
  "detail": "Conversation not found"
}
```
