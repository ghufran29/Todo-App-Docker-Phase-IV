import uuid
from sqlmodel import Session, select
from src.database.connection import engine
from src.models.task import Task
from src.mcp.utils.response import success_response, error_response
from src.mcp.utils.validation import validate_user_id
from src.mcp.server import mcp


@mcp.tool()
async def list_tasks(user_id: str) -> str:
    """List all tasks belonging to a user.

    Args:
        user_id: UUID of the task owner (required)
    """
    # Validate user_id
    error = validate_user_id(user_id)
    if error:
        return error

    try:
        with Session(engine) as session:
            tasks = session.exec(
                select(Task).where(Task.user_id == uuid.UUID(user_id))
            ).all()

            tasks_data = []
            for task in tasks:
                tasks_data.append({
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

            return success_response({
                "tasks": tasks_data,
                "count": len(tasks_data),
            })
    except Exception as e:
        return error_response("DB_ERROR", f"Database operation failed: {str(e)}")
