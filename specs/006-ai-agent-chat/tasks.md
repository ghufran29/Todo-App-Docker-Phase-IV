# Tasks: AI Agent and Chat Orchestration Layer

**Input**: Design documents from `/specs/006-ai-agent-chat/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/chat-api-schema.md

**Tests**: Not explicitly requested in spec. Tests omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/` for agent module, models, services, API
- Paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Install OpenAI Agents SDK, create package structure, add environment config

- [x] T001 Add `openai-agents` to backend/requirements.txt
- [x] T002 Create agent package directory structure with `__init__.py` at backend/src/agent/__init__.py
- [x] T003 Add `OPENAI_API_KEY` placeholder to backend/.env.example (do NOT add actual key; document in quickstart.md)

**Checkpoint**: SDK dependency declared, agent package skeleton in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models, services, and agent configuration that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create Conversation model in backend/src/models/conversation.py — SQLModel table with fields: `id` (UUID PK), `user_id` (UUID FK → user.id, indexed), `title` (Optional[str], max 200), `created_at` (datetime), `updated_at` (datetime); per data-model.md Conversation entity
- [x] T005 [P] Create Message model in backend/src/models/message.py — SQLModel table with fields: `id` (UUID PK), `conversation_id` (UUID FK → conversation.id, indexed), `role` (str enum: "user"/"assistant"), `content` (str, NOT NULL), `tool_calls` (Optional[JSON]), `created_at` (datetime); per data-model.md Message entity
- [x] T006 Update backend/src/database/connection.py `create_db_and_tables()` to import Conversation and Message models so their tables are created at startup (depends on T004, T005)
- [x] T007 Implement ConversationService in backend/src/services/conversation_service.py — methods: `create_conversation(session, user_id, title=None) -> Conversation`, `get_conversation(session, conversation_id, user_id) -> Conversation | None`, `list_conversations(session, user_id) -> list[Conversation]`, `add_message(session, conversation_id, role, content, tool_calls=None) -> Message`, `get_messages(session, conversation_id, limit=50) -> list[Message]`; all methods filter by user_id for isolation; per data-model.md and contracts/chat-api-schema.md (depends on T004, T005)
- [x] T008 Implement agent configuration in backend/src/agent/config.py — define `SYSTEM_PROMPT` template string with placeholders for `{user_id}`; include rules: (1) identity as task assistant, (2) always pass user_id to tools, (3) verify tool success before confirming, (4) report errors in plain language, (5) only help with task management, (6) ask for clarification on ambiguous requests; define `MCP_SERVER_URL` constant (default `http://localhost:8000/mcp`); define `create_agent(user_id: str)` async function that returns Agent + MCPServerStreamableHttp instances per research.md R1 and R6
- [x] T009 Implement conversation history builder in backend/src/agent/history.py — function `build_history(session, conversation_id, limit=50) -> list[dict]` that queries Message table ordered by created_at ASC, returns list of `{"role": role, "content": content}` dicts for passing to Runner.run(); per research.md R3 (depends on T007)
- [x] T010 Implement agent runner in backend/src/agent/runner.py — async function `run_agent(user_id, messages) -> tuple[str, list[dict]]` that: creates agent via config.create_agent, calls Runner.run with messages, extracts tool_calls from result.new_items (ToolCallItem + ToolCallOutputItem), returns (final_output, tool_calls); per research.md R4 and plan.md Runner Execution Pattern (depends on T008)

**Checkpoint**: DB models created, conversation CRUD service ready, agent configured with MCP tools, history builder and runner operational

---

## Phase 3: User Story 1 - Simple Task Creation via Chat (Priority: P1)

**Goal**: User sends "Add a task called X" and agent invokes add_task MCP tool, returns confirmation with tool_calls

**Independent Test**: POST /api/chat with message "Add a task called Buy groceries", verify response includes response_text confirmation and tool_calls with add_task

### Implementation for User Story 1

- [x] T011 [US1] Implement POST /api/chat endpoint in backend/src/api/chat_router.py — accept JSON body `{"conversation_id": optional str, "message": str}`; require JWT auth via `get_current_user` dependency; if no conversation_id, create new conversation via ConversationService; build history from DB; append new user message to history list; call agent runner with user_id and history; persist user message and assistant response to DB via ConversationService.add_message; return `{"conversation_id": str, "response_text": str, "tool_calls": list}`; per contracts/chat-api-schema.md POST /api/chat (depends on T007, T009, T010)
- [x] T012 [US1] Register chat_router in backend/src/main.py — import chat_router and include with `prefix="/api"` (depends on T011)

**Checkpoint**: "Add a task called X" triggers add_task tool, response includes confirmation and tool_calls list

---

## Phase 4: User Story 2 - List Tasks via Chat (Priority: P2)

**Goal**: User sends "Show my tasks" and agent invokes list_tasks, formats task list in response

**Independent Test**: Create tasks, POST /api/chat with "Show my tasks", verify response lists tasks and tool_calls includes list_tasks

### Implementation for User Story 2

- [ ] T013 [US2] Verify list_tasks intent works end-to-end — no new code needed; the agent (from T008 system prompt + T010 runner + T011 endpoint) already has access to all 5 MCP tools; this task validates that "Show my tasks" correctly triggers list_tasks; if the system prompt needs refinement to improve intent mapping, update backend/src/agent/config.py SYSTEM_PROMPT

**Checkpoint**: "Show my tasks" triggers list_tasks, response formats task list readably

---

## Phase 5: User Story 3 - Complete a Task via Chat (Priority: P3)

**Goal**: User sends "Mark X as done" and agent resolves task + invokes complete_task

**Independent Test**: Create task, POST /api/chat with "Mark Buy groceries as done", verify response confirms completion

### Implementation for User Story 3

- [ ] T014 [US3] Verify complete_task intent works end-to-end — the agent should list_tasks to resolve the task reference by title, then invoke complete_task with the matched task_id; if multi-step tool usage (list → complete) doesn't work reliably, refine SYSTEM_PROMPT in backend/src/agent/config.py to instruct the agent to first list tasks when it needs to resolve a task by name

**Checkpoint**: "Mark X as done" resolves task and completes it, tool_calls shows list_tasks + complete_task

---

## Phase 6: User Story 4 - Update a Task via Chat (Priority: P4)

**Goal**: User sends "Rename X to Y" or "Set priority to high" and agent invokes update_task

**Independent Test**: Create task, POST /api/chat with "Rename Buy groceries to Buy organic groceries", verify update applied

### Implementation for User Story 4

- [ ] T015 [US4] Verify update_task intent works end-to-end — the agent should resolve the task and invoke update_task with correct fields; if field extraction (title vs status vs priority) isn't reliable, refine SYSTEM_PROMPT in backend/src/agent/config.py to list available update fields and their valid values (status: pending/in_progress/completed, priority: low/medium/high/urgent)

**Checkpoint**: "Rename X to Y" triggers update_task, response confirms change

---

## Phase 7: User Story 5 - Delete a Task via Chat (Priority: P5)

**Goal**: User sends "Delete X" and agent invokes delete_task with confirmation

**Independent Test**: Create task, POST /api/chat with "Delete Buy groceries", verify deletion confirmed

### Implementation for User Story 5

- [ ] T016 [US5] Verify delete_task intent works end-to-end — the agent should resolve the task and invoke delete_task; verify response clearly confirms the irreversible deletion; refine SYSTEM_PROMPT if needed

**Checkpoint**: "Delete X" triggers delete_task, response confirms removal

---

## Phase 8: User Story 6 - Multi-Turn Conversation with History (Priority: P6)

**Goal**: Follow-up messages use conversation history to resolve references from prior turns

**Independent Test**: Send "Show my tasks" then "Complete the first one" in same conversation_id, verify agent resolves "the first one" from history

### Implementation for User Story 6

- [ ] T017 [US6] Verify multi-turn history reconstruction works — send multiple messages to the same conversation_id; verify (1) history is reconstructed from DB, (2) follow-up references like "the first one" are resolved using prior context, (3) all messages persisted to messages table; if history format doesn't work with Runner.run(), adjust build_history output format in backend/src/agent/history.py to match SDK expected input format

**Checkpoint**: Follow-up messages resolve references from prior turns, all messages persisted

---

## Phase 9: Conversations API Endpoints

**Purpose**: Additional read endpoints for conversation management

- [x] T018 [P] Implement GET /api/conversations endpoint in backend/src/api/chat_router.py — return list of user's conversations with id, title, created_at, updated_at; require JWT auth; per contracts/chat-api-schema.md (depends on T007)
- [x] T019 [P] Implement GET /api/conversations/{conversation_id}/messages endpoint in backend/src/api/chat_router.py — return message history for a conversation; require JWT auth; verify conversation belongs to user; per contracts/chat-api-schema.md (depends on T007)

**Checkpoint**: Users can list their conversations and retrieve message history

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation across all user stories

- [ ] T020 Verify agent handles out-of-scope requests — send "What's the weather?" to POST /api/chat, verify agent politely redirects to task management (SC-006)
- [ ] T021 Verify agent handles tool errors gracefully — trigger an error (e.g., complete a non-existent task), verify response is plain language without error codes (SC-005)
- [ ] T022 Verify no hallucinated confirmations — send "Complete task XYZ" when no such task exists, verify agent reports failure honestly (SC-003)
- [ ] T023 Verify response structure — confirm every response from POST /api/chat includes both `response_text` and `tool_calls` fields, even when no tools are invoked (SC-002)
- [ ] T024 Run quickstart.md validation checklist from specs/006-ai-agent-chat/quickstart.md — execute all 10 checklist items and confirm pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — creates the chat endpoint
- **US2-US5 (Phase 4-7)**: Depend on Phase 3 (US1 creates the endpoint they all use)
- **US6 (Phase 8)**: Depends on Phase 3 (needs chat endpoint with history)
- **Conversations API (Phase 9)**: Depends on Phase 2 only (uses ConversationService)
- **Polish (Phase 10)**: Depends on all user stories complete

### Parallel Opportunities

- T004 and T005 can run in parallel (different model files)
- T018 and T019 can run in parallel (same file but independent endpoints)
- US2-US5 (T013-T016) are system prompt refinement tasks — they can run sequentially but each is lightweight

### Within User Stories

- US1 is the only story requiring new code (chat endpoint + router registration)
- US2-US6 are primarily validation + system prompt refinement
- All tool invocations flow through the same endpoint created in US1

---

## Implementation Strategy

### MVP Scope

**User Story 1 (simple task creation via chat)** alone constitutes a viable MVP:
- Proves OpenAI Agents SDK + MCP integration works
- Proves agent selects correct tool from natural language
- Proves stateless history reconstruction from DB
- Proves structured response with tool_calls
- All subsequent stories use the same infrastructure

### Incremental Delivery

1. **Phase 1-2**: Foundation (T001-T010) — Models, services, agent config
2. **Phase 3**: US1 chat endpoint (T011-T012) — First working conversation
3. **Phase 4-7**: US2-US5 (T013-T016) — Intent validation + prompt refinement
4. **Phase 8**: US6 (T017) — Multi-turn conversation validation
5. **Phase 9**: Conversations API (T018-T019) — Read endpoints
6. **Phase 10**: Polish (T020-T024) — Cross-cutting validation
