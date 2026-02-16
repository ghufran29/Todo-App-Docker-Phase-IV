---
name: auth-skill
description: Implement secure authentication flows for web apps. Covers signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication Skill

## Instructions

### 1. Core flows
- User signup with input validation
- User signin using email and password
- Logout handling
- Session management

### 2. Password security
- Hash passwords before saving
- Use salt with hashing
- Never store plain text passwords

### 3. JWT handling
- Generate JWT after successful signin
- Set token expiry time
- Verify JWT on protected routes

### 4. Better Auth integration
- Configure Better Auth provider
- Connect database adapter
- Use built in session helpers
- Protect routes with auth middleware

## Best Practices
- Validate input on both client and server
- Use HTTPS for all authentication routes
- Keep token expiry short
- Do not expose detailed auth errors

## Example Structure

```js
// signup
const hashedPassword = await hash(password)
await db.user.create({
  email,
  password: hashedPassword
})

// signin
const isValid = await compare(password, user.password)
if (isValid) {
  const token = signJwt({ userId: user.id })
}

// protected route
verifyJwt(token)
