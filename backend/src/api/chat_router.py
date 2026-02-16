import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional
import uuid

logger = logging.getLogger(__name__)

from src.database.connection import get_session
from src.api.middleware.auth_middleware import get_current_user
from src.models.user import User
from src.services.conversation_service import ConversationService
from src.agent.history import build_history
from src.agent.runner import run_agent

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: str
    response_text: str
    tool_calls: list


class ConversationListResponse(BaseModel):
    conversations: list
    count: int


class MessageListResponse(BaseModel):
    messages: list
    count: int


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Send a message to the AI agent and get a response."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=422, detail="message field is required")

    user_id = current_user.id

    # Get or create conversation
    if request.conversation_id:
        try:
            conv_uuid = uuid.UUID(request.conversation_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid conversation_id format")

        conversation = ConversationService.get_conversation(
            session, conv_uuid, user_id
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Create new conversation with title from first message
        title = request.message[:100] if len(request.message) > 100 else request.message
        conversation = ConversationService.create_conversation(
            session, user_id, title=title
        )

    # Build history from DB
    history = build_history(session, conversation.id)

    # Append new user message to history for the agent
    history.append({"role": "user", "content": request.message})

    # Persist user message
    ConversationService.add_message(
        session, conversation.id, role="user", content=request.message
    )

    # Run the agent
    try:
        response_text, tool_calls = await run_agent(
            user_id=str(user_id),
            messages=history,
        )
    except Exception as e:
        logger.error(f"Chat agent error: {type(e).__name__}: {e}")
        error_msg = "I encountered an error processing your request. Please try again."
        ConversationService.add_message(
            session, conversation.id, role="assistant",
            content=error_msg, tool_calls=[]
        )
        return ChatResponse(
            conversation_id=str(conversation.id),
            response_text=error_msg,
            tool_calls=[],
        )

    # Persist assistant response
    ConversationService.add_message(
        session, conversation.id, role="assistant",
        content=response_text, tool_calls=tool_calls
    )

    return ChatResponse(
        conversation_id=str(conversation.id),
        response_text=response_text,
        tool_calls=tool_calls,
    )


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_with_user_id(
    user_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Send a message to the AI agent with path-based user_id validation."""
    # Validate path user_id matches JWT token user
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    # Delegate to same logic as the existing chat endpoint
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=422, detail="message field is required")

    # Get or create conversation
    if request.conversation_id:
        try:
            conv_uuid = uuid.UUID(request.conversation_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid conversation_id format")

        conversation = ConversationService.get_conversation(
            session, conv_uuid, current_user.id
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        title = request.message[:100] if len(request.message) > 100 else request.message
        conversation = ConversationService.create_conversation(
            session, current_user.id, title=title
        )

    # Build history from DB
    history = build_history(session, conversation.id)
    history.append({"role": "user", "content": request.message})

    # Persist user message
    ConversationService.add_message(
        session, conversation.id, role="user", content=request.message
    )

    # Run the agent
    try:
        response_text, tool_calls = await run_agent(
            user_id=str(current_user.id),
            messages=history,
        )
    except Exception as e:
        error_msg = "I encountered an error processing your request. Please try again."
        ConversationService.add_message(
            session, conversation.id, role="assistant",
            content=error_msg, tool_calls=[]
        )
        return ChatResponse(
            conversation_id=str(conversation.id),
            response_text=error_msg,
            tool_calls=[],
        )

    # Persist assistant response
    ConversationService.add_message(
        session, conversation.id, role="assistant",
        content=response_text, tool_calls=tool_calls
    )

    return ChatResponse(
        conversation_id=str(conversation.id),
        response_text=response_text,
        tool_calls=tool_calls,
    )


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List all conversations for the authenticated user."""
    conversations = ConversationService.list_conversations(session, current_user.id)
    return ConversationListResponse(
        conversations=[
            {
                "id": str(c.id),
                "title": c.title,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
            }
            for c in conversations
        ],
        count=len(conversations),
    )


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=MessageListResponse,
)
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Retrieve message history for a specific conversation."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid conversation_id format")

    conversation = ConversationService.get_conversation(
        session, conv_uuid, current_user.id
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = ConversationService.get_messages(session, conv_uuid)
    return MessageListResponse(
        messages=[
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "tool_calls": m.tool_calls,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
        count=len(messages),
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a conversation and all its messages."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid conversation_id format")

    deleted = ConversationService.delete_conversation(
        session, conv_uuid, current_user.id
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"message": "Conversation deleted successfully"}
