---
name: backend-skill
description: Build backend systems. Covers route generation, request and response handling, and database connection.
---

# Backend Skill

## Instructions

### 1. Routes
- Define API routes
- Use REST based structure
- Separate routes by feature
- Use proper HTTP methods

### 2. Requests and responses
- Read request params and body
- Validate incoming data
- Send clear JSON responses
- Handle errors with status codes

### 3. Database connection
- Connect backend to database
- Use environment variables for credentials
- Reuse DB connection
- Handle connection errors

## Best Practices
- Keep controllers small
- Separate routes, controllers, and services
- Always handle errors
- Do not expose internal details in responses

## Example Structure

```js
// route
app.post("/users", createUser)

// controller
async function createUser(req, res) {
  const user = await db.user.create(req.body)
  res.status(201).json(user)
}

// db connection
connectDB(process.env.DATABASE_URL)
