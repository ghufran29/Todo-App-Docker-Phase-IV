from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from src.utils.jwt_utils import verify_token, get_user_id_from_token
from src.models.user import User
from sqlmodel import Session, select
from src.database.connection import get_session
import uuid


class JWTBearer(HTTPBearer):
    """Custom JWT Bearer scheme for dependency injection"""
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        # Get the credentials from the request
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme."
                )
            token = credentials.credentials
            if not self.verify_jwt(token):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid token or expired token."
                )
            return token
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code."
            )

    def verify_jwt(self, token: str) -> bool:
        """Verify the JWT token"""
        payload = verify_token(token)
        return payload is not None


# Dependency to get current user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(JWTBearer()),
    session: Session = Depends(get_session)
) -> User:
    """
    Get the current authenticated user from the JWT token.

    Args:
        credentials: JWT token extracted from request headers
        session: Database session for querying user

    Returns:
        User object if token is valid and user exists
    """
    token = credentials.credentials

    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")  # 'sub' is the standard JWT claim for subject (user ID)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Validate UUID format
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query the user from database
    user = session.exec(select(User).where(User.id == uuid.UUID(user_id))).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# Utility function to validate user access to specific resource
def validate_user_access(current_user: User, target_user_id: str) -> bool:
    """
    Validate if the current user can access a resource belonging to the target user.

    Args:
        current_user: The currently authenticated user
        target_user_id: The ID of the user whose resource is being accessed

    Returns:
        True if access is allowed, raises HTTPException if not
    """
    try:
        # Validate UUID format
        uuid.UUID(target_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target user ID format"
        )

    if str(current_user.id) != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Cannot access other user's data"
        )
    return True