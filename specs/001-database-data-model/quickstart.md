# Quick Start Guide: Database and Data Model

## Prerequisites

- Python 3.11+
- PostgreSQL-compatible database (Neon Serverless PostgreSQL)
- Required Python packages (SQLModel, Pydantic, etc.)

## Setup Instructions

### 1. Clone and Initialize
```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration
Create `.env` file in the backend directory with the following variables:

**Backend (.env)**:
```bash
DATABASE_URL=postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=300
ENVIRONMENT=development
```

### 3. Database Setup
```bash
# From the backend directory
cd backend
python -m src.database.database_setup
```

### 4. Running the Application
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

## Database Schema Diagram

```
Users Table                    Tasks Table
┌─────────────────┐          ┌─────────────────┐
│ id (PK)         │◄─────────┤ user_id (FK)    │
│ email (UNIQUE)  │          │ id (PK)         │
│ hashed_password │          │ title           │
│ created_at      │          │ description     │
│ updated_at      │          │ status          │
│ is_active       │          │ priority        │
│ email_verified  │          │ due_date        │
└─────────────────┘          │ completed_at    │
                             │ created_at      │
                             │ updated_at      │
                             └─────────────────┘
```

## Data Model Overview

### User Entity
The User entity represents authenticated users in the system:
- **Fields**: id, email, hashed_password, created_at, updated_at, is_active, email_verified
- **Relationship**: Has many Tasks (one-to-many)
- **Constraints**: Email must be unique

### Task Entity
The Task entity represents to-do items owned by users:
- **Fields**: id, title, description, status, priority, due_date, completed_at, created_at, updated_at, user_id
- **Relationship**: Belongs to one User (many-to-one)
- **Constraints**: user_id is a foreign key with ON DELETE CASCADE

## Key Components

### Database Models
- `src/models/user.py` - User data model with authentication fields
- `src/models/task.py` - Task data model with user relationship
- `src/models/base.py` - Base model with common fields

### Database Services
- `src/services/user_service.py` - User data operations with validation
- `src/services/task_service.py` - Task data operations with user isolation
- `src/services/database_service.py` - General database operations

### API Endpoints
- `src/api/user_router.py` - User-related endpoints
- `src/api/task_router.py` - Task-related CRUD endpoints with user isolation
- `src/api/database_setup.py` - Database initialization functions

## Database Initialization and Migration Flow

### Schema Creation
The application follows this initialization sequence:
1. Establish database connection with Neon PostgreSQL
2. Create Users table with indexes and constraints
3. Create Tasks table with foreign key relationships
4. Apply indexes for optimized queries
5. Verify schema integrity against SQLModel definitions

### Migration Strategy
- Uses Alembic for versioned schema migrations
- Supports forward and backward migration paths
- Preserves existing data during schema updates
- Neon-compatible migration operations

## Usage Examples

### Creating a User
```python
from services.user_service import UserService
from models.user import UserCreate

# Create user data
user_create = UserCreate(
    email="user@example.com",
    password="securePassword123"
)

# Create user via service
user = UserService.create_user(user_create)
```

### Creating a Task for a User
```python
from services.task_service import TaskService
from models.task import TaskCreate

# Create task data
task_create = TaskCreate(
    title="Complete project",
    description="Finish the project by Friday",
    status="pending",
    priority="high"
)

# Create task via service (associates with user)
task = TaskService.create_task_for_user(task_create, user_id="some-uuid")
```

### Querying User's Tasks
```python
from services.task_service import TaskService

# Get all tasks for a specific user
tasks = TaskService.get_tasks_by_user(user_id="some-uuid")

# Get tasks by status
pending_tasks = TaskService.get_tasks_by_user_and_status(user_id="some-uuid", status="pending")
```

## Data Isolation and Security

All database operations are designed to enforce user data isolation:
- Every task query must filter by user_id
- Services validate user permissions before data access
- Foreign key constraints prevent orphaned tasks
- No direct database access from frontend
- All queries are scoped per authenticated user
- Backend acts as the sole database access layer

## Connection Management

The application uses SQLModel's built-in connection pooling optimized for Neon:
- Connections are reused across requests
- Idle connections are cleaned up automatically
- Maximum connection limits prevent resource exhaustion
- Neon's serverless features are leveraged for scaling

## Query Patterns and Validation

### User-Scoped Queries
All task queries must include user_id filter:
```python
# Correct - filtered by user
tasks = session.exec(select(Task).where(Task.user_id == user_id))

# Incorrect - no filter (would be blocked by design)
tasks = session.exec(select(Task))  # This would not be allowed
```

### Validation Checklist
- [ ] All queries filter by user_id
- [ ] Foreign key constraints are enforced
- [ ] No direct database access from frontend
- [ ] Schema matches specification exactly
- [ ] No orphaned task records possible
- [ ] All database operations are tested