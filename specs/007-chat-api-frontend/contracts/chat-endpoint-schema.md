# API Contract: Chat Endpoint with user_id Route

**Branch**: `007-chat-api-frontend` | **Date**: 2026-02-12

## POST /api/{user_id}/chat (NEW — constitutional compliance)

Chat endpoint with user_id in the route path per constitution
security rule: "Token user_id must match route user_id."

### Request

```json
{
  "conversation_id": "uuid-string (optional)",
  "message": "Add a task called Buy groceries"
}
```

**Path Parameter**: `user_id` — UUID of the user (MUST match JWT)
**Headers**: `Authorization: Bearer <jwt-token>`

### Validation

1. JWT token MUST be valid (401 if not)
2. `user_id` in path MUST match JWT's user_id (403 if mismatch)
3. `message` field MUST be non-empty (422 if empty/missing)
4. `conversation_id` if provided MUST belong to the user (404 if not)

### Response (200 OK)

```json
{
  "conversation_id": "uuid",
  "response_text": "I've created a new task 'Buy groceries'.",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": "{\"user_id\": \"...\", \"title\": \"Buy groceries\"}",
      "result": "{\"success\": true, ...}"
    }
  ]
}
```

### Error Responses

| Code | Condition | Body |
|------|-----------|------|
| 401 | Invalid/missing JWT | `{"detail": "Invalid token or expired token."}` |
| 403 | user_id mismatch | `{"detail": "User ID mismatch"}` |
| 404 | Conversation not found | `{"detail": "Conversation not found"}` |
| 422 | Empty message | `{"detail": "message field is required"}` |

---

## Existing Endpoints (from Spec 2 — unchanged)

- `POST /api/chat` — original chat endpoint (JWT-only auth)
- `GET /api/conversations` — list user's conversations
- `GET /api/conversations/{conversation_id}/messages` — get history
