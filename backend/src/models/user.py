from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum
from .base import BaseModel


class UserRole(str, Enum):
    """Enum for user roles."""
    USER = "user"
    ADMIN = "admin"


class UserBase(SQLModel):
    """Base model for user with common fields"""
    email: str = Field(unique=True, nullable=False, index=True)
    is_active: bool = Field(default=True)
    email_verified: bool = Field(default=False)
    role: UserRole = Field(default=UserRole.USER)


class User(UserBase, table=True):
    """User model for database table"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str
    confirm_password: str


class UserLogin(SQLModel):
    """Schema for user login credentials"""
    email: str
    password: str


class UserUpdate(SQLModel):
    """Schema for updating user information"""
    email: Optional[str] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None


class UserPublic(UserBase):
    """Schema for public user representation"""
    id: uuid.UUID
    created_at: datetime