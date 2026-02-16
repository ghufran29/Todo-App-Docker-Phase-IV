# Quick Start Guide: Authentication and User Identity

## Prerequisites

- Node.js 18+ for frontend development
- Python 3.11+ for backend development
- Neon Serverless PostgreSQL database
- Environment variables configured (BETTER_AUTH_SECRET)

## Setup Instructions

### 1. Clone and Initialize
```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Environment Configuration
Create `.env` files in both frontend and backend with the following variables:

**Backend (.env)**:
```bash
DATABASE_URL=postgresql://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION_TIME=3600
```

**Frontend (.env)**:
```bash
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Database Setup
```bash
# From the backend directory
cd backend
python -m src.database.init
```

### 4. Running the Applications

**Start the backend:**
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Start the frontend:**
```bash
cd frontend
npm run dev
```

## Authentication Flow

### User Registration
1. Navigate to `/signup` on the frontend
2. Submit email and password
3. Better Auth creates the user and returns a JWT token
4. Frontend stores the token securely

### User Login
1. Navigate to `/signin` on the frontend
2. Submit credentials
3. Better Auth validates credentials and returns JWT token
4. Frontend stores token and redirects to protected area

### Making Authenticated API Calls
1. Frontend retrieves JWT token from storage
2. Adds `Authorization: Bearer <token>` header to API requests
3. Backend middleware validates the token
4. Request proceeds if token is valid and not expired

### Accessing Protected Endpoints
```javascript
// Example API call with authentication
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Key Components

### Frontend Components
- `components/auth/SignupForm.tsx` - Registration form
- `components/auth/SigninForm.tsx` - Login form
- `components/auth/ProtectedRoute.tsx` - Route guard for protected pages
- `services/api_client.ts` - API client with automatic auth header injection
- `hooks/useAuth.ts` - Authentication state management

### Backend Components
- `src/models/user.py` - User data model
- `src/api/auth_router.py` - Authentication endpoints
- `src/api/middleware/auth_middleware.py` - JWT validation middleware
- `src/services/auth_service.py` - Authentication business logic
- `src/config/auth_config.py` - Authentication configuration

## Testing Authentication

### Unit Tests
```bash
# Backend tests
cd backend
pytest tests/unit/test_auth.py

# Frontend tests
cd frontend
npm test
```

### Integration Tests
```bash
# Test complete auth flow
cd backend
pytest tests/integration/test_auth_flow.py
```

## Troubleshooting

### Common Issues
- **Invalid Token**: Check that JWT secret matches between frontend and backend
- **CORS Errors**: Verify that frontend URL is allowed in backend CORS configuration
- **Database Connection**: Ensure Neon PostgreSQL connection string is correct
- **Expired Tokens**: Adjust JWT expiration time in configuration if needed