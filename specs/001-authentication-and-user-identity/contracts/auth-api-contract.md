# API Contract: Authentication Endpoints

## Authentication API

### POST /api/auth/signup
Register a new user account.

#### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

#### Response 201 Created
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "token": "jwt-token-string"
}
```

#### Response 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid email format" // or "Passwords do not match", "Email already exists"
}
```

### POST /api/auth/signin
Authenticate an existing user.

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
    "email": "user@example.com"
  },
  "token": "jwt-token-string"
}
```

#### Response 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /api/auth/signout
End the current user session.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Response 200 OK
```json
{
  "success": true,
  "message": "Successfully signed out"
}
```

## Protected User API

### GET /api/users/{user_id}
Retrieve user profile information.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **user_id** (string, required): The ID of the user to retrieve

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### Response 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### Response 403 Forbidden
```json
{
  "success": false,
  "error": "Access forbidden: Cannot access other user's data"
}
```

### PUT /api/users/{user_id}
Update user profile information.

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Path Parameters
- **user_id** (string, required): The ID of the user to update

#### Request
```json
{
  "email": "newemail@example.com"
}
```

#### Response 200 OK
```json
{
  "id": "uuid-string",
  "email": "newemail@example.com",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### Response 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### Response 403 Forbidden
```json
{
  "success": false,
  "error": "Access forbidden: Cannot update other user's data"
}
```

## JWT Token Validation

All protected endpoints require a valid JWT token in the Authorization header.

### Token Format
```
Authorization: Bearer <jwt-token>
```

### Token Claims
- **sub**: User ID
- **email**: User's email address
- **iat**: Token issued timestamp
- **exp**: Token expiration timestamp

### Error Responses
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Valid token but insufficient permissions for requested resource