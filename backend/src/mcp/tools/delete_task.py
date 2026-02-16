import uuid
from sqlmodel import Session, select
from src.database.connection import engine
from src.models.task import Task
from src.mcp.utils.response import success_response, error_response
from src.mcp.utils.validation import validate_user_id, validate_task_id
from src.mcp.server import mcp


@mcp.tool()
async def delete_task(user_id: str, task_id: str) -> str:
    """Permanently delete a task.

    Args:
        user_id: UUID of the task owner (required)
        task_id: UUID of the task to delete (required)
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

            session.delete(task)
            session.commit()

            return success_response({
                "task_id": str(task_id),
                "deleted": True,
            })
    except Exception as e:
        return error_response("DB_ERROR", f"Database operation failed: {str(e)}")
