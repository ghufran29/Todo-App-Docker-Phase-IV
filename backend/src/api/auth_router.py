from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any
from src.models.user import UserCreate, UserLogin, UserPublic
from src.models.task import TaskPublic
from src.services.user_service import UserService
from src.services.task_service import TaskService
from src.database.connection import get_session
from src.api.middleware.auth_middleware import get_current_user
from src.utils.jwt_utils import create_access_token, create_refresh_token
from datetime import timedelta
import uuid


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=Dict[str, Any])
def register_user(
    user_create: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Register a new user account.

    Args:
        user_create: User creation details (email, password, confirm_password)
        session: Database session dependency

    Returns:
        Dictionary containing user info and authentication tokens
    """
    try:
        # Create user through service
        user_public = UserService.create_user(user_create, session)

        # Authenticate the user to generate tokens (auto-login after registration)
        auth_result = UserService.authenticate_user(
            email=user_create.email,
            password=user_create.password,
            session=session
        )

        if not auth_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to authenticate user after registration"
            )

        return {
            "success": True,
            "user": user_public,
            "access_token": auth_result["access_token"],
            "refresh_token": auth_result["refresh_token"],
            "token_type": "bearer"
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during registration: {str(e)}"
        )


@router.post("/signin", response_model=Dict[str, Any])
def login_user(
    user_login: UserLogin,
    session: Session = Depends(get_session)
):
    """
    Authenticate an existing user and return tokens.

    Args:
        user_login: User login details (email, password)
        session: Database session dependency

    Returns:
        Dictionary containing user info and authentication tokens
    """
    try:
        auth_result = UserService.authenticate_user(
            email=user_login.email,
            password=user_login.password,
            session=session
        )

        if not auth_result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "success": True,
            "user": auth_result["user"],
            "access_token": auth_result["access_token"],
            "refresh_token": auth_result["refresh_token"],
            "token_type": auth_result["token_type"]
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during authentication: {str(e)}"
        )


@router.post("/refresh", response_model=Dict[str, Any])
def refresh_token(
    refresh_data: Dict[str, str],
    session: Session = Depends(get_session)
):
    """
    Refresh an access token using a refresh token.

    Args:
        refresh_data: Dictionary containing 'refresh_token'
        session: Database session dependency

    Returns:
        Dictionary containing new access token
    """
    refresh_token_str = refresh_data.get("refresh_token")
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )

    from src.utils.jwt_utils import verify_token, create_access_token
    
    payload = verify_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload"
        )

    user = UserService.get_user_by_id(user_id, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new access token
    token_data = {"sub": str(user.id), "email": user.email}
    new_access_token = create_access_token(data=token_data)

    return {
        "success": True,
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/signout")
def logout_user():
    """
    End the current user session.

    Returns:
        Success message
    """
    # In a stateless JWT system, logout is typically handled on the client-side
    # by removing the token from storage. Here we just return a success response.
    return {
        "success": True,
        "message": "Successfully signed out"
    }