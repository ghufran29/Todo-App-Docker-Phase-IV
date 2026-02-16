# Data Model: Authentication and User Identity

## User Entity

### Attributes
- **id** (UUID/string): Unique identifier for the user
- **email** (string): User's email address (unique, required)
- **hashed_password** (string): BCrypt or similar hashed password
- **created_at** (datetime): Account creation timestamp
- **updated_at** (datetime): Last account update timestamp
- **is_active** (boolean): Whether the account is active/enabled
- **email_verified** (boolean): Whether the email has been verified

### Relationships
- User has many tasks (one-to-many)
- User has many sessions (one-to-many, for audit trails)

### Validation Rules
- Email must be in valid email format
- Email must be unique across all users
- Password must meet minimum strength requirements
- Email verification required before full account activation

## JWT Token

### Claims
- **sub** (subject): User ID
- **iat** (issued at): Token creation timestamp
- **exp** (expiration): Token expiration timestamp
- **email**: User's email address
- **role**: User role (default: user)

### Properties
- **Header**: Contains algorithm information (HS256)
- **Secret**: Stored in environment variable (BETTER_AUTH_SECRET)
- **Expiration**: Configured TTL (recommended: 15-60 minutes)

## Session Log (Optional for audit)

### Attributes
- **id** (UUID/string): Unique session identifier
- **user_id** (UUID/string): Reference to the user
- **token_id** (string): Identifier for the JWT token (if tracking)
- **login_time** (datetime): Session creation time
- **logout_time** (datetime): Session end time (null if active)
- **ip_address** (string): IP address of the session
- **user_agent** (string): Browser/device information

## Protected Resources Access

### Access Control Rules
- User can only access resources where user_id matches their authenticated ID
- Requests with invalid tokens are rejected with 401
- Requests with valid tokens but wrong user IDs are rejected with 403
- Admin users (if implemented) can access user data with special permissions

### Data Isolation Requirements
- Database queries must filter by authenticated user ID
- Business logic must verify user ownership before data operations
- API responses must only contain authorized user's data