# Research: AI Agent and Chat Orchestration Layer

**Branch**: `006-ai-agent-chat` | **Date**: 2026-02-11

## R1: OpenAI Agents SDK — Agent Configuration Pattern

**Decision**: Use `Agent` class from `openai-agents` with `mcp_servers`
parameter to connect to the MCP task tools server.

**Rationale**: The SDK natively supports MCP integration via
`MCPServerStreamableHttp`. The agent can connect to our existing MCP
server mounted at `/mcp/` in FastAPI. Tools are automatically
discovered and registered by the SDK — no manual tool definition needed.

**Alternatives considered**:
- Manual tool definitions with `@function_tool` — duplicates logic
  already in MCP tools; violates DRY and Constitution Principle III.
- Direct OpenAI API calls with function calling — no MCP integration;
  requires manual schema definitions and tool dispatch.

**Key pattern**:
```python
from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

async with MCPServerStreamableHttp(
    name="Todo Task Tools",
    params={"url": "http://localhost:8000/mcp"},
    cache_tools_list=True,
) as server:
    agent = Agent(
        name="todo-assistant",
        instructions="...",
        mcp_servers=[server],
    )
    result = await Runner.run(agent, input_messages)
```

## R2: Single Agent vs Multiple Specialized Agents

**Decision**: Use a single agent with all 5 MCP tools.

**Rationale**: The task domain is narrow (5 CRUD tools on one entity).
Multiple agents would add complexity (handoff logic, context loss
between agents) with no benefit. The SDK's tool selection is handled
by the LLM based on user intent — a single system prompt with clear
instructions is sufficient.

**Alternatives considered**:
- Specialized agents per operation (AddAgent, ListAgent, etc.) —
  requires handoff orchestration; user messages often combine intents
  (e.g., "add X and complete Y"), making handoffs fragile.
- Router agent + specialists — over-engineering for 5 tools.

## R3: Conversation History Reconstruction

**Decision**: Reconstruct conversation history by querying the
`messages` table for the given `conversation_id`, ordered by
`created_at`, then convert to the OpenAI Agents SDK input format
(`[{"role": "user"|"assistant", "content": "..."}]`).

**Rationale**: The SDK's `Runner.run()` accepts either a string
(single message) or a list of input items. For multi-turn, we pass
the full history + new message as a list. The SDK also supports
`to_input_list()` on results, but since we need stateless
reconstruction from DB each time, we build the list manually.

**Alternatives considered**:
- SDK Sessions (`SQLiteSession`) — stores state locally, violates
  stateless server principle (Constitution Principle II).
- Server-managed conversations via `conversation_id` parameter —
  requires OpenAI server state, not compatible with our DB-first
  approach.
- Store raw `to_input_list()` output in DB — complex JSON storage,
  harder to query and display in frontend.

**History limit**: 50 most recent messages to fit within context
window limits.

## R4: Capturing Tool Calls from RunResult

**Decision**: After `Runner.run()` completes, iterate over
`result.new_items` to extract `ToolCallItem` and
`ToolCallOutputItem` instances. Build a `tool_calls` list
containing tool name, parameters, and result for each invocation.

**Rationale**: The SDK exposes tool calls via `new_items` property.
Each `ToolCallItem` contains the raw tool call request, and
`ToolCallOutputItem` contains the tool's response. This gives us
the full audit trail needed for FR-010.

**Key pattern**:
```python
from agents.items import ToolCallItem, ToolCallOutputItem

tool_calls = []
for item in result.new_items:
    if isinstance(item, ToolCallItem):
        tool_calls.append({
            "tool": item.raw_item.name,
            "arguments": item.raw_item.arguments,
        })
    elif isinstance(item, ToolCallOutputItem):
        tool_calls[-1]["result"] = item.output
```

## R5: Error Propagation from MCP Tool to Agent

**Decision**: MCP tools already return structured JSON with
`{success, data, error}`. The agent receives this as the tool
result text. The system prompt instructs the agent to check the
`success` field and communicate errors in plain language.

**Rationale**: No code-level error handling needed between MCP and
agent — the structured response IS the error channel. The agent's
instructions enforce Constitution Principle VI (no hallucinated
confirmations) by requiring the agent to check `success: true`
before confirming any action.

**Alternatives considered**:
- Raise exceptions from MCP tools — the SDK would catch them and
  report generic errors, losing the structured error codes.
- Custom error middleware — unnecessary complexity; the JSON
  envelope already carries error information.

## R6: System Prompt Design

**Decision**: The agent's system prompt MUST include:
1. Identity: "You are a task management assistant."
2. Tool usage rules: "Use MCP tools for all task operations. Never
   fabricate task IDs, titles, or confirmations."
3. Response format: "After tool calls, verify the `success` field.
   Report errors in plain language."
4. Scope: "You can only help with task management. For unrelated
   requests, politely redirect."
5. user_id injection: "The current user's ID is {user_id}. Always
   pass this as the user_id parameter to tools."

**Rationale**: The system prompt is the primary control mechanism
for agent behavior. It must encode Constitution Principles III and
VI directly into the agent's instructions.

## R7: Message Persistence Strategy

**Decision**: After each agent invocation, persist two records to
the `messages` table:
1. User message: `role="user"`, `content=user_text`
2. Assistant message: `role="assistant"`, `content=response_text`,
   `tool_calls=JSON(tool_calls_list)`

**Rationale**: This enables stateless reconstruction on the next
turn. Tool calls are stored as JSON for auditability but are not
replayed as separate messages — the agent's final response already
incorporates tool results.
