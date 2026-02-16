import uuid
from datetime import datetime
from sqlmodel import Session, select
from src.database.connection import engine
from src.models.task import Task, TaskStatus, TaskPriority
from src.mcp.utils.response import success_response, error_response
from src.mcp.utils.validation import validate_user_id, validate_task_id
from src.mcp.server import mcp


@mcp.tool()
async def update_task(
    user_id: str,
    task_id: str,
    title: str = "",
    description: str = "",
    status: str = "",
    priority: str = "",
) -> str:
    """Update an existing task's fields.

    Args:
        user_id: UUID of the task owner (required)
        task_id: UUID of the task to update (required)
        title: New title (1-200 chars, optional)
        description: New description (max 1000 chars, optional)
        status: New status - pending, in_progress, or completed (optional)
        priority: New priority - low, medium, high, or urgent (optional)
    """
    # Validate IDs
    error = validate_user_id(user_id)
    if error:
        return error
    error = validate_task_id(task_id)
    if error:
        return error

    # Check at least one update field is provided
    if not any([title.strip(), description.strip(), status.strip(), priority.strip()]):
        return error_response(
            "NO_FIELDS_TO_UPDATE",
            "At least one field (title, description, status, priority) must be provided"
        )

    # Validate field values before touching DB
    if title and len(title) > 200:
        return error_response("VALIDATION_ERROR", "title must be 200 characters or less")
    if description and len(description) > 1000:
        return error_response("VALIDATION_ERROR", "description must be 1000 characters or less")

    if status.strip():
        try:
            TaskStatus(status.strip())
        except ValueError:
            valid = ", ".join([s.value for s in TaskStatus])
            return error_response("VALIDATION_ERROR", f"Invalid status. Must be one of: {valid}")

    if priority.strip():
        try:
            TaskPriority(priority.strip())
        except ValueError:
            valid = ", ".join([p.value for p in TaskPriority])
            return error_response("VALIDATION_ERROR", f"Invalid priority. Must be one of: {valid}")

    try:
        with Session(engine) as session:
            task = session.exec(
                select(Task).where(
                    Task.id == uuid.UUID(task_id),
                    Task.user_id == uuid.UUID(user_id)
                )
            ).first()

            if not task:
                return error_response("TASK_NOT_FOUND", "Task not found or access denied")

            # Apply updates
            if title.strip():
                task.title = title.strip()
            if description.strip():
                task.description = description.strip()
            if status.strip():
                task.status = TaskStatus(status.strip())
                if task.status == TaskStatus.COMPLETED and not task.completed_at:
                    task.completed_at = datetime.utcnow()
            if priority.strip():
                task.priority = TaskPriority(priority.strip())

            task.updated_at = datetime.utcnow()

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
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
            })
    except Exception as e:
        return error_response("DB_ERROR", f"Database operation failed: {str(e)}")
