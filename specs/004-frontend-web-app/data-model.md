# Data Model: Frontend Web Application

## Entity: User Session

### Attributes
- **userId** (string): Unique identifier for the authenticated user
- **email** (string): Email address of the authenticated user
- **accessToken** (string): JWT access token for API authentication
- **refreshToken** (string): JWT refresh token for token renewal
- **expiresAt** (datetime): Timestamp when the access token expires
- **isActive** (boolean): Whether the session is currently active

### Relationships
- User Session corresponds to one backend User entity (1:1 mapping)
- Multiple session states may exist across different devices/browsers for same user

### Validation Rules
- Session must have valid, non-expired access token to be considered active
- Session cannot be used without proper authentication token
- Session state must be validated against backend for security purposes

## Entity: TaskItem

### Attributes
- **id** (UUID): Unique identifier for the task
- **title** (string): Task title or brief description (required, max 200 chars)
- **description** (string): Detailed task description (optional)
- **status** (enum): Task status (pending, in_progress, completed) (default: pending)
- **priority** (enum): Task priority (low, medium, high, urgent) (default: medium)
- **dueDate** (datetime): When the task is due (optional)
- **completedAt** (datetime): When the task was marked as completed (optional)
- **createdAt** (datetime): When the task was created (server-generated)
- **updatedAt** (datetime): When the task was last updated (server-generated)
- **userId** (string): Reference to the user who owns this task (matches session.userId)

### Relationships
- TaskItem belongs to exactly one User Session (many-to-one)
- User Session has many TaskItems (one-to-many)

### Validation Rules
- Title must be provided and not exceed 200 characters
- Status must be one of allowed values: pending, in_progress, completed
- Priority must be one of allowed values: low, medium, high, urgent
- Due date must be in the future if provided
- TaskItem can only be accessed by the authenticated user who owns it
- User ID in session must match user ID of task for access

## Entity: API Request

### Attributes
- **method** (string): HTTP method (GET, POST, PUT, DELETE, PATCH)
- **url** (string): Endpoint URL for the request
- **headers** (object): Request headers including Authorization
- **body** (object): Request payload (for POST/PUT/PATCH)
- **timestamp** (datetime): When the request was initiated
- **status** (number): Response status code (after completion)

### Relationships
- API Request is authenticated by one User Session (many-to-one)
- API Request may affect one or more TaskItems depending on endpoint

### Validation Rules
- Must include valid Authorization header with JWT token
- Request body must conform to expected schema for each endpoint
- URL must be a valid API endpoint for the application
- Request must match user's permissions and ownership for data access

## State Management Structure

### Auth State
```typescript
interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Task State
```typescript
interface TaskState {
  tasks: TaskItem[];
  currentTask: TaskItem | null;
  isLoading: boolean;
  error: string | null;
}
```

### Validation Schemas

### Task Validation Schema
- Title: Required, min 1 character, max 200 characters
- Description: Optional, max 1000 characters
- Status: Must be one of "pending", "in_progress", "completed"
- Priority: Must be one of "low", "medium", "high", "urgent"
- Due Date: If provided, must be in the future
- User ID: Must match authenticated user's ID

### User Session Validation Schema
- Email: Required, must be valid email format
- Access Token: Required, must be valid JWT format
- Expiration: Must be in the future
- User ID: Required, must be valid UUID format

## Component State Relationships

### Page Components
- **Auth Pages** (signup, signin): Manage authentication state transitions
- **Task List Page**: Displays tasks from TaskItem collection filtered by user
- **Task Detail Page**: Shows single TaskItem with full details
- **Task Creation Page**: Captures new TaskItem data with validation

### Shared State
- Auth State is accessible across all protected routes
- Task State is synchronized with server through API Client
- Loading and Error states are communicated to users consistently
- Navigation state respects authentication boundaries

## API Response Models

### Auth Response Model
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "is_active": true,
    "email_verified": false,
    "created_at": "2023-01-01T00:00:00Z"
  },
  "access_token": "jwt-token-string",
  "refresh_token": "jwt-refresh-token-string",
  "token_type": "bearer"
}
```

### Task Response Model
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Task List Response Model
```json
[
  {
    "id": "uuid-string",
    "user_id": "user-uuid-string",
    "title": "First task",
    "description": "Description of first task",
    "status": "pending",
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "completed_at": null,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

## Client-Side Validation

### Form Validation Rules
- Email format validation using standard regex
- Password strength validation (min 8 chars, mixed case, numbers, special chars)
- Required field validation for all mandatory inputs
- Length validation for text fields
- Date validation for due dates
- Status/priority enum validation

### API Response Validation
- Success/error response structure validation
- Data shape validation against expected models
- Token expiration checking
- User ownership verification for retrieved data

## Error State Models

### Error Response Structure
```json
{
  "success": false,
  "error": "Error message",
  "error_code": "CODE_STRING",
  "timestamp": "ISO-8601 datetime"
}
```

### Loading State Indicators
- Page-level loading indicators
- Component-level loading states
- Form submission feedback
- API call progress indicators

These models ensure data integrity and proper state management throughout the frontend application while maintaining proper authentication and authorization controls.