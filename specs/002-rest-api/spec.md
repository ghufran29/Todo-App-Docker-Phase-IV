# Feature Specification: Backend REST API

**Feature Branch**: `002-rest-api`
**Created**: 2026-02-05
**Status**: Draft
**Input**: User description: "## Spec
Spec 3. Backend REST API

## Target audience
Developers and reviewers evaluating a secure REST API built with FastAPI and agent driven workflow.

## Focus
- Task management REST APIs
- JWT protected endpoints
- Request and response validation
- User scoped data access

## Scope
Building:
- FastAPI project structure
- All task CRUD endpoints
- JWT verification integration
- Dependency or middleware based auth enforcement
- Request and response models
- User based task filtering
- Consistent error handling

Not building:
- GraphQL APIs
- Bulk task operations
- Background jobs or queues
- WebSockets or realtime updates
- Admin or analytics endpoints

## API endpoints
- GET /api/{user_id}/tasks
- POST /api/{user_id}/tasks
- GET /api/{user_id}/tasks/{id}
- PUT /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH /api/{user_id}/tasks/{id}/complete

## Success criteria
- All endpoints require valid JWT
- Requests without token return 401
- Requests with invalid token return 401
- User ID in token must match route user_id
- Each endpoint accesses only user owned tasks
- All CRUD operations work as expected
- Correct HTTP status codes returned
- Input data validated before processing

## Constraints
- Use FastAPI only
- Use SQLModel for database interaction
- No direct database access outside backend
- No manual code writing
- All logic generated via Backend Agent
- Stateless request handling"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrieve User's Tasks (Priority: P1)

An authenticated user wants to view all their tasks through the API to manage their to-do list effectively.

**Why this priority**: This is the most basic functionality needed after authentication - users need to see their tasks to manage them.

**Independent Test**: Authenticate as a user, make a request to GET /api/{user_id}/tasks, and verify that only tasks belonging to that user are returned with proper authentication validation.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they request their tasks via GET /api/{user_id}/tasks where user_id matches their token, **Then** they receive a 200 response with an array of their tasks
2. **Given** a request is made without a JWT token, **When** accessing GET /api/{user_id}/tasks, **Then** the system returns a 401 Unauthorized response

---

### User Story 2 - Create New Task (Priority: P1)

An authenticated user wants to create a new task for themselves to keep track of items they need to complete.

**Why this priority**: Core functionality that enables users to add items to their to-do list.

**Independent Test**: Authenticate as a user, make a POST request to /api/{user_id}/tasks with valid task data, and verify the task is created for the authenticated user with proper validation.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they POST to /api/{user_id}/tasks with valid task data where user_id matches their token, **Then** a new task is created and returned with 201 status
2. **Given** a user is authenticated but provides invalid task data, **When** they POST to /api/{user_id}/tasks, **Then** the system returns a 422 validation error response

---

### User Story 3 - Manage Individual Tasks (Priority: P2)

An authenticated user wants to view, update, or delete specific tasks to manage their to-do list effectively.

**Why this priority**: Secondary functionality that allows users to interact with individual tasks after creating them.

**Independent Test**: Authenticate as a user, perform GET/PUT/DELETE operations on specific tasks, and verify that operations only work on tasks owned by the authenticated user.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token and owns a task, **When** they request a specific task via GET /api/{user_id}/tasks/{id} where user_id and task_id match their ownership, **Then** they receive the task details with 200 status
2. **Given** a user is authenticated and owns a task, **When** they PUT to /api/{user_id}/tasks/{id} with updated data, **Then** the task is updated and returned with 200 status

---

### User Story 4 - Complete Tasks (Priority: P2)

An authenticated user wants to mark specific tasks as completed to track their progress.

**Why this priority**: Important functionality for task lifecycle management that allows users to track completed work.

**Independent Test**: Authenticate as a user, make a PATCH request to mark a task as complete, and verify the task status is updated correctly with proper authorization checks.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token and owns a task, **When** they PATCH /api/{user_id}/tasks/{id}/complete, **Then** the task status is updated to completed with 200 status
2. **Given** a user is authenticated but doesn't own the task, **When** they attempt to complete another user's task, **Then** the system returns a 403 Forbidden response

---

### Edge Cases

- What happens when a user attempts to access another user's tasks using their own token?
- How does the system handle requests with malformed JWT tokens?
- What occurs when a user tries to access a task that doesn't exist?
- How does the system respond when the user_id in the URL doesn't match the token's user_id?
- What happens if a request includes invalid data that fails validation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require a valid JWT token for all task endpoints
- **FR-002**: System MUST return 401 Unauthorized for requests without valid authentication tokens
- **FR-003**: System MUST validate that the user_id in the URL path matches the user_id in the JWT token
- **FR-004**: System MUST only allow users to access tasks that belong to their own account
- **FR-005**: System MUST implement GET /api/{user_id}/tasks to return all tasks for the specified user
- **FR-006**: System MUST implement POST /api/{user_id}/tasks to create new tasks for the specified user
- **FR-007**: System MUST implement GET /api/{user_id}/tasks/{id} to retrieve a specific task
- **FR-008**: System MUST implement PUT /api/{user_id}/tasks/{id} to update a specific task
- **FR-009**: System MUST implement DELETE /api/{user_id}/tasks/{id} to remove a specific task
- **FR-010**: System MUST implement PATCH /api/{user_id}/tasks/{id}/complete to mark a task as completed
- **FR-011**: System MUST validate all input data before processing requests
- **FR-012**: System MUST return appropriate HTTP status codes for all responses
- **FR-013**: System MUST return 403 Forbidden when users attempt to access resources they don't own
- **FR-014**: System MUST prevent unauthorized access to tasks through user_id parameter manipulation

### Key Entities *(include if feature involves data)*

- **Task**: Represents a to-do item owned by a specific user with properties like title, description, status, priority, and due date
- **User**: Represents an authenticated user who owns tasks and can perform CRUD operations on their own tasks
- **Authentication Token**: JWT-based credential that identifies the authenticated user and validates their access rights

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All API endpoints return 401 status for requests without valid JWT tokens (100% compliance)
- **SC-002**: API endpoints return 403 status when user_id in token doesn't match user_id in URL (100% compliance)
- **SC-003**: Users can successfully retrieve only their own tasks via GET /api/{user_id}/tasks endpoint (100% accuracy)
- **SC-004**: Users can create new tasks that are properly associated with their account via POST /api/{user_id}/tasks (100% success rate)
- **SC-005**: Users can update and delete only their own tasks with proper authorization validation (100% accuracy)
- **SC-006**: All API endpoints return appropriate HTTP status codes as specified in the requirements (100% compliance)
- **SC-007**: Input validation prevents invalid data from being processed with clear error responses (100% validation coverage)
