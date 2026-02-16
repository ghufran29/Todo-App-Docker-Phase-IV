# Implementation Plan: AI Agent and Chat Orchestration Layer

**Branch**: `006-ai-agent-chat` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-ai-agent-chat/spec.md`

## Summary

Build an AI agent orchestration layer using the OpenAI Agents SDK that
connects to the existing MCP task tools server via
`MCPServerStreamableHttp`. The agent accepts user messages, reconstructs
conversation history from the database, invokes appropriate MCP tools
based on intent, and returns structured responses with `response_text`
and `tool_calls`. All conversation state is persisted in new
`conversations` and `messages` tables, ensuring stateless execution.

## Technical Context

**Language/Version**: Python 3.12 (existing backend)
**Primary Dependencies**: OpenAI Agents SDK (`openai-agents`), FastAPI, SQLModel, MCP SDK
**Storage**: Neon Serverless PostgreSQL (existing) — new `conversation` and `message` tables
**Testing**: pytest + pytest-asyncio
**Target Platform**: Linux server (WSL2 development)
**Project Type**: Web application (backend)
**Performance Goals**: Agent response < 10s p95 (LLM latency dominant)
**Constraints**: Stateless execution, no in-memory state, OpenAI Agents SDK only
**Scale/Scope**: Single agent, 5 MCP tools, 3 API endpoints, 2 new DB models

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Agent-MCP-API Separation | Agent uses MCP tools only; API handles HTTP + auth | PASS |
| II. Stateless Server | History from DB per request; no server memory | PASS |
| III. AI Through MCP Only | Agent configured with mcp_servers; no direct DB | PASS |
| IV. Secure User Isolation | user_id from JWT; injected into system prompt | PASS |
| V. Agent-Driven Workflow | All code via Claude Code agents | PASS |
| VI. No Hallucinated Confirmations | System prompt enforces tool result verification | PASS |

**Post-Phase 1 recheck**: All gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-ai-agent-chat/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Conversation + Message entities
├── quickstart.md        # Quickstart validation guide
├── contracts/
│   └── chat-api-schema.md  # Chat endpoint contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                       # MODIFY: include chat_router
│   ├── models/
│   │   ├── conversation.py           # NEW: Conversation model
│   │   └── message.py                # NEW: Message model
│   ├── agent/                        # NEW: Agent module
│   │   ├── __init__.py
│   │   ├── config.py                 # Agent + MCP server configuration
│   │   ├── runner.py                 # Agent execution + tool call capture
│   │   └── history.py                # Conversation history reconstruction
│   ├── api/
│   │   └── chat_router.py            # NEW: Chat API endpoints
│   ├── services/
│   │   └── conversation_service.py   # NEW: Conversation + Message CRUD
│   ├── mcp/                          # EXISTING from Spec 1
│   │   ├── server.py
│   │   ├── app.py
│   │   └── tools/...
│   └── database/
│       └── connection.py             # MODIFY: import new models in create_db_and_tables
├── requirements.txt                  # MODIFY: add openai-agents
└── .env                              # MODIFY: add OPENAI_API_KEY
```

**Structure Decision**: The agent module (`backend/src/agent/`) is
separate from the MCP module. It connects to MCP as a client via
`MCPServerStreamableHttp`. The chat router handles HTTP concerns;
the agent module handles AI concerns; the MCP module handles tool
execution. This enforces Constitution Principle I.

## Architecture Decisions

### AD-1: Single Agent with All MCP Tools

**Decision**: One agent with all 5 MCP tools.

**Rationale**: The task domain is narrow (5 CRUD tools). Multiple
agents would require handoff logic and risk context loss. The LLM
handles tool selection natively. See research.md R2.

### AD-2: MCPServerStreamableHttp Transport

**Decision**: Connect to MCP server via `MCPServerStreamableHttp`
pointing to `http://localhost:8000/mcp`.

**Rationale**: The MCP server is mounted in the same FastAPI process.
Streamable HTTP transport is the SDK's recommended approach for
HTTP-based MCP servers. See research.md R1.

### AD-3: DB-Based History Reconstruction

**Decision**: Query `messages` table per request, convert to
SDK input format, pass to `Runner.run()`.

**Rationale**: SDK sessions store state locally (violates stateless
principle). Server-managed conversations require OpenAI state. DB
reconstruction is the only approach compatible with Constitution
Principle II. See research.md R3.

### AD-4: Tool Call Capture from new_items

**Decision**: Extract tool calls from `result.new_items` by checking
for `ToolCallItem` and `ToolCallOutputItem` instances.

**Rationale**: This is the SDK's documented approach for inspecting
tool usage. Provides the audit trail required by FR-010. See
research.md R4.

### AD-5: System Prompt with user_id Injection

**Decision**: Inject `user_id` into the system prompt so the agent
passes it to every MCP tool call. The system prompt also encodes
behavior rules (no hallucination, scope limits, error handling).

**Rationale**: The agent cannot access JWT tokens. The API layer
extracts `user_id` from JWT and passes it to the agent runner,
which injects it into the system prompt. See research.md R6.

## Complexity Tracking

No constitution violations detected.

## Key Implementation Notes

### Agent Configuration Pattern

```python
from agents import Agent
from agents.mcp import MCPServerStreamableHttp

async def create_agent(user_id: str):
    server = MCPServerStreamableHttp(
        name="Todo Task Tools",
        params={"url": "http://localhost:8000/mcp"},
        cache_tools_list=True,
    )
    agent = Agent(
        name="todo-assistant",
        instructions=f"""You are a task management assistant.
The current user's ID is {user_id}. Always pass this as
the user_id parameter to any tool you call.
...""",
        mcp_servers=[server],
    )
    return agent, server
```

### Runner Execution Pattern

```python
from agents import Runner
from agents.items import ToolCallItem, ToolCallOutputItem

async def run_agent(agent, messages):
    result = await Runner.run(agent, messages)

    tool_calls = []
    for item in result.new_items:
        if isinstance(item, ToolCallItem):
            tool_calls.append({
                "tool": item.raw_item.name,
                "arguments": item.raw_item.arguments,
            })
        elif isinstance(item, ToolCallOutputItem):
            if tool_calls:
                tool_calls[-1]["result"] = item.output

    return result.final_output, tool_calls
```

### History Reconstruction Pattern

```python
from sqlmodel import Session, select
from src.models.message import Message

def build_history(session, conversation_id, limit=50):
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    ).all()

    return [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
```
