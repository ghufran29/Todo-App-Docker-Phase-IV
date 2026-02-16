from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from src.models.task import TaskCreate, TaskUpdate, TaskPublic
from src.models.user import User
from src.services.task_service import TaskService
from src.api.middleware.auth_middleware import get_current_user
from src.database.connection import get_session
import uuid


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskPublic])
def get_user_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Retrieve all tasks for the authenticated user.

    Args:
        current_user: The currently authenticated user (from middleware)
        session: Database session dependency

    Returns:
        List of TaskPublic objects belonging to the user
    """
    try:
        tasks = TaskService.get_tasks_by_user(
            user_id=str(current_user.id),
            session=session
        )
        return tasks
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while retrieving tasks: {str(e)}"
        )


@router.post("/", response_model=TaskPublic)
def create_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_create: Task creation details (title, description, etc.)
        current_user: The currently authenticated user (from middleware)
        session: Database session dependency

    Returns:
        Created TaskPublic object
    """
    try:
        print(f"DEBUG: Creating task for user {current_user.id}: {task_create}")
        task = TaskService.create_task_for_user(
            task_create=task_create,
            user_id=str(current_user.id),
            session=session
        )
        print(f"DEBUG: Task created successfully: {task}")
        return task
    except HTTPException as e:
        print(f"DEBUG: HTTPException in create_task: {e.detail}")
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"DEBUG: Unexpected error in create_task: {str(e)}")
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during task creation: {str(e)}"
        )


@router.get("/{task_id}", response_model=TaskPublic)
def get_specific_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Retrieve a specific task by its ID.

    Args:
        task_id: UUID string of the task to retrieve
        current_user: The currently authenticated user (from middleware)
        session: Database session dependency

    Returns:
        TaskPublic object if found and owned by user
    """
    try:
        # Validate UUID format
        uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = TaskService.get_task_by_id_and_user(
        task_id=task_id,
        user_id=str(current_user.id),
        session=session
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )

    return task


@router.put("/{task_id}", response_model=TaskPublic)
def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific task, ensuring it belongs to the authenticated user.

    Args:
        task_id: UUID string of the task to update
        task_update: Task update details
        current_user: The currently authenticated user (from middleware)
        session: Database session dependency

    Returns:
        Updated TaskPublic object if successful
    """
    try:
        # Validate UUID format
        uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    updated_task = TaskService.update_task_by_user(
        task_id=task_id,
        user_id=str(current_user.id),
        task_update=task_update,
        session=session
    )

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )

    return updated_task


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task, ensuring it belongs to the authenticated user.

    Args:
        task_id: UUID string of the task to delete
        current_user: The currently authenticated user (from middleware)
        session: Database session dependency

    Returns:
        Success message if deletion was successful
    """
    try:
        # Validate UUID format
        uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    success = TaskService.delete_task_by_user(
        task_id=task_id,
        user_id=str(current_user.id),
        session=session
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )

    return {
        "success": True,
        "message": "Task deleted successfully"
    }


@router.patch("/{task_id}/complete", response_model=TaskPublic)
def complete_task_endpoint(
    task_id: str,
    completed: bool,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark a specific task as completed or pending.

    Args:
        task_id: UUID string of the task to update
        completed: Whether the task should be marked as completed
        current_user: The currently authenticated user (from middleware)
        session: Database session dependency

    Returns:
        Updated TaskPublic object with new completion status
    """
    try:
        # Validate UUID format
        uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    updated_task = TaskService.complete_task(
        task_id=task_id,
        user_id=str(current_user.id),
        completed=completed,
        session=session
    )

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )

    return updated_task