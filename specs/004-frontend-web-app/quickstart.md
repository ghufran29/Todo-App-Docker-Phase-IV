# Quick Start Guide: Frontend Web Application

## Prerequisites

- Node.js 18+ with npm/yarn/pnpm
- Python 3.11+ for backend API
- Neon PostgreSQL database (with connection URL)
- Better Auth compatible environment

## Setup Instructions

### 1. Install Dependencies
```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install
# or yarn install
# or pnpm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend root directory:

```bash
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_JWT_TOKEN_KEY=auth_token
```

### 3. Start the Application
```bash
# For development
npm run dev
# or yarn dev
# or pnpm dev

# For production build
npm run build
npm run start
```

The application will start on http://localhost:3000 by default.

## Project Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── signup/
│   │   │   └── page.tsx      # Registration page
│   │   └── signin/
│   │       └── page.tsx      # Login page
│   ├── tasks/
│   │   ├── page.tsx          # Task list page
│   │   ├── [id]/
│   │   │   └── page.tsx      # Individual task page
│   │   └── create/
│   │       └── page.tsx      # Task creation page
│   ├── profile/
│   │   └── page.tsx          # User profile page
│   ├── layout.tsx            # Root layout with auth provider
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx    # Registration form component
│   │   │   ├── SigninForm.tsx    # Login form component
│   │   │   └── ProtectedRoute.tsx # Authentication guard component
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx      # Task listing component
│   │   │   ├── TaskItem.tsx      # Individual task display component
│   │   │   └── TaskForm.tsx      # Task creation/editing form
│   │   └── ui/
│   │       ├── Button.tsx        # Reusable button component
│   │       └── Input.tsx         # Reusable input component
│   ├── services/
│   │   └── api_client.ts         # Centralized API client with JWT handling
│   ├── hooks/
│   │   └── useAuth.ts            # Authentication state management hook
│   └── types/
│       ├── user.ts               # User type definitions
│       └── task.ts               # Task type definitions
├── .env.local                   # Environment variables
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

## Key Components

### Authentication Components
- **SignupForm**: Handles user registration with validation
- **SigninForm**: Handles user authentication with validation
- **ProtectedRoute**: Wrapper component that enforces authentication

### Task Management Components
- **TaskList**: Displays all tasks for the authenticated user
- **TaskItem**: Individual task display with status and action buttons
- **TaskForm**: Form for creating and updating tasks

### API Service
- **api_client**: Centralized service that handles all API communication with automatic JWT token attachment

### Authentication Hook
- **useAuth**: React hook that provides authentication state and methods throughout the application

## API Client Usage

The centralized API client automatically handles JWT token management:

```typescript
import { apiClient } from '../services/api_client';

// All requests automatically include the JWT token
const response = await apiClient.get('/api/tasks');

// Creating a task
const newTask = await apiClient.post('/api/tasks', {
  title: 'New Task',
  description: 'Task description'
});

// Updating a task
const updatedTask = await apiClient.put(`/api/tasks/${taskId}`, {
  title: 'Updated Task Title',
  status: 'in_progress'
});
```

## Authentication Flow

### User Registration
1. User visits `/auth/signup` page
2. User fills out registration form with email and password
3. Form validates input on the client side
4. Client sends request to backend API with user details
5. Backend creates user account and returns authentication tokens
6. Client stores tokens and redirects to task dashboard

### User Login
1. User visits `/auth/signin` page
2. User enters email and password
3. Form validates input format
4. Client sends credentials to backend authentication endpoint
5. Backend validates credentials and returns tokens if valid
6. Client stores tokens and redirects to task dashboard

### Protected Routes
1. User navigates to a protected route
2. Authentication state is checked
3. If authenticated, route is rendered
4. If not authenticated, user is redirected to login

## Task Management Flow

### Viewing Tasks
1. User accesses the `/tasks` page (protected route)
2. API client fetches user's tasks from backend
3. Tasks are displayed in a responsive list
4. Loading and error states are properly handled

### Creating Tasks
1. User clicks "Create Task" button
2. User is taken to `/tasks/create` page
3. User fills out task details in the form
4. Form validates input
5. Client sends task data to backend API
6. Task is saved and added to the user's list

### Updating Tasks
1. User selects a task to update
2. User is taken to `/tasks/[id]` page
3. User updates task details in the form
4. Client sends update request to backend API
5. Task is updated in the database

### Completing Tasks
1. User toggles completion status on a task
2. Client sends PATCH request to mark task as completed
3. Backend updates the task status
4. UI updates to reflect the change

## Error Handling

The application includes comprehensive error handling:

- Client-side validation before API calls
- Proper error responses from API endpoints
- Loading states during API operations
- User-friendly error messages
- Session expiration handling

## Testing

### Component Testing
- Individual components can be unit tested in isolation
- Mock authentication state for testing protected components
- Simulate API responses for testing error scenarios

### Integration Testing
- End-to-end user flows (register → login → create task → complete task)
- Authentication flows (successful and unsuccessful scenarios)
- API integration tests (with mock backend or real backend)

## Deployment

### Environment Variables
The following environment variables are required for deployment:

```bash
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_JWT_TOKEN_KEY=your_token_key
```

### Production Builds
```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Troubleshooting

### Common Issues
- **Token not attached to requests**: Check that the authentication state is properly initialized
- **Authentication fails**: Verify backend API is running and accessible
- **Protected routes not working**: Check that ProtectedRoute is properly wrapped around protected content
- **API endpoints returning 401**: Verify JWT token is valid and not expired

### Debugging API Requests
- Check the browser's Network tab for request details
- Verify the Authorization header contains the correct token
- Check that the API endpoint is accessible at the configured URL

This quick start guide provides all necessary information to set up, run, and understand the frontend web application with its authentication and task management features.