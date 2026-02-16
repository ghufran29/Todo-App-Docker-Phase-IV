# API Contracts: Frontend Web Application

## Authentication Endpoints

### POST /api/auth/signup
Register a new user account and return authentication tokens.

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

#### Response 200 Success
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "is_active": true,
    "email_verified": false,
    "role": "user",
    "created_at": "2023-01-01T00:00:00Z"
  },
  "token": "jwt-token-string",
  "refresh_token": "refresh-jwt-token-string",
  "token_type": "bearer"
}
```

#### Response 400 Bad Request
```json
{
  "success": false,
  "error": "Email already exists" // or "Passwords do not match", "Invalid email format"
}
```

### POST /api/auth/signin
Authenticate an existing user and return tokens.

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response 200 Success
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "is_active": true,
    "email_verified": false,
    "role": "user",
    "created_at": "2023-01-01T00:00:00Z"
  },
  "token": "jwt-token-string",
  "refresh_token": "refresh-jwt-token-string",
  "token_type": "bearer"
}
```

#### Response 401 Unauthorized
```json
{
  "success": false,
  "error": "Incorrect email or password"
}
```

### POST /api/auth/signout
End the current user session.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Response 200 Success
```json
{
  "success": true,
  "message": "Successfully signed out"
}
```

## Task Management Endpoints

### GET /api/tasks
Retrieve all tasks belonging to the authenticated user.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Response 200 Success
```json
[
  {
    "id": "uuid-string",
    "user_id": "user-uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",  // or "in_progress", "completed"
    "priority": "medium", // or "low", "high", "urgent"
    "due_date": "2023-12-31T10:00:00Z",
    "completed_at": null, // or timestamp if completed
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### POST /api/tasks
Create a new task for the authenticated user.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "New task",
  "description": "Task description (optional)",
  "status": "pending",    // default if not provided
  "priority": "medium",   // default if not provided
  "due_date": "2023-12-31T10:00:00Z"  // optional
}
```

#### Response 201 Created
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "New task",
  "description": "Task description (optional)",
  "status": "pending",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Response 400 Bad Request
```json
{
  "detail": "Validation error: [specific validation error]"
}
```

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### GET /api/tasks/{task_id}
Retrieve a specific task by its ID.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **task_id** (string, required): The ID of the task to retrieve

#### Response 200 Success
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

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot access other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### PUT /api/tasks/{task_id}
Update a specific task.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- **task_id** (string, required): The ID of the task to update

#### Request Body
```json
{
  "title": "Updated task title (optional)",
  "description": "Updated description (optional)",
  "status": "in_progress (optional)",      // Valid: pending, in_progress, completed
  "priority": "high (optional)",           // Valid: low, medium, high, urgent
  "due_date": "2023-12-31T10:00:00Z (optional)",
  "completed_at": "2023-12-31T10:00:00Z (optional)"
}
```

#### Response 200 Success
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": "2023-12-31T10:00:00Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"  // Updated to current time
}
```

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot access other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### DELETE /api/tasks/{task_id}
Delete a specific task.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **task_id** (string, required): The ID of the task to delete

#### Response 200 Success
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot access other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### PATCH /api/tasks/{task_id}/complete
Mark a specific task as completed.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- **task_id** (string, required): The ID of the task to mark as completed

#### Request Body
```json
{
  "completed": true
}
```

#### Response 200 Success
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Task title",
  "description": "Task description",
  "status": "completed",  // Status is updated to completed
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": "2023-01-01T12:00:00Z",  // Current timestamp when completed
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"  // Updated to current time
}
```

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot access other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

## Error Response Format

All error responses follow this format:
```json
{
  "detail": "Human-readable error message"
}
```

Or for authentication-specific errors:
```json
{
  "success": false,
  "error": "Error message",
  "error_code": "ERROR_CODE"
}
```

## Authorization Requirements

All endpoints except `/api/auth/signup` and `/api/auth/signin` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

The token is validated server-side to ensure:
- Token is properly formatted and signed
- Token has not expired
- User account is active
- User has permission to access the requested resource
- For task endpoints, user owns the task being accessed

## Validation Requirements

### Input Validation
- Email format validation (RFC 5322 compliant)
- Password strength validation (min 8 chars, mixed case, numbers, special chars)
- Task title length validation (max 200 characters)
- Task status validation (must be pending, in_progress, or completed)
- Task priority validation (must be low, medium, high, or urgent)
- Date format validation (ISO 8601 format)
- UUID format validation for IDs

### Business Validation
- Users can only access their own tasks
- Task ownership validation for all operations
- Email uniqueness validation on user creation
- Proper token authentication for all protected endpoints