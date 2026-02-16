from sqlmodel import Session
from src.services.conversation_service import ConversationService
import uuid


def build_history(
    session: Session,
    conversation_id: uuid.UUID,
    limit: int = 50,
) -> list[dict]:
    """Reconstruct conversation history from DB for the agent.

    Returns a list of {"role": str, "content": str} dicts
    compatible with the OpenAI Agents SDK Runner.run() input.
    """
    messages = ConversationService.get_messages(
        session, conversation_id, limit=limit
    )
    return [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
