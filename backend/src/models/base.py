from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime
import uuid
from sqlmodel import Field


class BaseSQLModel(SQLModel):
    """Base model with common fields for all models."""
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class BaseModel(BaseSQLModel):
    """Extended base model with ID field."""
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)