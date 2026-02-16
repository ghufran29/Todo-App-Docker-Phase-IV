---
id: 4
title: Implement MCP Task Tools Layer
stage: green
date: 2026-02-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: mcp-task-tools
branch: 005-mcp-task-tools
user: user
command: /sp.implement
labels: ["mcp", "task-tools", "implementation", "phase-3", "green"]
links:
  spec: specs/005-mcp-task-tools/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/requirements.txt
  - backend/src/main.py
  - backend/src/mcp/__init__.py
  - backend/src/mcp/server.py
  - backend/src/mcp/app.py
  - backend/src/mcp/tools/__init__.py
  - backend/src/mcp/tools/add_task.py
  - backend/src/mcp/tools/list_tasks.py
  - backend/src/mcp/tools/update_task.py
  - backend/src/mcp/tools/complete_task.py
  - backend/src/mcp/tools/delete_task.py
  - backend/src/mcp/utils/__init__.py
  - backend/src/mcp/utils/response.py
  - backend/src/mcp/utils/validation.py
  - specs/005-mcp-task-tools/tasks.md
tests:
  - T017 tool registration verification PASS (5/5 tools)
  - T018 structured response conformance PASS (8/8 checks)
  - T019 user isolation PASS (14/14 assertions)
---

## Prompt

spec-1 of phase-3

## Response snapshot

Implemented all 20 tasks across 8 phases for MCP Server and Task Tools
Layer. Created 14 new files in backend/src/mcp/ module. Modified 2
existing files (main.py for MCP mount, requirements.txt for mcp[cli]).
Architecture: FastMCP server with @mcp.tool() decorators, mounted at
/mcp/ in FastAPI via streamable HTTP transport. Each tool is stateless
with per-call DB sessions. Resolved circular import issue by splitting
server.py (instance only) from app.py (instance + tool imports).
All validation tests passed: 5/5 tools registered, 8/8 response format
checks, 14/14 user isolation assertions including cross-user access
rejection, idempotent complete, and re-delete handling.

## Outcome

- ✅ Impact: Complete MCP task tools layer — 5 tools, user isolation, structured responses, mounted in FastAPI
- 🧪 Tests: T017 PASS (5 tools), T018 PASS (8 response checks), T019 PASS (14 isolation assertions)
- 📁 Files: 14 new + 2 modified = 16 files total
- 🔁 Next prompts: /sp.git.commit_pr to commit and create PR; then proceed to Spec 2 (conversation layer)
- 🧠 Reflection: Circular import between server.py and tool files resolved by splitting into server.py (FastMCP instance) and app.py (imports tools to register). FK constraint required real User records for integration testing.

## Evaluation notes (flywheel)

- Failure modes observed: (1) Circular import server.py <-> tool files, resolved by app.py split; (2) FK constraint on user_id required real User records in DB for integration test
- Graders run and results (PASS/FAIL): T017 PASS, T018 PASS, T019 PASS, T020 PASS (via T019 comprehensive test)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Test FastAPI HTTP-level MCP endpoint with actual HTTP client (curl/httpx) to verify streamable HTTP transport end-to-end
