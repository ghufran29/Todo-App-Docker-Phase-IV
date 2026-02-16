# API Documentation - Todo Application Frontend

## Base URL
```
Development: http://localhost:8000
Production: https://api.yourdomain.com
```

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Sign Up (Register)
**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "is_active": true,
    "email_verified": false,
    "created_at": "2026-02-07T00:00:00Z"
  },
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "bearer"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or validation error
- `409 Conflict`: Email already registered

---

#### 2. Sign In (Login)
**POST** `/api/auth/signin`

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "is_active": true,
    "email_verified": false,
    "created_at": "2026-02-07T00:00:00Z"
  },
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing required fields

---

#### 3. Sign Out (Logout)
**POST** `/api/auth/signout`

Invalidate current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully signed out"
}
```

---

#### 4. Get Current User
**GET** `/api/users/me`

Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "is_active": true,
  "email_verified": false,
  "created_at": "2026-02-07T00:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

### Task Endpoints

#### 5. Get All Tasks
**GET** `/api/tasks`

Retrieve all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-string",
    "user_id": "user-uuid-string",
    "title": "Complete project documentation",
    "description": "Write API documentation for the frontend",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2026-02-15T10:00:00Z",
    "completed_at": null,
    "created_at": "2026-02-07T00:00:00Z",
    "updated_at": "2026-02-07T00:00:00Z"
  }
]
```

**Query Parameters (Optional):**
- `status`: Filter by status (pending, in_progress, completed)
- `priority`: Filter by priority (low, medium, high, urgent)
- `limit`: Number of results to return (default: 100)
- `offset`: Pagination offset (default: 0)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

#### 6. Get Task by ID
**GET** `/api/tasks/{task_id}`

Retrieve a specific task by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Complete project documentation",
  "description": "Write API documentation for the frontend",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2026-02-15T10:00:00Z",
  "completed_at": null,
  "created_at": "2026-02-07T00:00:00Z",
  "updated_at": "2026-02-07T00:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist

---

#### 7. Create Task
**POST** `/api/tasks`

Create a new task.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write API documentation for the frontend",
  "priority": "high",
  "due_date": "2026-02-15T10:00:00Z"
}
```

**Field Requirements:**
- `title` (required): 1-200 characters
- `description` (optional): Max 1000 characters
- `priority` (optional): "low", "medium", "high", or "urgent" (default: "medium")
- `due_date` (optional): ISO 8601 format datetime

**Response (201 Created):**
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Complete project documentation",
  "description": "Write API documentation for the frontend",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-02-15T10:00:00Z",
  "completed_at": null,
  "created_at": "2026-02-07T00:00:00Z",
  "updated_at": "2026-02-07T00:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Invalid input or validation error

---

#### 8. Update Task
**PUT** `/api/tasks/{task_id}`

Update an existing task.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "urgent",
  "due_date": "2026-02-20T10:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "urgent",
  "due_date": "2026-02-20T10:00:00Z",
  "completed_at": null,
  "created_at": "2026-02-07T00:00:00Z",
  "updated_at": "2026-02-07T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist
- `400 Bad Request`: Invalid input

---

#### 9. Update Task Completion Status
**PATCH** `/api/tasks/{task_id}/complete`

Mark a task as completed or uncompleted.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "user_id": "user-uuid-string",
  "title": "Complete project documentation",
  "description": "Write API documentation for the frontend",
  "status": "completed",
  "priority": "high",
  "due_date": "2026-02-15T10:00:00Z",
  "completed_at": "2026-02-07T15:30:00Z",
  "created_at": "2026-02-07T00:00:00Z",
  "updated_at": "2026-02-07T15:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist

---

#### 10. Delete Task
**DELETE** `/api/tasks/{task_id}`

Delete a task permanently.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task does not exist

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "error_code": "ERROR_CODE_STRING",
  "timestamp": "2026-02-07T15:30:00Z"
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: Access denied to the requested resource
- `NOT_FOUND`: Requested resource does not exist
- `VALIDATION_ERROR`: Request data failed validation
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server encountered an unexpected error

---

## Rate Limiting

API requests are rate-limited to:
- **100 requests per minute** for authenticated users
- **20 requests per minute** for unauthenticated endpoints

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1675789200
```

---

## Data Isolation

The API enforces strict user data isolation:
- All task endpoints automatically filter results by the authenticated user's ID
- Attempting to access another user's tasks returns `403 Forbidden`
- User ID is extracted from the JWT token and validated on every request

---

## Example Usage

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Sign up
const signup = async () => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
    email: 'user@example.com',
    password: 'SecurePass123!',
    confirm_password: 'SecurePass123!'
  });

  // Store tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
};

// Create task
const createTask = async () => {
  const token = localStorage.getItem('access_token');

  const response = await axios.post(
    `${API_BASE_URL}/api/tasks`,
    {
      title: 'My new task',
      description: 'Task description',
      priority: 'high'
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

// Get all tasks
const getTasks = async () => {
  const token = localStorage.getItem('access_token');

  const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Never log or expose JWT tokens**
3. **Store tokens securely** (localStorage with caution, or httpOnly cookies preferred)
4. **Implement token refresh** before expiration
5. **Validate all user input** on the frontend before sending to API
6. **Handle token expiration** gracefully with automatic logout or refresh
7. **Use CORS properly** to restrict API access to authorized domains

---

## Support

For API issues or questions, please contact:
- Email: support@todoapp.com
- GitHub Issues: https://github.com/yourusername/todo-app/issues

**Last Updated:** 2026-02-07