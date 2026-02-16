from sqlmodel import Session, select
from src.models.task import Task, TaskCreate, TaskUpdate, TaskPublic
from src.models.user import User
from typing import List, Optional
from fastapi import HTTPException, status
from datetime import datetime
import uuid


class TaskService:
    """Service class for handling task-related operations."""

    @staticmethod
    def create_task_for_user(task_create: TaskCreate, user_id: str, session: Session) -> TaskPublic:
        """
        Create a new task associated with a specific user.

        Args:
            task_create: Task creation details (title, description, etc.)
            user_id: UUID string of the user who will own this task
            session: Database session

        Returns:
            Created task as TaskPublic object
        """
        try:
            # Validate user_id UUID format
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        # Verify the user exists
        from .user_service import UserService
        user = session.exec(
            select(User).where(User.id == uuid.UUID(user_id))
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )

        # Create task instance
        task_data = task_create.model_dump()
        task_data['user_id'] = uuid.UUID(user_id)
        task = Task(**task_data)

        # Add to database
        session.add(task)
        session.commit()
        session.refresh(task)

        # Convert to public representation
        task_public = TaskPublic(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

        return task_public

    @staticmethod
    def get_tasks_by_user(user_id: str, session: Session) -> List[TaskPublic]:
        """
        Retrieve all tasks belonging to a specific user.

        Args:
            user_id: UUID string of the user whose tasks to retrieve
            session: Database session

        Returns:
            List of TaskPublic objects belonging to the user
        """
        try:
            # Validate user_id UUID format
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        # Query tasks filtered by user_id
        tasks = session.exec(
            select(Task).where(Task.user_id == uuid.UUID(user_id))
        ).all()

        # Convert to public representations
        tasks_public = []
        for task in tasks:
            task_public = TaskPublic(
                id=task.id,
                user_id=task.user_id,
                title=task.title,
                description=task.description,
                status=task.status,
                priority=task.priority,
                due_date=task.due_date,
                completed_at=task.completed_at,
                created_at=task.created_at,
                updated_at=task.updated_at
            )
            tasks_public.append(task_public)

        return tasks_public

    @staticmethod
    def get_task_by_id_and_user(task_id: str, user_id: str, session: Session) -> Optional[TaskPublic]:
        """
        Retrieve a specific task by its ID, ensuring it belongs to the specified user.

        Args:
            task_id: UUID string of the task to retrieve
            user_id: UUID string of the user who should own this task
            session: Database session

        Returns:
            TaskPublic object if found and owned by user, None otherwise
        """
        try:
            # Validate UUID formats
            uuid.UUID(task_id)
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )

        # Query for task with both task_id and user_id match
        task = session.exec(
            select(Task).where(
                Task.id == uuid.UUID(task_id),
                Task.user_id == uuid.UUID(user_id)
            )
        ).first()

        if not task:
            return None

        # Convert to public representation
        task_public = TaskPublic(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

        return task_public

    @staticmethod
    def update_task_by_user(task_id: str, user_id: str, task_update: TaskUpdate, session: Session) -> Optional[TaskPublic]:
        """
        Update a specific task, ensuring it belongs to the specified user.

        Args:
            task_id: UUID string of the task to update
            user_id: UUID string of the user who owns this task
            task_update: Task update details
            session: Database session

        Returns:
            Updated TaskPublic object if successful, None if task not found or doesn't belong to user
        """
        try:
            # Validate UUID formats
            uuid.UUID(task_id)
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )

        # Query for task with both task_id and user_id match
        task = session.exec(
            select(Task).where(
                Task.id == uuid.UUID(task_id),
                Task.user_id == uuid.UUID(user_id)
            )
        ).first()

        if not task:
            return None

        # Update fields based on task_update
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        # Update timestamp
        task.updated_at = datetime.utcnow()

        # Add to session and commit
        session.add(task)
        session.commit()
        session.refresh(task)

        # Convert to public representation
        task_public = TaskPublic(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

        return task_public

    @staticmethod
    def delete_task_by_user(task_id: str, user_id: str, session: Session) -> bool:
        """
        Delete a specific task, ensuring it belongs to the specified user.

        Args:
            task_id: UUID string of the task to delete
            user_id: UUID string of the user who owns this task
            session: Database session

        Returns:
            True if deletion was successful, False if task not found or doesn't belong to user
        """
        try:
            # Validate UUID formats
            uuid.UUID(task_id)
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )

        # Query for task with both task_id and user_id match
        task = session.exec(
            select(Task).where(
                Task.id == uuid.UUID(task_id),
                Task.user_id == uuid.UUID(user_id)
            )
        ).first()

        if not task:
            return False

        # Delete the task
        session.delete(task)
        session.commit()

        return True

    @staticmethod
    def complete_task(task_id: str, user_id: str, completed: bool, session: Session) -> Optional[TaskPublic]:
        """
        Mark a task as completed or pending, ensuring it belongs to the specified user.

        Args:
            task_id: UUID string of the task to update
            user_id: UUID string of the user who owns this task
            completed: Boolean indicating if the task should be marked as completed
            session: Database session

        Returns:
            Updated TaskPublic object if successful, None if task not found or doesn't belong to user
        """
        try:
            # Validate UUID formats
            uuid.UUID(task_id)
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )

        # Query for task with both task_id and user_id match
        task = session.exec(
            select(Task).where(
                Task.id == uuid.UUID(task_id),
                Task.user_id == uuid.UUID(user_id)
            )
        ).first()

        if not task:
            return None

        # Update task status based on completion
        task.status = "completed" if completed else "pending"

        if completed:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None

        # Update timestamp
        task.updated_at = datetime.utcnow()

        # Add to session and commit
        session.add(task)
        session.commit()
        session.refresh(task)

        # Convert to public representation
        task_public = TaskPublic(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

        return task_public