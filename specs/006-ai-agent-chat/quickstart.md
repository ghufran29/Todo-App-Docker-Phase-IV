# Quickstart: AI Agent and Chat Orchestration Layer

**Branch**: `006-ai-agent-chat` | **Date**: 2026-02-11

## Prerequisites

- Python 3.10+
- Existing backend running (`backend/venv/`)
- MCP task tools operational (Spec 1 complete)
- OpenAI API key configured in `.env`
- Neon PostgreSQL with `conversations` and `messages` tables

## Install OpenAI Agents SDK

```bash
cd backend
source venv/bin/activate
pip install openai-agents
```

## Configure Environment

Add to `backend/.env`:

```env
OPENAI_API_KEY=sk-your-key-here
```

## Run the Backend

```bash
cd backend
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Test the Chat Endpoint

```bash
# First, get a JWT token via signin
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password"}' | jq -r '.access_token')

# Send a chat message
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task called Buy groceries"}'
```

Expected response:

```json
{
  "conversation_id": "generated-uuid",
  "response_text": "I've created a new task 'Buy groceries' for you.",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {"user_id": "...", "title": "Buy groceries"},
      "result": {"success": true, "data": {...}}
    }
  ]
}
```

## Validation Checklist

- [ ] "Add a task called X" triggers `add_task` tool
- [ ] "Show my tasks" triggers `list_tasks` tool
- [ ] "Mark X as done" triggers `complete_task` tool
- [ ] "Delete X" triggers `delete_task` tool
- [ ] "Rename X to Y" triggers `update_task` tool
- [ ] Agent never confirms without tool success
- [ ] Out-of-scope message gets polite redirect
- [ ] Follow-up message uses conversation history
- [ ] Messages persisted to database after each turn
- [ ] Response includes both response_text and tool_calls
