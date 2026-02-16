import uuid
from typing import Optional
from src.mcp.utils.response import error_response


def validate_user_id(user_id: str) -> Optional[str]:
    """Validate user_id is present and a valid UUID.

    Returns None if valid, or an error response string if invalid.
    """
    if not user_id or not user_id.strip():
        return error_response("MISSING_USER_ID", "user_id is required")
    try:
        uuid.UUID(user_id)
    except ValueError:
        return error_response("INVALID_USER_ID", f"user_id is not a valid UUID: {user_id}")
    return None


def validate_task_id(task_id: str) -> Optional[str]:
    """Validate task_id is present and a valid UUID.

    Returns None if valid, or an error response string if invalid.
    """
    if not task_id or not task_id.strip():
        return error_response("MISSING_TASK_ID", "task_id is required")
    try:
        uuid.UUID(task_id)
    except ValueError:
        return error_response("INVALID_TASK_ID", f"task_id is not a valid UUID: {task_id}")
    return None
