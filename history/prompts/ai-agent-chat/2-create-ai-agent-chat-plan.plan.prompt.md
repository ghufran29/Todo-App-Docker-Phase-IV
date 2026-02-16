---
id: 2
title: Create AI Agent Chat Plan
stage: plan
date: 2026-02-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-agent-chat
branch: 006-ai-agent-chat
user: user
command: /sp.plan
labels: ["ai-agent", "chat", "plan", "phase-3", "openai-agents-sdk"]
links:
  spec: specs/006-ai-agent-chat/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-ai-agent-chat/plan.md
  - specs/006-ai-agent-chat/research.md
  - specs/006-ai-agent-chat/data-model.md
  - specs/006-ai-agent-chat/contracts/chat-api-schema.md
  - specs/006-ai-agent-chat/quickstart.md
  - CLAUDE.md
tests:
  - none
---

## Prompt

## Create
- Agent architecture sketch
- Tool registration structure
- Conversation reconstruction flow
- Validation checklist tied to success criteria

## Architecture outline
- Chat endpoint sends history and new message to agent
- Agent initialized with MCP tools
- Agent runner executes single request cycle
- Agent selects tool based on user intent
- MCP tool executes database operation
- Tool result returned to agent
- Agent generates final confirmation message
- Response returned without storing server memory

## Decisions needing documentation
- Single agent vs multiple specialized agents
- Tool first execution vs reasoning first approach
- Standard format for confirmation responses
- Error propagation from tool to agent
- Message history size limits

## Task breakdown
- Configure OpenAI Agents SDK
- Register MCP tools with agent
- Define system prompt with behavior rules
- Implement conversation history builder
- Implement runner execution logic
- Capture tool_calls metadata
- Format final structured response
- Handle tool errors gracefully

## Testing strategy
- Add task command triggers add_task tool
- List tasks command triggers list_tasks tool
- Complete command triggers complete_task
- Delete command triggers delete_task
- Update command triggers update_task
- Ambiguous input handled safely
- Tool error produces helpful message
- No tool call when user only asks a question

## Quality validation
- Agent never bypasses MCP tools
- Correct tool chosen for each intent
- No hallucinated task IDs
- Conversation context influences reasoning
- Reviewers can trace intent to tool call to response

## Response snapshot

Researched OpenAI Agents SDK MCP integration via official documentation.
Generated plan with 5 architecture decisions: (1) single agent, (2)
MCPServerStreamableHttp transport, (3) DB-based history reconstruction,
(4) tool call capture from new_items, (5) system prompt with user_id
injection. Created research.md with 7 decisions, data-model.md with
Conversation and Message entities, contracts/chat-api-schema.md with
3 endpoints (POST /api/chat, GET /api/conversations, GET messages),
quickstart.md with 10-item validation checklist. Constitution check
passed all 6 gates. Agent context updated in CLAUDE.md.

## Outcome

- ✅ Impact: Complete plan for AI agent layer with SDK integration patterns, DB models, API contracts
- 🧪 Tests: Constitution check 6/6 gates PASS
- 📁 Files: plan.md, research.md, data-model.md, contracts/chat-api-schema.md, quickstart.md, CLAUDE.md
- 🔁 Next prompts: /sp.tasks to generate implementation task list
- 🧠 Reflection: SDK's MCPServerStreamableHttp connects naturally to existing MCP mount at /mcp/. Key insight: agent connects to MCP as HTTP client, not via import — clean layer separation.

## Evaluation notes (flywheel)

- Failure modes observed: WebFetch to openai.github.io blocked by security policy; used raw GitHub URLs instead
- Graders run and results (PASS/FAIL): Constitution check PASS (6/6)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Verify MCPServerStreamableHttp connects to FastAPI-mounted MCP server during implementation
