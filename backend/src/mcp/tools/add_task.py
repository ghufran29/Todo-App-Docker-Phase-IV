import uuid
from datetime import datetime
from sqlmodel import Session
from src.database.connection import engine
from src.models.task import Task, TaskStatus, TaskPriority
from src.mcp.utils.response import success_response, error_response
from src.mcp.utils.validation import validate_user_id
from src.mcp.server import mcp


@mcp.tool()
async def add_task(user_id: str, title: str, description: str = "") -> str:
    """Add a new task for the user.

    Args:
        user_id: UUID of the task owner (required)
        title: Task title, 1-200 characters (required)
        description: Optional task description, max 1000 characters
    """
    # Validate user_id
    error = validate_user_id(user_id)
    if error:
        return error

    # Validate title
    if not title or not title.strip():
        return error_response("MISSING_TITLE", "title is required")
    if len(title) > 200:
        return error_response("VALIDATION_ERROR", "title must be 200 characters or less")

    # Validate description length
    if description and len(description) > 1000:
        return error_response("VALIDATION_ERROR", "description must be 1000 characters or less")

    try:
        with Session(engine) as session:
            task = Task(
                user_id=uuid.UUID(user_id),
                title=title.strip(),
                description=description.strip() if description else None,
                status=TaskStatus.PENDING,
                priority=TaskPriority.MEDIUM,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            return success_response({
                "id": str(task.id),
                "user_id": str(task.user_id),
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "priority": task.priority.value,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
            })
    except Exception as e:
        return error_response("DB_ERROR", f"Database operation failed: {str(e)}")
