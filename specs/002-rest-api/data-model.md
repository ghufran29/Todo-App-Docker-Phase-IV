# Data Model: Backend REST API

## Entity: User

### Attributes
- **id** (UUID): Unique identifier for the user (primary key)
- **email** (string): User's email address (required, unique)
- **hashed_password** (string): BCrypt hashed password (required)
- **is_active** (boolean): Whether the account is active/enabled (default: true)
- **email_verified** (boolean): Whether the email has been verified (default: false)
- **role** (string enum): User role (user, admin) (default: user)
- **created_at** (datetime): Account creation timestamp (required, auto-generated)
- **updated_at** (datetime): Last account update timestamp (required, auto-generated)

### Relationships
- User has many Tasks (one-to-many, with cascade delete for orphaned tasks)

### Validation Rules
- Email must be in valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements when provided
- Email verification required before full account activation

## Entity: Task

### Attributes
- **id** (UUID): Unique identifier for the task (primary key)
- **title** (string): Task title or brief description (required, max 200 chars)
- **description** (text): Detailed description of the task (optional)
- **status** (string enum): Task status (pending, in_progress, completed) (default: pending)
- **priority** (string enum): Task priority (low, medium, high, urgent) (default: medium)
- **due_date** (datetime): When the task is due (optional)
- **completed_at** (datetime): When the task was completed (optional, null if not completed)
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

## Entity: Authentication Token

### Attributes
- **token** (string): JWT token string (not stored, computed)
- **user_id** (UUID): Reference to the user this token authenticates (from JWT payload)
- **expires_at** (datetime): When the token expires (from JWT payload)
- **type** (string enum): Token type (access, refresh) (from JWT payload)

### Relationships
- Token represents authentication for one User (many-to-one)

### Validation Rules
- Token must be properly formatted JWT
- Token signature must be valid and not expired
- Token user_id must correspond to an existing User
- Refresh tokens have longer lifespan than access tokens

## Database Schema and Relationships

### Table Definitions
1. **Users Table**: Stores user account information with unique email constraint
2. **Tasks Table**: Stores user-specific tasks with foreign key relationship to users
3. **Primary Keys**: UUID-based for both tables for distributed system compatibility
4. **Foreign Key**: user_id in tasks table references id in users table

### Relationships
- One-to-Many: One user can have many tasks
- Referential Integrity: Enforced at database level with foreign key constraints
- Cascade Behavior: When user is deleted, all their tasks are automatically removed

## Indexes

### User Entity Indexes
- **idx_user_email**: Unique index on email field for fast lookups and uniqueness enforcement
- **idx_user_created_at**: Index on created_at for sorting and filtering by account age

### Task Entity Indexes
- **idx_task_user_id**: Index on user_id for efficient user-specific queries
- **idx_task_status**: Index on status for filtering by task status
- **idx_task_due_date**: Index on due_date for sorting by deadline
- **idx_task_priority**: Index on priority for sorting by priority

## API Request/Response Models

### User Request Models
- **UserCreate**: Email, password, confirm_password
- **UserUpdate**: Optional email, is_active, email_verified
- **UserLogin**: Email, password

### User Response Models
- **UserPublic**: Id, email, is_active, email_verified, role, created_at
- **UserAuthResponse**: UserPublic, access_token, refresh_token, token_type

### Task Request Models
- **TaskCreate**: Title, description (optional), status (default pending), priority (default medium), due_date (optional)
- **TaskUpdate**: Optional fields for title, description, status, priority, due_date
- **TaskCompleteUpdate**: Boolean for completed status

### Task Response Models
- **TaskPublic**: All task attributes including id, user_id, created_at, updated_at
- **TaskListResponse**: Array of TaskPublic objects

### Authentication Models
- **TokenPayload**: Sub (user_id), exp (expiration), iat (issued at)
- **TokenResponse**: Access token, refresh token, token type, expiration
- **ErrorResponse**: Success flag, error message, error code, timestamp

## Validation Requirements

### User-Level Validation
- Email format validation using standard regex pattern
- Password strength requirements (min 8 chars, mixed case, numbers, special chars)
- Duplicate email prevention
- Account status validation (active/inactive)

### Task-Level Validation
- Title length validation (max 200 characters)
- Status enum validation (pending, in_progress, completed)
- Priority enum validation (low, medium, high, urgent)
- Due date validation (future dates only)
- User ownership validation (can only access own tasks)
- Required field validation (title is required)

### Authentication Validation
- JWT token signature verification
- Token expiration validation
- User ID matching between token and request parameters
- Permission validation for specific operations
- Malformed token detection and handling