from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database.connection import get_session
from src.models.user import UserPublic
from src.api.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/users", tags=["User"])

@router.get("/me", response_model=UserPublic)
def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """
    Retrieve the currently authenticated user's information for session validation.
    """
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        is_active=current_user.is_active,
        email_verified=current_user.email_verified,
        role=current_user.role,
        created_at=current_user.created_at
    )
