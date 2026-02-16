# Implementation Plan: Chat API, Persistence, and Frontend Integration

**Branch**: `007-chat-api-frontend` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-chat-api-frontend/spec.md`

## Summary

Add a constitution-compliant chat endpoint `POST /api/{user_id}/chat`
with path-based user_id validation against JWT, and build an OpenAI
ChatKit frontend for conversational task management. The backend
models, services, agent config/runner/history, and basic endpoints
already exist from Spec 2. This spec's delta is: (1) the user_id
route-param endpoint, and (2) the ChatKit frontend UI.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript/React (frontend)
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK (backend); OpenAI ChatKit, React (frontend)
**Storage**: Neon Serverless PostgreSQL (existing — conversation + message tables from Spec 2)
**Testing**: Manual validation via curl + browser
**Target Platform**: Linux server (backend), browser (frontend)
**Project Type**: Web application (backend + frontend)
**Constraints**: Stateless backend, ChatKit for frontend per constitution

## Constitution Check

| Principle | Gate | Status |
|-----------|------|--------|
| I. Agent-MCP-API Separation | API handles HTTP + auth; agent handles AI; MCP handles tools | PASS |
| II. Stateless Server | History from DB; no server memory | PASS |
| III. AI Through MCP Only | Agent uses MCP tools only | PASS |
| IV. Secure User Isolation | JWT + route user_id matching per constitution security rules | PASS |
| V. Agent-Driven Workflow | All code via Claude Code agents | PASS |
| VI. No Hallucinated Confirmations | System prompt enforces tool verification | PASS |

## Existing Code Reuse (from Spec 2 — NO changes)

- `backend/src/models/conversation.py` — Conversation model
- `backend/src/models/message.py` — Message model
- `backend/src/services/conversation_service.py` — CRUD service
- `backend/src/agent/config.py` — Agent configuration + system prompt
- `backend/src/agent/runner.py` — Agent execution + tool capture
- `backend/src/agent/history.py` — DB history reconstruction
- `backend/src/api/chat_router.py` — POST /api/chat, GET endpoints
- `backend/src/database/connection.py` — Table creation

## New Code Required

### Backend (1 file modified)

- `backend/src/api/chat_router.py` — ADD new endpoint
  `POST /api/{user_id}/chat` with path user_id validation against
  JWT token per constitution. Logic reuses existing chat handler.

### Frontend (new ChatKit application)

```text
frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx              # NEW: Chat page with ChatKit
│   ├── chat/[conversationId]/
│   │   └── page.tsx              # NEW: Specific conversation view
│   └── ...                       # EXISTING: auth pages, task pages
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInterface.tsx # NEW: Main chat component
│   │       ├── MessageBubble.tsx # NEW: Message display component
│   │       ├── ToolCallBadge.tsx # NEW: Tool call metadata display
│   │       └── ConversationList.tsx # NEW: Sidebar conversation list
│   ├── services/
│   │   └── chat_service.ts      # NEW: Chat API client
│   └── types/
│       └── chat.ts              # NEW: Chat type definitions
└── ...
```

## Architecture Decisions

### AD-1: user_id Route Parameter Validation

**Decision**: The new `POST /api/{user_id}/chat` endpoint validates
that the path `user_id` matches `current_user.id` from the JWT.
Returns 403 on mismatch.

**Rationale**: Constitution security rule: "Token user_id must match
route user_id." This is the only endpoint that follows this pattern
in Phase III; existing endpoints use JWT-only auth.

### AD-2: ChatKit as Frontend Framework

**Decision**: Use OpenAI ChatKit (`@openai/chat-kit` or equivalent)
for the chat UI per constitution architecture standards.

**Rationale**: Constitution mandates "Frontend: OpenAI ChatKit."
ChatKit provides pre-built chat components (message list, input,
conversation sidebar) that can be integrated into the existing
Next.js frontend.

### AD-3: Frontend Integrates with Existing Next.js App

**Decision**: Add chat pages and components to the existing Next.js
16 frontend from Phase II rather than creating a separate frontend.

**Rationale**: The existing frontend already has auth (Better Auth),
routing (App Router), API client (Axios + JWT), and layout
components. Adding chat pages within the same app reuses all of
this infrastructure.

### AD-4: Chat Service Layer in Frontend

**Decision**: Create a dedicated `chat_service.ts` that wraps API
calls to the chat endpoint, conversations list, and message history.

**Rationale**: Follows the existing pattern in the frontend
(`task_service.ts`, `api_client.ts`). Keeps API logic separate
from UI components.

## Complexity Tracking

No constitution violations detected.

## Key Implementation Notes

### New Endpoint Pattern

```python
@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_with_user_id(
    user_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Validate path user_id matches JWT
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
    # Reuse existing chat logic...
```

### ChatKit Frontend Pattern

```tsx
// ChatInterface.tsx
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat_service';

export function ChatInterface({ conversationId }) {
    const { token, user } = useAuth();
    const [messages, setMessages] = useState([]);

    const sendMessage = async (text) => {
        const response = await chatService.sendMessage(
            user.id, text, conversationId, token
        );
        // Update messages with response
    };
    // Render chat bubbles...
}
```
