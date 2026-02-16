<!--
=== Sync Impact Report ===
Version change: 0.0.0 (unfilled template) → 1.0.0
Modified principles:
  - [PRINCIPLE_1_NAME] → I. Agent-MCP-API Separation
  - [PRINCIPLE_2_NAME] → II. Stateless Server
  - [PRINCIPLE_3_NAME] → III. AI Through MCP Only
  - [PRINCIPLE_4_NAME] → IV. Secure User Isolation
  - [PRINCIPLE_5_NAME] → V. Agent-Driven Workflow
  - [PRINCIPLE_6_NAME] → VI. No Hallucinated Confirmations
Added sections:
  - Architecture Standards (replaces [SECTION_2_NAME])
  - Data Standards (replaces [SECTION_3_NAME])
  - Security Rules (new subsection within Architecture Standards)
  - Success Criteria (new subsection)
Removed sections:
  - All placeholder sections from original template
Templates requiring updates:
  - .specify/templates/plan-template.md — ⚠ pending (Constitution Check
    gates must be updated per-feature to reflect new principles)
  - .specify/templates/spec-template.md — ✅ no structural change needed
  - .specify/templates/tasks-template.md — ✅ no structural change needed
Follow-up TODOs:
  - RATIFICATION_DATE set to today (first concrete fill)
  - CLAUDE.md should be updated to reflect Phase III stack changes
=== End Sync Impact Report ===
-->

# Todo AI Chatbot Constitution — Phase III

## Core Principles

### I. Agent-MCP-API Separation

The system MUST maintain clear separation between three layers:
Agent (OpenAI Agents SDK), MCP tools (Official MCP SDK), and
API layer (FastAPI). Each layer has a single responsibility:

- The Agent interprets user intent and selects MCP tools
- MCP tools execute discrete task operations against the API
- The API layer handles HTTP routing, auth, and DB access
- No layer may bypass another; the Agent MUST NOT call the
  database directly, and the frontend MUST NOT call MCP tools

**Rationale**: Strict layer separation enables independent
testing, replacement, and scaling of each concern.

### II. Stateless Server

All server-side state MUST be stored in Neon Serverless
PostgreSQL. The server process MUST NOT hold conversation
state, task caches, or user session data in memory.

- Every request MUST be self-contained with all context
  derivable from the database and the JWT token
- Conversation history MUST be fully reconstructable from
  the `messages` table
- Server restarts MUST NOT lose any user data or context

**Rationale**: Stateless servers enable horizontal scaling,
zero-downtime deployments, and reliable crash recovery.

### III. AI Through MCP Only

The AI agent MUST perform all task operations exclusively
through registered MCP tools. The agent MUST NOT:

- Execute raw SQL or direct database calls
- Bypass the API layer for any data mutation
- Fabricate tool responses or operation results
- Access user data without going through authenticated
  MCP tool endpoints

**Rationale**: Constraining AI actions to MCP tools creates
an auditable, testable surface for all AI-driven operations.

### IV. Secure User Isolation

Every operation MUST enforce user isolation:

- All API endpoints MUST require a valid JWT token
- The `user_id` decoded from the JWT MUST match the
  `user_id` in the request route
- MCP tools MUST validate `user_id` before any data access
- Database queries MUST filter by `user_id`; no cross-user
  data leakage is permitted
- No hardcoded secrets; all credentials via `.env` files

**Rationale**: Multi-tenant security is non-negotiable;
every layer must independently verify user identity.

### V. Agent-Driven Workflow

All development MUST follow the Agentic Dev Stack workflow:
Write spec, generate plan, break into tasks, implement via
Claude Code. No manual coding is permitted.

- Use the appropriate specialized agent for each layer:
  Auth Agent, Frontend Agent, DB Agent, Backend Agent
- All code changes MUST originate from agent execution
- Human input is reserved for clarification, approval,
  and architectural decisions

**Rationale**: Agent-driven development ensures consistency,
traceability, and reproducibility of all code changes.

### VI. No Hallucinated Confirmations

The AI agent MUST NOT confirm an action unless the
underlying MCP tool returned a successful result.

- Every tool call result MUST be verified before
  reporting success to the user
- Errors MUST be surfaced gracefully with actionable
  context
- Partial failures MUST be reported accurately

**Rationale**: Trust in the AI assistant depends on
truthful reporting of operation outcomes.

## Architecture Standards

**Technology Stack**:

| Layer        | Technology                    |
|-------------|-------------------------------|
| Frontend    | OpenAI ChatKit                |
| Backend     | FastAPI (Python)              |
| AI Layer    | OpenAI Agents SDK             |
| MCP Layer   | Official MCP SDK              |
| ORM         | SQLModel                      |
| Database    | Neon Serverless PostgreSQL    |
| Auth        | Better Auth with JWT tokens   |

**Authentication Flow**:

1. User logs in on Frontend; Better Auth creates a session
   and issues a JWT token
2. Frontend makes API calls with `Authorization: Bearer
   <token>` header
3. Backend extracts token, verifies signature using the
   shared secret
4. Backend decodes token to get `user_id` and matches it
   with the route `user_id`
5. Backend returns only data belonging to that user

**Security Rules**:

- All endpoints MUST require valid JWT
- Token `user_id` MUST match route `user_id`
- MCP tools MUST validate `user_id`
- No direct DB access from agent or frontend
- No hardcoded secrets; use `.env` and documentation

## Data Standards

**Required Tables**:

- `tasks` — user task records with status, priority, dates
- `conversations` — chat session metadata per user
- `messages` — individual messages within conversations

**Data Rules**:

- All records MUST be linked to `user_id`
- Conversation history MUST be fully reconstructable
  from database records alone
- No server-side memory state; all context from DB
- Schema changes MUST use versioned migrations

## Governance

This constitution is the authoritative source of project
principles. All development decisions, code reviews, and
architectural choices MUST comply with these principles.

**Amendment Procedure**:

1. Propose amendment with rationale and impact analysis
2. Document the change via `/sp.constitution` command
3. Version bump follows semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or material expansion
   - PATCH: Clarification or wording refinement
4. Update Sync Impact Report at the top of this file
5. Propagate changes to dependent templates

**Compliance Review**:

- All PRs MUST verify compliance with active principles
- Plan-template Constitution Check gates MUST reflect
  current principles
- Violations MUST be justified in the Complexity Tracking
  section of plan documents

## Success Criteria

- Natural language input correctly manages tasks
- Agent selects proper MCP tools for each operation
- Conversation resumes correctly after server restart
- Each user sees only their own data
- API responses include `conversation_id` and `tool_calls`

**Version**: 1.0.0 | **Ratified**: 2026-02-11 | **Last Amended**: 2026-02-11
