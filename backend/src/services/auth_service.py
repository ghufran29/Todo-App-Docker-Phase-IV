from sqlmodel import Session, select
from src.models.user import User, UserPublic
from passlib.context import CryptContext
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from src.utils.jwt_utils import create_access_token, create_refresh_token
from datetime import timedelta
import uuid


class AuthService:
    """Service class for handling authentication-related operations."""

    @staticmethod
    def authenticate_user(email: str, password: str, session: Session) -> Optional[Dict[str, Any]]:
        """
        Authenticate a user with email and password, and generate tokens if successful.

        Args:
            email: User's email address
            password: Plain text password
            session: Database session

        Returns:
            Dictionary with user info and tokens if authentication is successful, None otherwise
        """
        # Find user by email
        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        # Verify user exists and password is correct
        if not user or not AuthService.verify_password(password, user.hashed_password):
            return None

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )

        # Generate tokens
        token_data = {"sub": str(user.id), "email": user.email}

        # Create access token
        access_token_expires = timedelta(minutes=30)  # Short-lived access token
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )

        # Create refresh token
        refresh_token = create_refresh_token(data=token_data)

        # Convert user to public representation
        user_public = UserPublic(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            email_verified=user.email_verified,
            created_at=user.created_at
        )

        return {
            "user": user_public,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain text password against its hash."""
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Generate a new access token from a refresh token.

        Args:
            refresh_token: The refresh token

        Returns:
            Dictionary with new access token if refresh token is valid, None otherwise
        """
        from utils.jwt_utils import verify_token

        payload = verify_token(refresh_token)

        if not payload or payload.get("type") != "refresh":
            return None

        # Generate new access token with same user info
        token_data = {"sub": payload["sub"], "email": payload["email"]}

        # Create new access token
        access_token = create_access_token(data=token_data)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    @staticmethod
    def deactivate_user(user_id: str, session: Session, current_user: User) -> bool:
        """
        Deactivate a user account (for logout or account deactivation).

        Args:
            user_id: ID of the user to deactivate
            session: Database session
            current_user: Currently authenticated user (for authorization check)

        Returns:
            True if successful, False otherwise
        """
        # Authorization check: user can only deactivate their own account
        if str(current_user.id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: Cannot deactivate other user's account"
            )

        user = session.exec(
            select(User).where(User.id == uuid.UUID(user_id))
        ).first()

        if not user:
            return False

        user.is_active = False
        session.add(user)
        session.commit()

        return True

    @staticmethod
    def activate_user(user_id: str, session: Session) -> bool:
        """
        Activate a user account.

        Args:
            user_id: ID of the user to activate
            session: Database session

        Returns:
            True if successful, False otherwise
        """
        user = session.exec(
            select(User).where(User.id == uuid.UUID(user_id))
        ).first()

        if not user:
            return False

        user.is_active = True
        session.add(user)
        session.commit()

        return True