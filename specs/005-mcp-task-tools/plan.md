# Implementation Plan: MCP Server and Task Tools Layer

**Branch**: `005-mcp-task-tools` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-mcp-task-tools/spec.md`

## Summary

Build an MCP server integrated within the existing FastAPI backend
that exposes five task management tools (`add_task`, `list_tasks`,
`update_task`, `complete_task`, `delete_task`) using the Official MCP
SDK's FastMCP API. Each tool operates statelessly with per-call DB
sessions, enforces `user_id` validation before any database
operation, and returns structured JSON responses following a
consistent `{success, data, error}` envelope.

## Technical Context

**Language/Version**: Python 3.12 (existing backend)
**Primary Dependencies**: FastAPI 0.109+, MCP SDK (`mcp[cli]`), SQLModel 0.0.14+
**Storage**: Neon Serverless PostgreSQL (existing, via `backend/src/database/connection.py`)
**Testing**: pytest + pytest-asyncio (existing in requirements.txt)
**Target Platform**: Linux server (WSL2 development)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Tool call latency < 500ms p95 for CRUD operations
**Constraints**: Stateless tools, no in-memory caching, Official MCP SDK only
**Scale/Scope**: Single MCP server, 5 tools, reusing existing Task model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Agent-MCP-API Separation | MCP tools call DB directly, not the API layer | PASS — tools are the MCP layer; DB access is their contract boundary |
| II. Stateless Server | No in-memory state between tool calls | PASS — each tool opens fresh DB session |
| III. AI Through MCP Only | All task operations available as MCP tools | PASS — 5 tools covering full CRUD |
| IV. Secure User Isolation | user_id validated in every tool before DB ops | PASS — FR-007, FR-008 enforced |
| V. Agent-Driven Workflow | All code generated via Claude Code agents | PASS — no manual coding |
| VI. No Hallucinated Confirmations | Tools return structured success/error | PASS — FR-009 response schema |

**Post-Phase 1 recheck**: All gates still pass. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/005-mcp-task-tools/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity documentation
├── quickstart.md        # Quickstart validation guide
├── contracts/
│   └── mcp-tools-schema.md  # Tool input/output contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                    # MODIFY: mount MCP server
│   ├── mcp/                       # NEW: MCP module
│   │   ├── __init__.py
│   │   ├── server.py              # FastMCP server initialization
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── add_task.py        # add_task tool
│   │   │   ├── list_tasks.py      # list_tasks tool
│   │   │   ├── update_task.py     # update_task tool
│   │   │   ├── complete_task.py   # complete_task tool
│   │   │   └── delete_task.py     # delete_task tool
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── response.py        # success_response / error_response helpers
│   │       └── validation.py      # validate_user_id / validate_task_id helpers
│   ├── models/
│   │   ├── task.py                # EXISTING: Task, TaskStatus, etc.
│   │   └── user.py                # EXISTING: User model
│   ├── database/
│   │   └── connection.py          # EXISTING: engine, get_session
│   └── ...                        # EXISTING: api/, services/, etc.
├── requirements.txt               # MODIFY: add mcp[cli]
└── ...
```

**Structure Decision**: The MCP module is a new `backend/src/mcp/`
package within the existing backend project. Tools are separated into
individual files for clarity and independent testability. Shared
validation and response formatting utilities are in `mcp/utils/`.
The existing `models/`, `database/`, and `api/` packages are
unchanged except for mounting the MCP server in `main.py`.

## Architecture Decisions

### AD-1: Tool-per-Operation vs Grouped Task Tool

**Decision**: One tool per CRUD operation (5 separate tools).

**Rationale**: Each tool has a distinct input schema and behavior.
Separate tools allow the AI agent to select the exact operation
needed. A single grouped tool would require a discriminator parameter
and conditional logic, making tool selection ambiguous for the agent.

### AD-2: FastMCP vs Low-level Server API

**Decision**: Use FastMCP (`mcp.server.fastmcp.FastMCP`).

**Rationale**: FastMCP auto-generates tool definitions from type hints
and docstrings. This reduces boilerplate and aligns with the SDK's
recommended approach. See research.md R1.

### AD-3: Streamable HTTP Transport

**Decision**: Mount MCP server within FastAPI using streamable HTTP
transport.

**Rationale**: The MCP server must run inside the FastAPI backend per
the architecture outline. Streamable HTTP allows mounting at `/mcp/`
path, sharing the same process and DB connection pool. See research.md R2.

### AD-4: Direct SQLModel Queries (Not TaskService Reuse)

**Decision**: MCP tools write their own SQLModel queries instead of
reusing `TaskService`.

**Rationale**: The existing `TaskService` raises `HTTPException` for
errors, which is incompatible with MCP tools that need to return
structured dict responses. Writing simple SQLModel queries (< 10
lines each) avoids coupling to FastAPI's exception model. See
research.md R6.

### AD-5: Structured Error Response Schema

**Decision**: All tools return `{success, data, error}` JSON envelope
with typed error codes.

**Rationale**: Consistent response format enables the AI agent to
reliably parse results and distinguish success from various failure
modes. Error codes are enumerated in data-model.md. See research.md R4.

## Complexity Tracking

No constitution violations detected. No complexity justifications needed.

## Key Implementation Notes

### Existing Code Reused (No Modifications)

- `backend/src/models/task.py` — Task, TaskStatus, TaskPriority,
  TaskCreate, TaskUpdate, TaskPublic models
- `backend/src/models/user.py` — User model (for reference)
- `backend/src/database/connection.py` — engine, QueuePool config

### Existing Code Modified

- `backend/src/main.py` — Add MCP server mount at `/mcp/`
- `backend/requirements.txt` — Add `mcp[cli]` dependency

### New Files

- `backend/src/mcp/__init__.py`
- `backend/src/mcp/server.py` — FastMCP initialization + tool imports
- `backend/src/mcp/tools/__init__.py`
- `backend/src/mcp/tools/add_task.py`
- `backend/src/mcp/tools/list_tasks.py`
- `backend/src/mcp/tools/update_task.py`
- `backend/src/mcp/tools/complete_task.py`
- `backend/src/mcp/tools/delete_task.py`
- `backend/src/mcp/utils/__init__.py`
- `backend/src/mcp/utils/response.py`
- `backend/src/mcp/utils/validation.py`

### DB Session Pattern in Tools

```python
from sqlmodel import Session, select
from src.database.connection import engine
from src.models.task import Task

# Inside each tool:
with Session(engine) as session:
    # query / mutate
    session.commit()
```

### Validation Pattern in Tools

```python
from src.mcp.utils.validation import validate_user_id, validate_task_id
from src.mcp.utils.response import success_response, error_response

@mcp.tool()
async def some_tool(user_id: str, task_id: str) -> str:
    # Validate inputs first (no DB touch on failure)
    error = validate_user_id(user_id)
    if error:
        return error
    error = validate_task_id(task_id)
    if error:
        return error
    # Proceed with DB operation
    ...
```
