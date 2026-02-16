import uuid
from datetime import datetime
from sqlmodel import Session, select
from src.database.connection import engine
from src.models.task import Task, TaskStatus
from src.mcp.utils.response import success_response, error_response
from src.mcp.utils.validation import validate_user_id, validate_task_id
from src.mcp.server import mcp


@mcp.tool()
async def complete_task(user_id: str, task_id: str) -> str:
    """Mark a task as completed.

    Args:
        user_id: UUID of the task owner (required)
        task_id: UUID of the task to complete (required)
    """
    # Validate IDs
    error = validate_user_id(user_id)
    if error:
        return error
    error = validate_task_id(task_id)
    if error:
        return error

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

            # Idempotent: if already completed, return success
            now = datetime.utcnow()
            task.status = TaskStatus.COMPLETED
            if not task.completed_at:
                task.completed_at = now
            task.updated_at = now

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
                "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
            })
    except Exception as e:
        return error_response("DB_ERROR", f"Database operation failed: {str(e)}")
