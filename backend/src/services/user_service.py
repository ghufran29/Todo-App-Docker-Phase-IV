from sqlmodel import Session, select
from src.models.user import User, UserCreate, UserUpdate, UserPublic
import bcrypt
from typing import Optional
from fastapi import HTTPException, status
from src.utils.jwt_utils import create_access_token, create_refresh_token
from datetime import timedelta
import uuid


def get_password_hash(password: str) -> str:
    """Hash a plain text password using bcrypt."""
    # Truncate password to 72 bytes for bcrypt compatibility
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against its hash."""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


class UserService:
    """Service class for handling user-related operations."""

    @staticmethod
    def create_user(user_create: UserCreate, session: Session) -> UserPublic:
        """
        Create a new user with the provided details.

        Args:
            user_create: User creation details (email, password, confirm_password)
            session: Database session

        Returns:
            Created user as UserPublic object
        """
        # Check if user with this email already exists
        existing_user = session.exec(
            select(User).where(User.email == user_create.email)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        # Verify passwords match
        if user_create.password != user_create.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        # Hash the password
        hashed_password = get_password_hash(user_create.password)

        # Create user instance
        user = User(
            email=user_create.email,
            hashed_password=hashed_password
        )

        # Add to database
        session.add(user)
        session.commit()
        session.refresh(user)

        # Convert to public representation
        user_public = UserPublic(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            email_verified=user.email_verified,
            role=user.role,
            created_at=user.created_at
        )

        return user_public

    @staticmethod
    def get_user_by_id(user_id: str, session: Session) -> Optional[UserPublic]:
        """
        Retrieve a user by their ID.

        Args:
            user_id: UUID string of the user to retrieve
            session: Database session

        Returns:
            UserPublic object if found, None otherwise
        """
        try:
            # Validate UUID format
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        user = session.exec(
            select(User).where(User.id == uuid.UUID(user_id))
        ).first()

        if not user:
            return None

        user_public = UserPublic(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            email_verified=user.email_verified,
            role=user.role,
            created_at=user.created_at
        )

        return user_public

    @staticmethod
    def get_user_by_email(email: str, session: Session) -> Optional[User]:
        """
        Retrieve a user by their email address.

        Args:
            email: Email address of the user to retrieve
            session: Database session

        Returns:
            User object if found, None otherwise
        """
        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        return user

    @staticmethod
    def update_user(user_id: str, user_update: UserUpdate, session: Session) -> Optional[UserPublic]:
        """
        Update a user's information.

        Args:
            user_id: UUID string of the user to update
            user_update: User update details
            session: Database session

        Returns:
            Updated UserPublic object if successful, None if user not found
        """
        try:
            # Validate UUID format
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        user = session.exec(
            select(User).where(User.id == uuid.UUID(user_id))
        ).first()

        if not user:
            return None

        # Update fields if provided in user_update
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        session.add(user)
        session.commit()
        session.refresh(user)

        user_public = UserPublic(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            email_verified=user.email_verified,
            role=user.role,
            created_at=user.created_at
        )

        return user_public

    @staticmethod
    def authenticate_user(email: str, password: str, session: Session) -> Optional[dict]:
        """
        Authenticate a user with email and password, returning user info and tokens if successful.

        Args:
            email: User's email address
            password: Plain text password to verify
            session: Database session

        Returns:
            Dictionary with user info and tokens if authentication is successful, None otherwise
        """
        user = UserService.get_user_by_email(email, session)

        if not user or not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)

        # Convert user to public representation
        user_public = UserPublic(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            email_verified=user.email_verified,
            role=user.role,
            created_at=user.created_at
        )

        return {
            "user": user_public,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    @staticmethod
    def deactivate_user(user_id: str, session: Session) -> bool:
        """
        Deactivate a user account.

        Args:
            user_id: UUID string of the user to deactivate
            session: Database session

        Returns:
            True if user was successfully deactivated, False if user not found
        """
        try:
            # Validate UUID format
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        user = session.exec(
            select(User).where(User.id == uuid.UUID(user_id))
        ).first()

        if not user:
            return False

        user.is_active = False
        session.add(user)
        session.commit()
        session.refresh(user)

        return True