---
name: database-skill
description: Design and manage databases. Covers table creation, migrations, and schema design.
---

# Database Skill

## Instructions

### 1. Table creation
- Define tables based on app requirements
- Choose correct data types
- Set primary keys
- Add foreign key relationships

### 2. Schema design
- Normalize data to reduce duplication
- Use clear and consistent naming
- Plan one to one, one to many, and many to many relations
- Add indexes for frequent queries

### 3. Migrations
- Create migration files for schema changes
- Apply migrations in order
- Roll back migrations when needed
- Keep migrations small and focused

## Best Practices
- Design schema before writing code
- Avoid unnecessary columns
- Use constraints to enforce data rules
- Keep schema readable and documented

## Example Structure

```sql
-- create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migration example
ALTER TABLE users
ADD COLUMN is_active BOOLEAN DEFAULT true;
