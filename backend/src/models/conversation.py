from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Conversation(SQLModel, table=True):
    """Conversation model — a chat session between a user and the AI agent."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, index=True)
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
