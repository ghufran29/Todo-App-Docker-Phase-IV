# Data Model: Database and Data Model

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

## User Entity

### Attributes
- **id** (UUID): Unique identifier for the user (primary key)
- **email** (string, unique): User's email address (required)
- **hashed_password** (string): BCrypt hashed password (required)
- **created_at** (datetime): Account creation timestamp (required, auto-generated)
- **updated_at** (datetime): Last account update timestamp (required, auto-generated)
- **is_active** (boolean): Whether the account is active/enabled (default: true)
- **email_verified** (boolean): Whether the email has been verified (default: false)

### Relationships
- User has many tasks (one-to-many)

### Validation Rules
- Email must be in valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements when provided
- Email verification required before full account activation

## Task Entity

### Attributes
- **id** (UUID): Unique identifier for the task (primary key)
- **title** (string): Task title or brief description (required, max 200 chars)
- **description** (text): Detailed description of the task (optional)
- **status** (string enum): Task status (pending, in_progress, completed) (default: pending)
- **priority** (string enum): Task priority (low, medium, high, urgent) (default: medium)
- **due_date** (datetime): When the task is due (optional)
- **completed_at** (datetime): When the task was completed (optional)
- **created_at** (datetime): Task creation timestamp (required, auto-generated)
- **updated_at** (datetime): Last task update timestamp (required, auto-generated)
- **user_id** (UUID): Reference to the user who owns this task (foreign key, required)

### Relationships
- Task belongs to one user (many-to-one)

### Validation Rules
- Title must be provided and not exceed 200 characters
- Status must be one of the allowed values (pending, in_progress, completed)
- Priority must be one of the allowed values (low, medium, high, urgent)
- Due date must be in the future if provided
- User_id must reference an existing user
- No task can exist without a valid user_id (foreign key constraint)

## Indexes

### User Entity Indexes
- **idx_user_email**: Unique index on email field for fast lookups and uniqueness enforcement
- **idx_user_created_at**: Index on created_at for sorting and filtering by account age

### Task Entity Indexes
- **idx_task_user_id**: Index on user_id for efficient user-specific queries
- **idx_task_status**: Index on status for filtering by task status
- **idx_task_due_date**: Index on due_date for sorting by deadline
- **idx_task_priority**: Index on priority for sorting by priority

## Foreign Key Constraints

### User-Task Relationship
- **fk_task_user_id**: Enforces that each task's user_id references a valid user
- **ON DELETE CASCADE**: When a user is deleted, all their tasks are automatically removed
- **ON UPDATE CASCADE**: If user ID changes (rare), task references are updated accordingly
- **NO ORPHANS**: Prevents creation of tasks without valid user_id

## Database Schema and Relationships

### Table Definitions
1. **Users Table**: Stores user account information with unique email constraint
2. **Tasks Table**: Stores user-specific tasks with foreign key relationship to users
3. **Primary Keys**: UUID-based for both tables for distributed system compatibility
4. **Foreign Key**: user_id in tasks table references id in users table

### Relationships
- One-to-Many: One user can have many tasks
- Referential Integrity: Enforced at database level
- Cascade Behavior: Tasks are removed when user is removed

## Migration or Initialization Flow

### Schema Initialization
1. Create Users table with all specified columns and constraints
2. Create Tasks table with all specified columns and constraints
3. Create foreign key relationship between tables
4. Apply all indexes for optimized queries
5. Validate schema against SQLModel definitions

### Migration Strategy
- Use Alembic for versioned schema migrations
- Support for forward and rollback operations
- Data preservation during schema updates
- Neon-compatible migration operations

## Data Access Patterns

### User-Specific Queries (Always Filtered by user_id)
- Retrieve all tasks for a specific user
- Count tasks by status for a specific user
- Filter tasks by priority for a specific user
- Get upcoming tasks (by due date) for a specific user
- Update/delete operations limited to user's own tasks

### Security Considerations
- All task queries must filter by user_id to enforce data isolation
- No direct access to tasks without user_id filtering
- Backend enforces all data access controls
- Queries without user_id filter are blocked by design
- Cross-user data access prevented at both application and database levels