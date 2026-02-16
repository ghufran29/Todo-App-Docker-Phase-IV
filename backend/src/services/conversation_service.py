import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from src.models.conversation import Conversation
from src.models.message import Message


class ConversationService:

    @staticmethod
    def create_conversation(
        session: Session,
        user_id: uuid.UUID,
        title: Optional[str] = None,
    ) -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            title=title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        return conversation

    @staticmethod
    def get_conversation(
        session: Session,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[Conversation]:
        return session.exec(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        ).first()

    @staticmethod
    def list_conversations(
        session: Session,
        user_id: uuid.UUID,
    ) -> list[Conversation]:
        return list(session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        ).all())

    @staticmethod
    def add_message(
        session: Session,
        conversation_id: uuid.UUID,
        role: str,
        content: str,
        tool_calls: Optional[list] = None,
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=datetime.utcnow(),
        )
        session.add(message)
        # Update conversation's updated_at
        conversation = session.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)
        session.commit()
        session.refresh(message)
        return message

    @staticmethod
    def get_messages(
        session: Session,
        conversation_id: uuid.UUID,
        limit: int = 50,
    ) -> list[Message]:
        return list(session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        ).all())

    @staticmethod
    def delete_conversation(
        session: Session,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> bool:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        ).first()
        if not conversation:
            return False
        # Delete all messages first
        messages = session.exec(
            select(Message).where(Message.conversation_id == conversation_id)
        ).all()
        for msg in messages:
            session.delete(msg)
        session.delete(conversation)
        session.commit()
        return True
