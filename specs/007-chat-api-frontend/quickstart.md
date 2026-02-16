# Quickstart: Chat API, Persistence, and Frontend Integration

**Branch**: `007-chat-api-frontend` | **Date**: 2026-02-12

## Prerequisites

- Backend running with Spec 1 (MCP tools) and Spec 2 (Agent) complete
- `OPENAI_API_KEY` configured in `backend/.env`
- Better Auth (Phase II) operational for JWT tokens
- Node.js 18+ for frontend

## Backend Verification

```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Test the user_id Chat Endpoint

```bash
# Sign in to get JWT
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password"}' | jq -r '.access_token')

# Get user_id from token (or /api/users/me)
USER_ID=$(curl -s http://localhost:8000/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')

# Send chat message via user_id route
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task called Buy groceries"}'
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in browser.

## Validation Checklist

- [ ] `POST /api/{user_id}/chat` requires valid JWT (401 without)
- [ ] user_id in path must match JWT user_id (403 on mismatch)
- [ ] New conversation created when no conversation_id provided
- [ ] Existing conversation resumed with conversation_id
- [ ] User message persisted before agent execution
- [ ] Assistant response persisted after agent execution
- [ ] Response includes conversation_id, response_text, tool_calls
- [ ] Conversation survives server restart
- [ ] Cross-user conversation access returns 404
- [ ] ChatKit frontend loads conversation list
- [ ] ChatKit frontend sends messages and displays responses
- [ ] Tool call metadata visible in frontend
