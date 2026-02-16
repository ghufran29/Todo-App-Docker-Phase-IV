from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt
from fastapi import HTTPException, status
from src.config.auth_config import auth_config
from src.models.user import User
from sqlmodel import Session, select
import uuid


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new access token with the provided data and expiration time.

    Args:
        data: Dictionary containing the claims to include in the token
        expires_delta: Optional timedelta for token expiration. If None, uses config default

    Returns:
        Encoded JWT token as string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + auth_config.get_access_token_expire_delta()

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, auth_config.SECRET_KEY, algorithm=auth_config.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new refresh token with the provided data and expiration time.

    Args:
        data: Dictionary containing the claims to include in the token
        expires_delta: Optional timedelta for token expiration. If None, uses config default

    Returns:
        Encoded JWT refresh token as string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + auth_config.get_refresh_token_expire_delta()

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, auth_config.SECRET_KEY, algorithm=auth_config.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token and return the decoded payload if valid.

    Args:
        token: JWT token string to verify

    Returns:
        Decoded token payload as dictionary, or None if invalid
    """
    try:
        payload = jwt.decode(token, auth_config.SECRET_KEY, algorithms=[auth_config.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.JWTError:
        # Invalid token
        return None


def decode_token_payload(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token without verification (for debugging purposes only).

    Args:
        token: JWT token string to decode

    Returns:
        Decoded token payload as dictionary, or None if unable to decode
    """
    try:
        # This decodes the token without verification - use carefully!
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception:
        return None


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract the user ID from a JWT token.

    Args:
        token: JWT token string to extract user ID from

    Returns:
        User ID as string, or None if not found or invalid
    """
    payload = verify_token(token)
    if payload:
        return payload.get("sub")  # 'sub' is the standard JWT claim for subject (user ID)
    return None


def is_token_expired(token: str) -> bool:
    """
    Check if a JWT token is expired.

    Args:
        token: JWT token string to check

    Returns:
        True if token is expired, False otherwise
    """
    try:
        payload = jwt.decode(token, auth_config.SECRET_KEY, algorithms=[auth_config.ALGORITHM])
        exp = payload.get("exp")

        if exp:
            return datetime.utcfromtimestamp(exp) < datetime.utcnow()
        return True  # If no exp claim, consider it expired
    except jwt.ExpiredSignatureError:
        return True
    except jwt.JWTError:
        # If we can't decode the token, treat it as expired/invalid
        return True