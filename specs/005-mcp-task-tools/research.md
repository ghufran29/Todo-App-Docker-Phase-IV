# Research: MCP Server and Task Tools Layer

**Branch**: `005-mcp-task-tools` | **Date**: 2026-02-11

## R1: MCP Python SDK — FastMCP Server Pattern

**Decision**: Use `mcp.server.fastmcp.FastMCP` for server initialization
and tool registration.

**Rationale**: FastMCP provides a decorator-based API (`@mcp.tool()`)
that auto-generates tool definitions from Python type hints and
docstrings. This reduces boilerplate and keeps tool registration close
to implementation. It is the recommended high-level API from the
Official MCP SDK.

**Alternatives considered**:
- Low-level `mcp.server.Server` with `@server.list_tools()` and
  `@server.call_tool()` handlers — more verbose, requires manual
  schema generation, suitable for advanced routing needs.
- Custom JSON-RPC server — rejected; violates the "Official MCP SDK
  only" constraint.

**Key pattern**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("todo-task-tools")

@mcp.tool()
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Add a new task for the user."""
    # implementation
    pass
```

## R2: MCP Transport — Streamable HTTP for FastAPI Integration

**Decision**: Use Streamable HTTP transport (`mcp.run(transport="streamable-http")`)
to integrate the MCP server as a mounted endpoint within the existing
FastAPI application.

**Rationale**: The existing backend is a FastAPI application running on
uvicorn. Using streamable HTTP transport allows the MCP server to be
mounted at a specific path (e.g., `/mcp/`) inside the FastAPI app,
sharing the same process and database connection pool. This avoids
running a separate process and aligns with the constitution's
"MCP server runs inside FastAPI backend" architecture.

**Alternatives considered**:
- STDIO transport — designed for CLI/subprocess usage, not suitable for
  web server integration where the MCP server must coexist with HTTP
  endpoints.
- SSE (Server-Sent Events) transport — legacy approach, being replaced
  by streamable HTTP in MCP SDK.
- Separate process — adds deployment complexity and inter-process
  communication overhead; rejected per architecture outline.

## R3: DB Session Management per Tool Call

**Decision**: Each MCP tool call opens a fresh SQLModel `Session`
using the existing `engine` from `backend/src/database/connection.py`.

**Rationale**: This is consistent with the stateless server principle.
The existing codebase already uses `get_session()` as a FastAPI
dependency that yields a session per request. MCP tools will follow
the same pattern but without FastAPI dependency injection — they will
directly create a session from the engine.

**Alternatives considered**:
- Shared session across tool calls — violates stateless principle;
  session state could leak between calls.
- Session pool per tool — unnecessary complexity; SQLAlchemy's
  QueuePool already manages connections.

**Key pattern**:
```python
from sqlmodel import Session
from backend.src.database.connection import engine

def get_db_session():
    return Session(engine)
```

## R4: Tool Response Schema Standardization

**Decision**: All tools return a dict matching the schema:
```json
{
  "success": true/false,
  "data": { ... } or null,
  "error": { "code": "...", "message": "..." } or null
}
```

**Rationale**: Consistent response format allows the AI agent to
parse results uniformly. The spec mandates FR-009 (structured format
with success, data, error). This matches the pattern already used in
the existing `task_router.py` delete endpoint.

**Alternatives considered**:
- Return raw MCP TextContent — less structured, harder for agent to
  parse programmatically.
- Raise exceptions — MCP tools should handle errors internally and
  return structured errors rather than letting exceptions propagate.

## R5: User Isolation at Tool Layer

**Decision**: Every MCP tool receives `user_id` as a required string
parameter and validates it before any database operation. The MCP
layer does not perform JWT decoding — `user_id` is passed from the
API/auth layer.

**Rationale**: This aligns with constitution principle IV (Secure User
Isolation) and the spec assumption that JWT decoding is the API
layer's responsibility. The existing `TaskService` already filters
by `user_id` in all queries, so MCP tools can reuse the service
layer or replicate the pattern.

**Alternatives considered**:
- MCP tools decode JWT themselves — violates layer separation; auth
  is the API layer's concern.
- Trust user_id without validation — violates FR-007; every tool must
  validate user_id is present and non-empty.

## R6: Reuse Existing TaskService vs Direct DB in Tools

**Decision**: MCP tools will directly use SQLModel queries against
the existing `Task` model rather than calling `TaskService` methods.

**Rationale**: The existing `TaskService` is tightly coupled to
FastAPI's `HTTPException` for error handling. MCP tools need to
return structured dict responses, not raise HTTP exceptions. Writing
slim SQLModel queries within each tool avoids this mismatch while
still using the same `Task` model and `engine`. The queries are
simple (< 10 lines each) and don't warrant a shared service layer.

**Alternatives considered**:
- Refactor TaskService to decouple from HTTPException — scope creep;
  modifying existing Phase II code for Phase III needs.
- Create an MCP-specific TaskService — over-engineering for 5 simple
  CRUD operations with < 10 lines each.
