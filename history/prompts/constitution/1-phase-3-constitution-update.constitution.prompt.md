---
id: 1
title: Phase 3 Constitution Update
stage: constitution
date: 2026-02-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "phase-3", "mcp-architecture", "ai-chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

update it for phase-3 ## Project
Todo AI Chatbot – Phase III
Conversational task management using MCP architecture.

## Core principles
- Clear separation between Agent, MCP tools, and API layer
- Stateless server. All state stored in Neon PostgreSQL
- AI actions allowed only through MCP tools
- Secure user isolation for every operation
- Agent driven workflow only. No manual coding

## Architecture standards
- Frontend: OpenAI ChatKit
- Backend: FastAPI
- AI Layer: OpenAI Agents SDK
- MCP Layer: Official MCP SDK
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Auth: Better Auth with JWT

## Security rules
- All endpoints require valid JWT
- Token user_id must match route user_id
- MCP tools must validate user_id
- No direct DB access from agent or frontend
- No hardcoded secrets

## Data standards
- Tables: tasks, conversations, messages
- All records linked to user_id
- Conversation history fully reconstructable
- No server memory state

## AI behavior rules
- Agent must use MCP tools for task operations
- No hallucinated confirmations
- Always confirm successful actions
- Handle errors gracefully

## Success criteria
- Natural language manages tasks correctly
- Agent selects proper MCP tools
- Conversation resumes after restart
- Each user sees only their own data
- Response includes conversation_id and tool_calls

## Response snapshot

Updated constitution from unfilled template (v0.0.0) to Phase III
concrete principles (v1.0.0). Created 6 core principles:
I. Agent-MCP-API Separation, II. Stateless Server,
III. AI Through MCP Only, IV. Secure User Isolation,
V. Agent-Driven Workflow, VI. No Hallucinated Confirmations.
Added Architecture Standards with full tech stack table
(OpenAI ChatKit, FastAPI, OpenAI Agents SDK, MCP SDK,
SQLModel, Neon PostgreSQL, Better Auth). Added Data Standards
section with required tables (tasks, conversations, messages).
Added Governance section with amendment procedure and
compliance review rules. Added Success Criteria section.
Sync Impact Report embedded as HTML comment at top of file.

## Outcome

- ✅ Impact: Complete constitution overhaul for Phase III MCP architecture
- 🧪 Tests: No code tests; validation checks passed (no unresolved placeholders, dates ISO format, principles declarative and testable)
- 📁 Files: .specify/memory/constitution.md (overwritten)
- 🔁 Next prompts: Update CLAUDE.md for Phase III stack; run /sp.specify for first Phase III feature
- 🧠 Reflection: Major version bump justified — entire template was unfilled, now concrete with 6 principles covering agent/MCP/API separation, statelessness, security, and AI behavior constraints

## Evaluation notes (flywheel)

- Failure modes observed: None; template was unfilled so no migration conflicts
- Graders run and results (PASS/FAIL): Placeholder check PASS, version coherence PASS, date format PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Validate plan-template Constitution Check gates align with new principles during next /sp.plan run
