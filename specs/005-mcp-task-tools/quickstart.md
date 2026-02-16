# Quickstart: MCP Server and Task Tools

**Branch**: `005-mcp-task-tools` | **Date**: 2026-02-11

## Prerequisites

- Python 3.10+
- Existing backend environment set up (`backend/venv/`)
- Neon PostgreSQL database configured (or SQLite fallback)
- `.env` file with `DATABASE_URL` configured

## Install MCP SDK

```bash
cd backend
source venv/bin/activate
pip install "mcp[cli]"
```

## Verify Installation

```bash
python -c "from mcp.server.fastmcp import FastMCP; print('MCP SDK OK')"
```

## Run the MCP Server (Standalone Test)

```bash
cd backend
python -m src.mcp.server
```

Expected output: MCP server starts and listens for tool calls.

## Run with FastAPI (Integrated)

```bash
cd backend
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

The MCP server is mounted at `/mcp/` within the FastAPI app.

## Test a Tool (via MCP client or direct call)

```python
# Example: add_task
{
  "tool": "add_task",
  "arguments": {
    "user_id": "your-uuid-here",
    "title": "Test task from MCP",
    "description": "Created via MCP tool"
  }
}
```

Expected response:

```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "user_id": "your-uuid-here",
    "title": "Test task from MCP",
    "status": "pending"
  },
  "error": null
}
```

## Validation Checklist

- [ ] `add_task` creates a task and returns structured response
- [ ] `list_tasks` returns only tasks for the specified user_id
- [ ] `update_task` modifies the correct task fields
- [ ] `complete_task` sets status to "completed" with timestamp
- [ ] `delete_task` removes the task and returns confirmation
- [ ] All tools reject calls without `user_id`
- [ ] Cross-user task access is blocked
- [ ] Server restart does not lose any task data
