# API Contract: Task Management Endpoints

## Authentication API

### POST /api/auth/signup
Register a new user account and return JWT tokens.

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirm_password": "securePassword123"
}
```

#### Response 200 OK
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
  "token_type": "bearer"
}
```

#### Response 400 Bad Request
```json
{
  "success": false,
  "detail": "A user with this email already exists"
}
```

### POST /api/auth/signin
Authenticate an existing user and return JWT tokens.

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response 200 OK
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
  "detail": "Incorrect email or password"
}
```

## Task Management API

### GET /api/{user_id}/tasks
Retrieve all tasks for the specified user (must be authenticated user).

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **user_id** (string, required): The ID of the user whose tasks to retrieve

#### Response 200 OK
```json
[
  {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "completed_at": null,
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

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot access other user's data"
}
```

### POST /api/{user_id}/tasks
Create a new task for the specified user (must be authenticated user).

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- **user_id** (string, required): The ID of the user for whom to create the task

#### Request Body
```json
{
  "title": "New task",
  "description": "Task description (optional)",
  "status": "pending",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z"
}
```

#### Response 201 Created
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
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

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot create tasks for other users"
}
```

### GET /api/{user_id}/tasks/{id}
Retrieve a specific task by its ID for the specified user.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **user_id** (string, required): The ID of the user who owns the task
- **id** (string, required): The ID of the task to retrieve

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
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

### PUT /api/{user_id}/tasks/{id}
Update a specific task by its ID for the specified user.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- **user_id** (string, required): The ID of the user who owns the task
- **id** (string, required): The ID of the task to update

#### Request Body
```json
{
  "title": "Updated task title (optional)",
  "description": "Updated description (optional)",
  "status": "in_progress (optional)",
  "priority": "high (optional)",
  "due_date": "2023-12-31T10:00:00Z (optional)",
  "completed_at": "2023-12-31T10:00:00Z (optional)"
}
```

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
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
  "detail": "Access forbidden: Cannot update other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### DELETE /api/{user_id}/tasks/{id}
Delete a specific task by its ID for the specified user.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **user_id** (string, required): The ID of the user who owns the task
- **id** (string, required): The ID of the task to delete

#### Response 204 No Content
Task was successfully deleted.

#### Response 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### Response 403 Forbidden
```json
{
  "detail": "Access forbidden: Cannot delete other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### PATCH /api/{user_id}/tasks/{id}/complete
Mark a specific task as completed for the specified user.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Path Parameters
- **user_id** (string, required): The ID of the user who owns the task
- **id** (string, required): The ID of the task to mark as complete

#### Request Body
```json
{
  "completed": true
}
```

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "user_id": "user-id-string",
  "title": "Task title",
  "description": "Task description",
  "status": "completed",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": "2023-01-01T00:00:00Z",  // Current timestamp when completed
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
  "detail": "Access forbidden: Cannot modify other user's data"
}
```

#### Response 404 Not Found
```json
{
  "detail": "Task not found"
}
```

## Authentication and Authorization Rules

### JWT Token Requirements
- All endpoints require a valid JWT token in the Authorization header
- Token must not be expired
- Token signature must be valid
- User associated with token must be active

### User ID Validation
- The user_id in the URL path must match the user_id in the JWT token
- Users cannot access tasks belonging to other users
- All requests undergo user ownership validation before processing

### Error Response Format
All error responses follow this format:
```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes
- 200: Successful GET, PUT, PATCH operations
- 201: Successful POST operation (resource created)
- 204: Successful DELETE operation (no content to return)
- 400: Bad request (validation errors, malformed data)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (valid token but insufficient permissions)
- 404: Not found (requested resource doesn't exist)
- 422: Validation error (request data doesn't meet requirements)
- 500: Internal server error (unexpected server error)