# Feature Specification: MCP Server and Task Tools Layer

**Feature Branch**: `005-mcp-task-tools`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "MCP Server and Task Tools Layer — Official MCP SDK integration, stateless MCP tools, secure database interaction, strict user-scoped operations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a Task via MCP Tool (Priority: P1)

An AI agent receives a user request to create a new task. The agent
invokes the `add_task` MCP tool with the task title, optional
description, and the authenticated user's ID. The tool validates
that `user_id` is present, creates the task record in the database,
and returns a structured response confirming the task was created
with its assigned ID.

**Why this priority**: Task creation is the foundational operation.
Without it, no other tool has data to operate on. This establishes
the MCP server setup, tool registration pattern, database
connectivity, and user validation — all reusable by every
subsequent tool.

**Independent Test**: Can be fully tested by invoking the
`add_task` tool with a valid `user_id` and task title, then
querying the database to confirm the record exists and belongs
to the correct user.

**Acceptance Scenarios**:

1. **Given** an MCP server with `add_task` registered, **When** the
   tool is called with `user_id`, `title`, and optional
   `description`, **Then** a new task record is created in the
   database with status "pending" and the response includes the
   new task ID, title, and status.
2. **Given** an MCP server with `add_task` registered, **When** the
   tool is called without `user_id`, **Then** the tool returns a
   structured error indicating `user_id` is required and no
   database record is created.
3. **Given** an MCP server with `add_task` registered, **When** the
   tool is called without `title`, **Then** the tool returns a
   structured error indicating `title` is required.

---

### User Story 2 - List Tasks for a User (Priority: P2)

An AI agent needs to show the user their current tasks. The agent
invokes the `list_tasks` MCP tool with the authenticated user's
ID. The tool returns only tasks belonging to that user, with no
cross-user data leakage.

**Why this priority**: Listing tasks is the primary read operation
and the most frequently used tool. It validates user isolation
and query filtering, which are critical for security.

**Independent Test**: Can be tested by creating tasks for two
different users, then invoking `list_tasks` for each user and
verifying only their own tasks are returned.

**Acceptance Scenarios**:

1. **Given** a user has 3 tasks in the database, **When**
   `list_tasks` is called with that `user_id`, **Then** exactly 3
   tasks are returned, each belonging to that user.
2. **Given** two users each have tasks, **When** `list_tasks` is
   called for user A, **Then** no tasks belonging to user B appear
   in the response.
3. **Given** a user has no tasks, **When** `list_tasks` is called
   with that `user_id`, **Then** an empty list is returned with a
   success status.
4. **Given** `list_tasks` is called without `user_id`, **Then** a
   structured error is returned and no data is exposed.

---

### User Story 3 - Update a Task (Priority: P3)

An AI agent receives a user request to modify an existing task
(e.g., change title, description, or status). The agent invokes
the `update_task` MCP tool with the task ID, `user_id`, and the
fields to update. The tool verifies the task belongs to the
requesting user before applying changes.

**Why this priority**: Update is a core mutation operation that
introduces ownership verification — the tool must confirm the
task belongs to the user before modifying it.

**Independent Test**: Can be tested by creating a task for user A,
then calling `update_task` with user A's ID and new values, and
verifying changes persist. Then calling `update_task` with user
B's ID on the same task and verifying rejection.

**Acceptance Scenarios**:

1. **Given** a task exists belonging to user A, **When**
   `update_task` is called by user A with a new title, **Then**
   the task title is updated and the response confirms the change.
2. **Given** a task exists belonging to user A, **When**
   `update_task` is called by user B with that task's ID, **Then**
   the tool returns a "task not found" error and no changes are made.
3. **Given** `update_task` is called with a non-existent task ID,
   **Then** the tool returns a "task not found" error.
4. **Given** `update_task` is called without `user_id`, **Then** a
   structured error is returned.

---

### User Story 4 - Complete a Task (Priority: P4)

An AI agent receives a user request to mark a task as done. The
agent invokes the `complete_task` MCP tool with the task ID and
`user_id`. The tool verifies ownership and sets the task status
to "completed" with a completion timestamp.

**Why this priority**: Completing tasks is a distinct status
transition that must be idempotent and trackable. It extends the
ownership verification pattern from US3.

**Independent Test**: Can be tested by creating a pending task,
invoking `complete_task`, and verifying the status changed to
"completed" with a timestamp recorded.

**Acceptance Scenarios**:

1. **Given** a pending task belonging to user A, **When**
   `complete_task` is called by user A, **Then** the task status
   changes to "completed" and a completion timestamp is recorded.
2. **Given** an already completed task, **When** `complete_task` is
   called again, **Then** the tool returns success idempotently
   (no error, status remains "completed").
3. **Given** a task belonging to user A, **When** `complete_task`
   is called by user B, **Then** the tool returns "task not found".
4. **Given** `complete_task` is called without `user_id`, **Then**
   a structured error is returned.

---

### User Story 5 - Delete a Task (Priority: P5)

An AI agent receives a user request to remove a task. The agent
invokes the `delete_task` MCP tool with the task ID and `user_id`.
The tool verifies ownership and removes the task record from the
database.

**Why this priority**: Deletion is the most destructive operation
and requires the strongest ownership checks. It is the lowest
priority because users typically complete tasks more often than
delete them.

**Independent Test**: Can be tested by creating a task, invoking
`delete_task`, and verifying the record no longer exists in the
database. Then verifying a second delete call returns "not found".

**Acceptance Scenarios**:

1. **Given** a task belonging to user A, **When** `delete_task` is
   called by user A, **Then** the task is permanently removed and
   the response confirms deletion.
2. **Given** a task belonging to user A, **When** `delete_task` is
   called by user B, **Then** the tool returns "task not found"
   and the task remains in the database.
3. **Given** a non-existent task ID, **When** `delete_task` is
   called, **Then** the tool returns "task not found".
4. **Given** `delete_task` is called without `user_id`, **Then** a
   structured error is returned.

---

### Edge Cases

- What happens when a tool receives a `user_id` that does not
  exist in the system? The tool MUST still execute the query
  (filtering by `user_id`) and return an empty result or "not
  found" — it MUST NOT leak whether the user exists.
- What happens when the database connection fails mid-operation?
  The tool MUST return a structured error with an appropriate
  error code and message; no partial mutations may persist.
- What happens when `add_task` is called with a title exceeding
  the maximum allowed length? The tool MUST validate input
  length and return a structured error before attempting DB write.
- What happens when `update_task` receives no fields to update?
  The tool MUST return a validation error indicating at least one
  field must be provided.
- What happens when concurrent requests attempt to delete and
  update the same task? The tool that executes second MUST return
  "task not found" if the deletion committed first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize an MCP server using the
  Official MCP SDK with all five tools registered at startup.
- **FR-002**: The `add_task` tool MUST accept `user_id` (required),
  `title` (required), and `description` (optional) parameters and
  create a task record with status "pending".
- **FR-003**: The `list_tasks` tool MUST accept `user_id`
  (required) and return all tasks belonging exclusively to that
  user.
- **FR-004**: The `update_task` tool MUST accept `user_id`
  (required), `task_id` (required), and at least one of `title`,
  `description`, or `status` to modify.
- **FR-005**: The `complete_task` tool MUST accept `user_id`
  (required) and `task_id` (required) and set the task status to
  "completed" with a completion timestamp.
- **FR-006**: The `delete_task` tool MUST accept `user_id`
  (required) and `task_id` (required) and permanently remove the
  task record.
- **FR-007**: Every tool MUST validate that `user_id` is present
  and non-empty before any database operation; missing `user_id`
  MUST result in a structured error response.
- **FR-008**: Every tool that operates on an existing task MUST
  verify the task belongs to the requesting `user_id` before
  performing the operation.
- **FR-009**: All tool responses MUST follow a consistent
  structured format containing `success` (boolean), `data`
  (object or null), and `error` (object or null with `code` and
  `message` fields).
- **FR-010**: All tools MUST be stateless — no in-memory caching,
  no session storage; every invocation MUST query the database
  directly via SQLModel.
- **FR-011**: Input validation MUST occur before any database
  interaction; invalid parameters MUST result in a structured
  error without touching the database.
- **FR-012**: Database changes from `add_task`, `update_task`,
  `complete_task`, and `delete_task` MUST persist across server
  restarts.

### Key Entities

- **Task**: Represents a user's task item. Key attributes: unique
  ID, user ID (owner), title, description, status (pending /
  completed), created timestamp, updated timestamp, completed
  timestamp.
- **Tool Response**: Standardized response envelope for all MCP
  tool invocations. Key attributes: success flag, data payload,
  error object (code + message).

### Assumptions

- The `tasks` table schema already exists or will be created as
  part of a database feature spec; this spec assumes the table is
  available with columns matching the Task entity above.
- `user_id` is provided to each tool as a string parameter; the
  MCP layer does not perform JWT decoding — that responsibility
  belongs to the API/auth layer which passes the decoded
  `user_id` to the MCP tool.
- Task IDs are system-generated unique identifiers (UUIDs or
  auto-incrementing integers — implementation detail deferred to
  planning phase).
- The MCP server runs as a subprocess or integrated service
  alongside the FastAPI backend, not as an independent network
  service.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five MCP tools (`add_task`, `list_tasks`,
  `complete_task`, `delete_task`, `update_task`) are registered
  and callable from the MCP server.
- **SC-002**: Every tool invocation without `user_id` returns a
  structured error within the standard response format — zero
  exceptions reaching the caller.
- **SC-003**: A task created by user A is never visible to user B
  via `list_tasks`; 100% user isolation.
- **SC-004**: Tasks created via `add_task` persist and are
  retrievable via `list_tasks` after server restart.
- **SC-005**: All tool responses conform to the defined response
  schema (`success`, `data`, `error`) with no unstructured
  output.
- **SC-006**: Error scenarios (missing params, non-existent tasks,
  unauthorized access) return appropriate structured errors
  instead of unhandled exceptions.
- **SC-007**: Each tool validates all required parameters before
  any database interaction — zero database operations triggered
  by invalid input.
