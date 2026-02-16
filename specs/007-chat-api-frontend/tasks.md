# Tasks: Chat API, Persistence, and Frontend Integration

**Input**: Design documents from `/specs/007-chat-api-frontend/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Tests omitted.

**Organization**: Tasks grouped by user story. Backend delta is minimal (1 new endpoint). Frontend is the primary new scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5)
- Exact file paths included

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/`
- Paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Install ChatKit dependency, create frontend chat directories

- [ ] T001 Install OpenAI ChatKit package in frontend — run `npm install @openai/chat-ui-kit` (or the correct ChatKit package name) in frontend/ directory; if the package is not available on npm, use a custom chat component approach with existing Tailwind CSS
- [ ] T002 Create chat component directory at frontend/src/components/chat/ and chat types file at frontend/src/types/chat.ts

**Checkpoint**: Frontend dependencies installed, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Chat type definitions and API service that all frontend stories depend on

- [ ] T003 [P] Define chat TypeScript types in frontend/src/types/chat.ts — types: `ChatMessage` (id, role, content, tool_calls, created_at), `Conversation` (id, title, created_at, updated_at), `ChatResponse` (conversation_id, response_text, tool_calls), `ToolCall` (tool, arguments, result)
- [ ] T004 [P] Implement chat API service in frontend/src/services/chat_service.ts — functions: `sendMessage(userId, message, conversationId?, token) -> ChatResponse` calls `POST /api/{userId}/chat`; `listConversations(token) -> Conversation[]` calls `GET /api/conversations`; `getMessages(conversationId, token) -> ChatMessage[]` calls `GET /api/conversations/{id}/messages`; use existing `api_client.ts` Axios instance with JWT interceptor per plan.md AD-4
- [ ] T005 Add `POST /api/{user_id}/chat` endpoint to backend/src/api/chat_router.py — new function `chat_with_user_id` that accepts `user_id` path param + `ChatRequest` body; validates `str(current_user.id) != user_id` returns 403 "User ID mismatch"; otherwise delegates to same logic as existing `chat` function (create/get conversation, build history, run agent, persist messages, return ChatResponse); per contracts/chat-endpoint-schema.md and plan.md AD-1

**Checkpoint**: Types defined, API service ready, user_id endpoint operational

---

## Phase 3: User Story 1 - Send Chat Message via Authenticated Endpoint (Priority: P1)

**Goal**: User can send a message through the ChatKit UI, backend processes it with JWT + user_id validation, returns structured response

**Independent Test**: Sign in, open chat page, send "Add a task called Buy groceries", verify agent response appears with tool call metadata

### Implementation for User Story 1

- [ ] T006 [US1] Implement ChatInterface component in frontend/src/components/chat/ChatInterface.tsx — main chat component with message list display, text input with send button; accepts `conversationId` prop (optional); on send: call `chatService.sendMessage`; display user message immediately (optimistic), then display agent response when received; show loading indicator while waiting; use auth context to get user.id and token; per plan.md ChatKit Frontend Pattern
- [ ] T007 [US1] Implement MessageBubble component in frontend/src/components/chat/MessageBubble.tsx — renders a single message with role-based alignment (user right, assistant left); shows message content text; accepts `ChatMessage` props; includes timestamp display
- [ ] T008 [US1] Implement ToolCallBadge component in frontend/src/components/chat/ToolCallBadge.tsx — renders tool call metadata as a small badge/card below assistant messages; shows tool name and success/failure indicator; expands on click to show arguments and result; accepts `ToolCall` props
- [ ] T009 [US1] Create chat page at frontend/app/chat/page.tsx — App Router page that renders ChatInterface with no conversationId (creates new conversation on first message); wrapped in ProtectedRoute component for auth; includes link to conversation list

**Checkpoint**: User can send messages via chat UI, see agent responses with tool call metadata

---

## Phase 4: User Story 2 - Retrieve Conversation List (Priority: P2)

**Goal**: User sees a list of their conversations, ordered by most recent activity

**Independent Test**: Create multiple conversations via chat, navigate to conversation list, verify all appear with titles

### Implementation for User Story 2

- [ ] T010 [US2] Implement ConversationList component in frontend/src/components/chat/ConversationList.tsx — fetches conversations via `chatService.listConversations`; displays as a sidebar or list view with title, last updated time; clicking a conversation navigates to `/chat/{conversationId}`; includes "New Conversation" button that navigates to `/chat`; shows empty state when no conversations exist
- [ ] T011 [US2] Update chat page at frontend/app/chat/page.tsx to include ConversationList as a sidebar layout alongside the ChatInterface component

**Checkpoint**: Conversation list displays all user's conversations, clicking navigates to conversation

---

## Phase 5: User Story 3 - Retrieve Conversation Messages (Priority: P3)

**Goal**: User can select an existing conversation and see the full message history

**Independent Test**: Create a conversation with messages, navigate to it, verify all messages displayed in order

### Implementation for User Story 3

- [ ] T012 [US3] Create conversation detail page at frontend/app/chat/[conversationId]/page.tsx — App Router dynamic route; loads message history via `chatService.getMessages(conversationId)`; passes messages to ChatInterface; ChatInterface appends new messages to history as the user continues chatting; wrapped in ProtectedRoute

**Checkpoint**: Full message history loads for existing conversations, new messages appended

---

## Phase 6: User Story 4 - Persistence Across Restarts (Priority: P4)

**Goal**: Conversations survive server restart with zero data loss

**Independent Test**: Create conversation, restart backend, navigate to conversation, verify history intact and follow-up messages work

### Implementation for User Story 4

- [ ] T013 [US4] Verify persistence across restart — no new code needed; validate that existing DB persistence (Spec 2) ensures conversations and messages survive backend restart; send messages, restart backend, verify conversation list and message history are intact via frontend; if any issues found, fix in relevant backend files

**Checkpoint**: Conversations and messages survive restart, agent resumes context

---

## Phase 7: User Story 5 - ChatKit Frontend Full Workflow (Priority: P5)

**Goal**: User completes full task management workflow entirely through chat UI

**Independent Test**: Using only the chat UI: add a task, list tasks, complete a task, delete a task

### Implementation for User Story 5

- [ ] T014 [US5] Verify end-to-end workflow in ChatKit UI — send "Add a task called Test", then "Show my tasks", then "Mark Test as done", then "Delete Test"; verify each action produces correct tool calls and appropriate agent responses displayed in the UI; if any UI issues (layout, display, loading states), fix in relevant frontend components
- [ ] T015 [US5] Add error and loading states to ChatInterface in frontend/src/components/chat/ChatInterface.tsx — show loading spinner or "thinking..." indicator while agent processes; show error message if API call fails (network error, 401, 403); allow retry on failure; show connection error banner if backend is unreachable

**Checkpoint**: Full CRUD workflow via chat UI with proper loading and error states

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation

- [ ] T016 Verify JWT authentication — send request to `POST /api/{user_id}/chat` without token, verify 401; send with wrong user_id, verify 403 (SC-001)
- [ ] T017 Verify cross-user isolation — create conversation as user A, attempt to access via user B's token, verify 404 (SC-005)
- [ ] T018 Verify response format — confirm every chat response includes `conversation_id`, `response_text`, `tool_calls` fields (SC-006)
- [ ] T019 Verify frontend displays within 2 seconds for conversations with up to 50 messages (SC-007)
- [ ] T020 Run quickstart.md validation checklist from specs/007-chat-api-frontend/quickstart.md — execute all 12 items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1
- **US1 (Phase 3)**: Depends on Phase 2 — creates the chat UI
- **US2 (Phase 4)**: Depends on Phase 3 (needs ChatInterface to exist)
- **US3 (Phase 5)**: Depends on Phase 3 (needs conversation page pattern)
- **US4 (Phase 6)**: Depends on Phase 3 (validation only)
- **US5 (Phase 7)**: Depends on US1-US3 (full workflow requires all UI)
- **Polish (Phase 8)**: Depends on all user stories

### Parallel Opportunities

- T003 and T004 can run in parallel (different files)
- T006, T007, T008 can run in parallel (different component files)
- T016 and T017 can run in parallel (different validation concerns)

---

## Implementation Strategy

### MVP Scope

**US1 (ChatInterface + send message)** alone constitutes MVP:
- Proves chat UI → API → agent → MCP → DB → response pipeline
- Shows tool call metadata in the interface
- Creates conversations on demand

### Incremental Delivery

1. **Phase 1-2**: Setup + types + service + backend endpoint (T001-T005)
2. **Phase 3**: US1 chat interface + message display (T006-T009)
3. **Phase 4**: US2 conversation list + sidebar (T010-T011)
4. **Phase 5**: US3 conversation detail page (T012)
5. **Phase 6-7**: US4-US5 validation + error states (T013-T015)
6. **Phase 8**: Polish + full validation (T016-T020)
