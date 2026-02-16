# API Contract: Task Management Endpoints

## Task Management API with User Isolation

### GET /api/tasks
Retrieve all tasks for the authenticated user.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Response 200 OK
```json
[
  {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",  // or "in_progress", "completed"
    "priority": "medium", // or "low", "high", "urgent"
    "due_date": "2023-12-31T10:00:00Z",
    "completed_at": null, // or timestamp if completed
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "user_id": "user-uuid-string"
  }
]
```

#### Response 401 Unauthorized
```json
{
  "detail": "Authentication required"
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
  "status": "pending",      // Default if not provided
  "priority": "medium",     // Default if not provided
  "due_date": "2023-12-31T10:00:00Z"  // Optional
}
```

#### Response 201 Created
```json
{
  "id": "uuid-string",
  "title": "New task",
  "description": "Task description (optional)",
  "status": "pending",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "user_id": "user-uuid-string"
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
  "detail": "Authentication required"
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

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "user_id": "user-uuid-string"
}
```

#### Response 401 Unauthorized
```json
{
  "detail": "Authentication required"
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
Update a specific task by its ID.

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
  "status": "in_progress (optional)",    // Valid values: pending, in_progress, completed
  "priority": "high (optional)",         // Valid values: low, medium, high, urgent
  "due_date": "2023-12-31T10:00:00Z (optional)",
  "completed_at": "2023-12-31T10:00:00Z (optional)"
}
```

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2023-12-31T10:00:00Z",
  "completed_at": "2023-12-31T10:00:00Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",  // This will be updated to current time
  "user_id": "user-uuid-string"
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
  "detail": "Authentication required"
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
Delete a specific task by its ID.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **task_id** (string, required): The ID of the task to delete

#### Response 204 No Content
Task was successfully deleted.

#### Response 401 Unauthorized
```json
{
  "detail": "Authentication required"
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

### GET /api/tasks/status/{status}
Retrieve all tasks for the authenticated user with a specific status.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **status** (string, required): The status to filter by (pending, in_progress, completed)

#### Response 200 OK
```json
[
  {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",  // Will match the status parameter
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "completed_at": null,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "user_id": "user-uuid-string"
  }
]
```

#### Response 401 Unauthorized
```json
{
  "detail": "Authentication required"
}
```

## Database Query Patterns and User Isolation

### User Isolation Pattern
All task queries must include a user_id filter to ensure data isolation:
```sql
SELECT * FROM tasks WHERE user_id = ? AND [other conditions];
```

### Backend Session Scoping
- Each API request uses a new database session
- Sessions are scoped per HTTP request
- User identity is validated in each session
- All queries include user_id filter in WHERE clause

### Security Considerations
- All endpoints require authentication via JWT token
- All task operations validate that the user owns the task being accessed
- Users cannot access other users' tasks regardless of the task ID they provide
- Error responses do not reveal the existence of tasks owned by other users
- Backend acts as the sole database access point (no direct frontend DB access)
- All data access follows user_id filtering pattern

## Schema Validation Against API Usage

### Schema Consistency
- All API response fields match database schema definitions
- Foreign key constraints ensure data integrity
- Indexes support the query patterns used by API endpoints
- Validation rules are enforced both at API and database level