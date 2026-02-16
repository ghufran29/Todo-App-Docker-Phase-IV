---
id: 2
title: Create MCP Task Tools Plan
stage: plan
date: 2026-02-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: mcp-task-tools
branch: 005-mcp-task-tools
user: user
command: /sp.plan
labels: ["mcp", "task-tools", "plan", "phase-3", "architecture"]
links:
  spec: specs/005-mcp-task-tools/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-mcp-task-tools/plan.md
  - specs/005-mcp-task-tools/research.md
  - specs/005-mcp-task-tools/data-model.md
  - specs/005-mcp-task-tools/contracts/mcp-tools-schema.md
  - specs/005-mcp-task-tools/quickstart.md
  - CLAUDE.md
tests:
  - none
---

## Prompt

before planning first you have to review the current frontend and backend folders and its files after that generate the plan of spec-1 of phase-III /sp.plan ## Create
- MCP server architecture sketch
- Tool registration map
- Tool parameter schema definitions
- Validation checklist tied to success criteria

## Architecture outline
- MCP server runs inside FastAPI backend
- Tools defined using Official MCP SDK
- Each tool receives structured parameters
- Each tool opens DB session per call
- user_id validated before query execution
- Tool returns structured JSON response
- No state stored between tool calls

## Decisions needing documentation
- Tool per operation vs grouped task tool
- Parameter validation strategy
- Error response structure standardization
- DB session per call approach
- Enforcing user isolation at tool layer

## Task breakdown
- Initialize MCP server
- Register all five task tools
- Define input schemas for each tool
- Implement SQLModel DB access inside tools
- Add user ownership validation
- Implement consistent success responses
- Implement structured error handling
- Add logging for tool calls

## Testing strategy
- add_task creates task correctly
- list_tasks returns correct filtered results
- complete_task updates correct record
- delete_task removes correct record
- update_task modifies correct fields
- Tool call without user_id fails
- Cross user task access blocked
- Tool responses match specification

## Quality validation
- All tools match spec contract
- No direct DB access outside tools
- Stateless behavior confirmed
- No hardcoded credentials
- Reviewers can trace tool logic to DB operations

## Response snapshot

Reviewed existing codebase (backend: FastAPI + SQLModel + JWT auth with
Task/User models, connection pooling, full CRUD via TaskService and
task_router; frontend: Next.js 16 + React 19 + Better Auth + Axios).
Generated complete implementation plan with 5 architecture decisions:
(1) tool-per-operation, (2) FastMCP API, (3) streamable HTTP transport,
(4) direct SQLModel queries instead of TaskService reuse, (5) structured
error response schema. Created research.md with 6 research decisions,
data-model.md documenting existing Task/User models and new ToolResponse
schema with 8 error codes, contracts/mcp-tools-schema.md with full I/O
contracts for all 5 tools, quickstart.md with validation checklist.
Constitution check passed all 6 gates. Agent context updated in CLAUDE.md.

## Outcome

- ✅ Impact: Complete implementation plan for MCP task tools layer with architecture decisions, research, data model, contracts, and quickstart
- 🧪 Tests: Constitution check passed 6/6 gates; spec quality checklist passed 16/16 items
- 📁 Files: plan.md, research.md, data-model.md, contracts/mcp-tools-schema.md, quickstart.md, CLAUDE.md updated
- 🔁 Next prompts: /sp.tasks to generate implementation task list, then /sp.implement
- 🧠 Reflection: Codebase review revealed TaskService is tightly coupled to HTTPException, justifying the decision to write direct SQLModel queries in MCP tools rather than attempting reuse

## Evaluation notes (flywheel)

- Failure modes observed: Background explore agents hit API 400 errors; recovered by using direct file reads
- Graders run and results (PASS/FAIL): Constitution check PASS (6/6), spec quality PASS (16/16)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Verify MCP SDK streamable HTTP transport integration with FastAPI ASGI mount during implementation
