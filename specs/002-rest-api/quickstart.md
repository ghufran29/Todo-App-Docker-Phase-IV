# Quick Start Guide: Backend REST API

## Prerequisites

- Python 3.11+
- PostgreSQL-compatible database (Neon Serverless PostgreSQL recommended)
- pip package manager
- Git (optional, for cloning)

## Setup Instructions

### 1. Clone and Navigate to Backend
```bash
# If you haven't already set up the project
cd backend
```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the backend directory with your database connection details:

```bash
DATABASE_URL="postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION_TIME=3600
ENVIRONMENT=development
```

### 4. Initialize the Database
```bash
cd backend
python -m src.database.database_setup
```

### 5. Start the Server
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

## API Usage Examples

### Authentication
First, you'll need to register a user:

```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "confirm_password": "securePassword123"
  }'
```

Then, sign in to get your JWT token:

```bash
curl -X POST "http://localhost:8000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Using Your Token for Task Operations
Once you have your JWT token, you can perform task operations:

**Create a task:**
```bash
curl -X POST "http://localhost:8000/api/{your-user-id}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Task",
    "description": "This is a sample task",
    "status": "pending",
    "priority": "medium"
  }'
```

**Get all your tasks:**
```bash
curl -X GET "http://localhost:8000/api/{your-user-id}/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update a task:**
```bash
curl -X PUT "http://localhost:8000/api/{your-user-id}/tasks/{task-id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task Title",
    "status": "in_progress"
  }'
```

**Mark a task as complete:**
```bash
curl -X PATCH "http://localhost:8000/api/{your-user-id}/tasks/{task-id}/complete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Delete a task:**
```bash
curl -X DELETE "http://localhost:8000/api/{your-user-id}/tasks/{task-id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── models/           # SQLModel database models
│   │   ├── user.py       # User data model
│   │   ├── task.py       # Task data model
│   │   └── base.py       # Base model with common fields
│   ├── services/         # Business logic services
│   │   ├── user_service.py    # User operations
│   │   ├── task_service.py    # Task operations
│   │   └── auth_service.py    # Authentication operations
│   ├── api/              # API route handlers
│   │   ├── auth_router.py     # Authentication endpoints
│   │   ├── task_router.py     # Task management endpoints
│   │   └── middleware/        # Authentication middleware
│   │       └── auth_middleware.py
│   ├── config/           # Configuration files
│   │   └── auth_config.py     # Authentication settings
│   ├── utils/            # Utility functions
│   │   └── jwt_utils.py       # JWT token utilities
│   └── main.py           # FastAPI application entry point
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not in version control)
└── tests/                # Test files
```

## Key Components

### Models
- `User`: Represents application users with email and password
- `Task`: Represents tasks owned by users with title, status, priority, etc.

### Services
- `UserService`: Handles user creation, retrieval, and authentication
- `TaskService`: Manages task CRUD operations with user validation
- `AuthService`: Implements authentication logic and token generation

### API Endpoints
- `/api/auth/*`: Registration and authentication routes
- `/api/{user_id}/tasks`: User-specific task management routes

## Security Features

1. **JWT Authentication**: All task endpoints require valid JWT tokens
2. **User Isolation**: Users can only access their own tasks
3. **Password Hashing**: Passwords are securely hashed with bcrypt
4. **Input Validation**: All requests are validated before processing
5. **Rate Limiting**: Built-in protection against abuse (optional middleware)

## Testing the API

You can access the automatically generated API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

The `/health` endpoint can be used to verify the service is running:
```bash
curl http://localhost:8000/health
```

## Troubleshooting

- **401 Unauthorized**: Verify your JWT token is valid and not expired
- **403 Forbidden**: Ensure the user_id in the URL matches the user_id in your JWT token
- **404 Not Found**: Verify that the requested resource exists and belongs to your user
- **500 Internal Error**: Check the server logs for detailed error information

## Next Steps

1. Implement frontend integration with the API
2. Add more sophisticated validation rules
3. Implement pagination for task lists
4. Add task categorization or tagging
5. Implement refresh token functionality for extended sessions