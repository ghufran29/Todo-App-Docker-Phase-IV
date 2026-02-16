# Research: Chat API, Persistence, and Frontend Integration

**Branch**: `007-chat-api-frontend` | **Date**: 2026-02-12

## R1: Existing Code Audit — Delta from Spec 2

**Decision**: Reuse all backend code from Spec 2 (models, service,
agent config/runner/history, basic endpoints). The delta for this
spec is: (1) add `POST /api/{user_id}/chat` route with path-based
user_id validation, and (2) build the ChatKit frontend.

**Existing from Spec 2 (no changes needed)**:
- `backend/src/models/conversation.py` — Conversation SQLModel
- `backend/src/models/message.py` — Message SQLModel
- `backend/src/services/conversation_service.py` — CRUD service
- `backend/src/agent/config.py` — Agent + MCP config
- `backend/src/agent/runner.py` — Runner execution
- `backend/src/agent/history.py` — History reconstruction
- `backend/src/api/chat_router.py` — POST /api/chat, GET endpoints
- `backend/src/database/connection.py` — Table creation includes
  Conversation and Message

**New for this spec**:
- `POST /api/{user_id}/chat` — user_id in route, validated vs JWT
- Frontend ChatKit application (entirely new)

## R2: user_id Route Parameter vs JWT-Only Authentication

**Decision**: Add `POST /api/{user_id}/chat` endpoint where `user_id`
in the URL path MUST match the `user_id` decoded from the JWT token.
This follows the constitution's security rule: "Token user_id must
match route user_id."

**Rationale**: The constitution explicitly requires route-level user_id
matching. The existing `POST /api/chat` from Spec 2 uses JWT-only auth
(user_id from token). The new endpoint adds the path parameter for
constitutional compliance.

**Implementation**: Add a validation check in the endpoint that
compares `path_user_id` with `current_user.id`. Return 403 if
they don't match.

## R3: On-Demand Conversation Creation

**Decision**: Create conversations on demand when `conversation_id`
is not provided in the chat request. No separate creation endpoint
needed.

**Rationale**: This simplifies the API surface and matches the
existing Spec 2 implementation. The conversation title is
auto-generated from the first message (truncated to 100 chars).

**Alternatives considered**:
- Explicit creation endpoint — adds an extra round-trip before
  the first message; rejected for simplicity.

## R4: Message History Limit

**Decision**: Limit conversation history to the 50 most recent
messages per request (already implemented in Spec 2's
`build_history` function).

**Rationale**: LLM context windows have limits. 50 messages provides
sufficient context for most conversations while keeping token usage
manageable.

## R5: OpenAI ChatKit Frontend Integration

**Decision**: Use OpenAI ChatKit (`@openai/chat-kit`) as the frontend
chat component library per constitution architecture standards.

**Rationale**: The constitution specifies "Frontend: OpenAI ChatKit"
for Phase III. ChatKit provides pre-built chat bubble components,
message input, conversation list, and supports tool call display.

**Key patterns**:
- ChatKit provides `<Chat>`, `<MessageList>`, `<MessageInput>`
  components
- Messages are passed as an array of `{role, content}` objects
- Tool calls can be displayed as metadata in message components
- The frontend manages JWT tokens from Better Auth (Phase II)

## R6: Error Response Format

**Decision**: All error responses follow the existing FastAPI
HTTPException pattern: `{"detail": "error message"}` for 401, 403,
404, 422 errors. Agent execution errors return a 200 with a
user-friendly `response_text` and empty `tool_calls`.

**Rationale**: Consistent with the existing backend error handling
from Phase II. The agent handles its own errors gracefully
(returning helpful text), so the endpoint only raises HTTP errors
for auth and validation failures.

## R7: Message Storage Order

**Decision**: Store the user's message BEFORE invoking the agent.
Store the assistant's response AFTER the agent completes. This
ensures no user messages are lost if the agent fails.

**Rationale**: Aligns with FR-005 and FR-006 from the spec. The
existing Spec 2 chat endpoint already follows this pattern.
