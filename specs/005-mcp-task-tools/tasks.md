# Tasks: MCP Server and Task Tools Layer

**Input**: Design documents from `/specs/005-mcp-task-tools/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/mcp-tools-schema.md

**Tests**: Not explicitly requested in spec. Tests omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/` for MCP module
- Paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Install MCP SDK dependency and create package structure

- [x] T001 Add `mcp[cli]` to backend/requirements.txt
- [x] T002 Create MCP package directory structure with `__init__.py` files at backend/src/mcp/__init__.py, backend/src/mcp/tools/__init__.py, and backend/src/mcp/utils/__init__.py

**Checkpoint**: MCP SDK installed, package skeleton in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and MCP server initialization that ALL tools depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Implement response helpers (`success_response`, `error_response`) in backend/src/mcp/utils/response.py per contracts/mcp-tools-schema.md response envelope — must return JSON string with `success`, `data`, `error` fields; error includes `code` and `message`
- [x] T004 [P] Implement validation helpers (`validate_user_id`, `validate_task_id`) in backend/src/mcp/utils/validation.py — validate UUID format using `uuid.UUID()`, return `None` on valid input or error response string (via `error_response`) with codes MISSING_USER_ID, INVALID_USER_ID, MISSING_TASK_ID, INVALID_TASK_ID per data-model.md error codes
- [x] T005 Initialize FastMCP server instance in backend/src/mcp/server.py — import `FastMCP` from `mcp.server.fastmcp`, create `mcp = FastMCP("todo-task-tools")` instance, import all tool modules so `@mcp.tool()` decorators register at import time (depends on T003, T004)
- [x] T006 Mount MCP server within FastAPI app in backend/src/main.py — import the MCP app from `src.mcp.server` and mount it at `/mcp/` path using streamable HTTP transport per research.md R2 and plan.md AD-3 (depends on T005)

**Checkpoint**: Foundation ready — MCP server starts with FastAPI, utilities available for all tools

---

## Phase 3: User Story 1 - Add a Task via MCP Tool (Priority: P1)

**Goal**: AI agent can create a new task via the `add_task` MCP tool with user_id validation and structured response

**Independent Test**: Invoke `add_task` with valid user_id and title, verify task record created in DB with status "pending" and structured response returned

### Implementation for User Story 1

- [x] T007 [US1] Implement `add_task` tool in backend/src/mcp/tools/add_task.py — decorate with `@mcp.tool()`, accept `user_id: str` (required), `title: str` (required), `description: str = ""` (optional); validate user_id via `validate_user_id`, validate title is non-empty and <= 200 chars; open `Session(engine)`, create `Task` with `user_id`, `title`, `description`, `status=TaskStatus.PENDING`; commit and return `success_response` with task data dict (id, user_id, title, description, status, priority, created_at, updated_at); on DB error catch exception and return `error_response` with code DB_ERROR; per contracts/mcp-tools-schema.md add_task contract
- [x] T008 [US1] Register add_task tool import in backend/src/mcp/server.py — add `from src.mcp.tools.add_task import *` (or explicit import) so the `@mcp.tool()` decorator registers with the FastMCP instance (depends on T007)

**Checkpoint**: `add_task` tool callable, creates tasks in DB, validates inputs, returns structured response

---

## Phase 4: User Story 2 - List Tasks for a User (Priority: P2)

**Goal**: AI agent can retrieve all tasks for a user via `list_tasks` with user isolation

**Independent Test**: Create tasks for two users, invoke `list_tasks` for each, verify only own tasks returned

### Implementation for User Story 2

- [x] T009 [US2] Implement `list_tasks` tool in backend/src/mcp/tools/list_tasks.py — decorate with `@mcp.tool()`, accept `user_id: str` (required); validate user_id via `validate_user_id`; open `Session(engine)`, query `select(Task).where(Task.user_id == uuid.UUID(user_id))`; return `success_response` with `{"tasks": [...], "count": N}` where each task is a dict with all fields; on empty result return success with empty list and count 0; on DB error return `error_response` with code DB_ERROR; per contracts/mcp-tools-schema.md list_tasks contract
- [x] T010 [US2] Register list_tasks tool import in backend/src/mcp/server.py — add import for `list_tasks` module (depends on T009)

**Checkpoint**: `list_tasks` returns only user-scoped tasks, empty list for no tasks, structured response

---

## Phase 5: User Story 3 - Update a Task (Priority: P3)

**Goal**: AI agent can modify task fields via `update_task` with ownership verification

**Independent Test**: Create task for user A, call `update_task` as user A (succeeds), call as user B (returns task not found)

### Implementation for User Story 3

- [x] T011 [US3] Implement `update_task` tool in backend/src/mcp/tools/update_task.py — decorate with `@mcp.tool()`, accept `user_id: str`, `task_id: str`, `title: str = ""`, `description: str = ""`, `status: str = ""`, `priority: str = ""`; validate user_id and task_id via helpers; check at least one update field is non-empty (else return error_response NO_FIELDS_TO_UPDATE); open `Session(engine)`, query task by id AND user_id; if not found return error_response TASK_NOT_FOUND; apply non-empty fields (validate status against TaskStatus enum, priority against TaskPriority enum, title <= 200 chars); set `updated_at = datetime.utcnow()`; commit and return success_response with updated task data; per contracts/mcp-tools-schema.md update_task contract
- [x] T012 [US3] Register update_task tool import in backend/src/mcp/server.py (depends on T011)

**Checkpoint**: `update_task` modifies correct task, rejects cross-user access, validates all fields

---

## Phase 6: User Story 4 - Complete a Task (Priority: P4)

**Goal**: AI agent can mark a task as completed via `complete_task` with idempotent behavior

**Independent Test**: Create pending task, invoke `complete_task`, verify status = "completed" with `completed_at` timestamp

### Implementation for User Story 4

- [x] T013 [US4] Implement `complete_task` tool in backend/src/mcp/tools/complete_task.py — decorate with `@mcp.tool()`, accept `user_id: str`, `task_id: str`; validate both via helpers; open `Session(engine)`, query task by id AND user_id; if not found return error_response TASK_NOT_FOUND; set `status = TaskStatus.COMPLETED`, `completed_at = datetime.utcnow()`, `updated_at = datetime.utcnow()`; if already completed, return success idempotently (no error); commit and return success_response with task data including completed_at; per contracts/mcp-tools-schema.md complete_task contract
- [x] T014 [US4] Register complete_task tool import in backend/src/mcp/server.py (depends on T013)

**Checkpoint**: `complete_task` transitions status, records timestamp, idempotent on re-complete

---

## Phase 7: User Story 5 - Delete a Task (Priority: P5)

**Goal**: AI agent can permanently remove a task via `delete_task` with ownership verification

**Independent Test**: Create task, invoke `delete_task`, verify record removed; second delete returns "not found"

### Implementation for User Story 5

- [x] T015 [US5] Implement `delete_task` tool in backend/src/mcp/tools/delete_task.py — decorate with `@mcp.tool()`, accept `user_id: str`, `task_id: str`; validate both via helpers; open `Session(engine)`, query task by id AND user_id; if not found return error_response TASK_NOT_FOUND; `session.delete(task)`, commit; return success_response with `{"task_id": str(task_id), "deleted": True}`; per contracts/mcp-tools-schema.md delete_task contract
- [x] T016 [US5] Register delete_task tool import in backend/src/mcp/server.py (depends on T015)

**Checkpoint**: `delete_task` removes record, rejects cross-user access, idempotent on re-delete (returns not found)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verification and integration validation across all tools

- [x] T017 Verify all five tools are registered by starting the MCP server and checking tool list — run `python -c "from src.mcp.server import mcp; print([t.name for t in mcp.list_tools()])"` from backend/ directory; expected: add_task, list_tasks, update_task, complete_task, delete_task (SC-001)
- [x] T018 [P] Validate structured response conformance — manually invoke each tool with valid and invalid inputs; verify all responses match `{success, data, error}` schema per contracts/mcp-tools-schema.md (SC-005)
- [x] T019 [P] Validate user isolation — create tasks for two different user_ids via add_task, then list_tasks for each; confirm zero cross-user data leakage (SC-003)
- [x] T020 Run quickstart.md validation checklist from specs/005-mcp-task-tools/quickstart.md — execute all 8 checklist items and confirm pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001, T002) — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Phase 2 completion (T003-T006)
  - User stories can proceed sequentially in priority order (P1 → P2 → P3 → P4 → P5)
  - Each story consists of implementing the tool + registering it in server.py
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 — No dependency on other stories
- **US2 (P2)**: Depends on Phase 2 — Functionally useful after US1 (needs tasks to list)
- **US3 (P3)**: Depends on Phase 2 — Functionally useful after US1 (needs tasks to update)
- **US4 (P4)**: Depends on Phase 2 — Functionally useful after US1 (needs tasks to complete)
- **US5 (P5)**: Depends on Phase 2 — Functionally useful after US1 (needs tasks to delete)

### Within Each User Story

- Implement tool file first (T00X)
- Register import in server.py second (T00X+1)
- Tool file depends on Phase 2 utilities (response.py, validation.py)

### Parallel Opportunities

- T003 and T004 can run in parallel (different files, no dependencies)
- T018 and T019 can run in parallel (different validation concerns)
- All tool implementations (T007, T009, T011, T013, T015) could theoretically run in parallel since they are in separate files — but each needs the server.py import registered, so sequential P1→P5 order is recommended

---

## Implementation Strategy

### MVP Scope

**User Story 1 (add_task)** alone constitutes a viable MVP:
- Proves MCP server initialization works
- Proves FastMCP tool registration works
- Proves DB connectivity from MCP tools works
- Proves validation + structured response pattern works
- All subsequent tools follow the same pattern

### Incremental Delivery

1. **Phase 1-2**: Foundation (T001-T006) — MCP server boots with FastAPI
2. **Phase 3**: US1 add_task (T007-T008) — First tool operational
3. **Phase 4**: US2 list_tasks (T009-T010) — Read verification
4. **Phase 5**: US3 update_task (T011-T012) — Mutation with ownership check
5. **Phase 6**: US4 complete_task (T013-T014) — Status transition
6. **Phase 7**: US5 delete_task (T015-T016) — Destructive operation
7. **Phase 8**: Polish (T017-T020) — End-to-end validation
