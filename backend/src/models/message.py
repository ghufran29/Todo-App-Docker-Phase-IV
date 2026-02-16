from sqlmodel import SQLModel, Field, Column
from typing import Optional
from datetime import datetime
import uuid
import sqlalchemy as sa


class Message(SQLModel, table=True):
    """Message model — an individual message within a conversation."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(
        foreign_key="conversation.id", nullable=False, index=True
    )
    role: str = Field(nullable=False)  # "user" or "assistant"
    content: str = Field(nullable=False)
    tool_calls: Optional[dict] = Field(
        default=None, sa_column=Column(sa.JSON, nullable=True)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
