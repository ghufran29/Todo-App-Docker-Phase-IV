# Data Model: MCP Server and Task Tools Layer

**Branch**: `005-mcp-task-tools` | **Date**: 2026-02-11

## Existing Entities (No Changes Required)

### Task (existing — `backend/src/models/task.py`)

The existing `Task` model fully satisfies the spec requirements.
No schema changes needed.

| Field         | Type              | Constraints              |
|---------------|-------------------|--------------------------|
| id            | UUID              | PK, auto-generated       |
| user_id       | UUID              | FK → user.id, NOT NULL, indexed |
| title         | str               | NOT NULL, max 200, min 1 |
| description   | Optional[str]     | max 1000                 |
| status        | TaskStatus enum   | pending / in_progress / completed |
| priority      | TaskPriority enum | low / medium / high / urgent |
| due_date      | Optional[datetime]| nullable                 |
| completed_at  | Optional[datetime]| nullable                 |
| created_at    | datetime          | auto-set                 |
| updated_at    | datetime          | auto-set                 |

### User (existing — `backend/src/models/user.py`)

Referenced for `user_id` validation. No changes needed.

| Field           | Type            | Constraints        |
|-----------------|-----------------|--------------------|
| id              | UUID            | PK, auto-generated |
| email           | str             | UNIQUE, NOT NULL   |
| hashed_password | str             | NOT NULL           |
| is_active       | bool            | default True       |
| email_verified  | bool            | default False      |
| role            | UserRole enum   | user / admin       |
| created_at      | datetime        | auto-set           |
| updated_at      | datetime        | auto-set           |

## New Entities (MCP Layer Only — Not DB Tables)

### ToolResponse (Python dict, not a DB model)

Standardized response envelope for all MCP tool invocations.

```python
{
    "success": bool,
    "data": dict | list | None,
    "error": {
        "code": str,    # e.g. "MISSING_USER_ID", "TASK_NOT_FOUND"
        "message": str  # human-readable error description
    } | None
}
```

### Error Codes

| Code                | When Used                                  |
|---------------------|--------------------------------------------|
| MISSING_USER_ID     | user_id parameter absent or empty          |
| MISSING_TITLE       | title parameter absent for add_task        |
| INVALID_USER_ID     | user_id is not a valid UUID                |
| INVALID_TASK_ID     | task_id is not a valid UUID                |
| TASK_NOT_FOUND      | task doesn't exist or doesn't belong to user |
| NO_FIELDS_TO_UPDATE | update_task called with no update fields   |
| VALIDATION_ERROR    | input fails validation (e.g., title too long) |
| DB_ERROR            | database operation failed                  |

## State Transitions

```text
Task.status:
  pending ──→ in_progress ──→ completed
  pending ──────────────────→ completed  (via complete_task)
```

- `add_task` creates with status = "pending"
- `update_task` can set any valid status
- `complete_task` sets status = "completed" and records `completed_at`
- `delete_task` removes the record entirely

## Relationships

```text
User (1) ──→ (N) Task
  └── user_id (FK, indexed, CASCADE delete)
```

No new relationships introduced. MCP tools query the existing
Task table filtered by user_id.
