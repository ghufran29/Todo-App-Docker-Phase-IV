# MCP Tool Contracts: Task Tools

**Branch**: `005-mcp-task-tools` | **Date**: 2026-02-11

## Standard Response Envelope

All tools return JSON matching this schema:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

---

## Tool: add_task

**Description**: Create a new task for a user.

**Input Schema**:

| Parameter   | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| user_id     | string | yes      | UUID of the task owner         |
| title       | string | yes      | Task title (1-200 chars)       |
| description | string | no       | Task description (max 1000)    |

**Success Response** (`data` field):

```json
{
  "id": "uuid-string",
  "user_id": "uuid-string",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "priority": "medium",
  "created_at": "2026-02-11T12:00:00",
  "updated_at": "2026-02-11T12:00:00"
}
```

**Error Cases**:

| Code             | Condition                        |
|------------------|----------------------------------|
| MISSING_USER_ID  | user_id not provided or empty    |
| MISSING_TITLE    | title not provided or empty      |
| INVALID_USER_ID  | user_id not a valid UUID         |
| VALIDATION_ERROR | title exceeds 200 characters     |
| DB_ERROR         | database operation failed        |

---

## Tool: list_tasks

**Description**: List all tasks belonging to a user.

**Input Schema**:

| Parameter | Type   | Required | Description            |
|-----------|--------|----------|------------------------|
| user_id   | string | yes      | UUID of the task owner |

**Success Response** (`data` field):

```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "priority": "medium",
      "due_date": null,
      "completed_at": null,
      "created_at": "2026-02-11T12:00:00",
      "updated_at": "2026-02-11T12:00:00"
    }
  ],
  "count": 1
}
```

**Error Cases**:

| Code            | Condition                     |
|-----------------|-------------------------------|
| MISSING_USER_ID | user_id not provided or empty |
| INVALID_USER_ID | user_id not a valid UUID      |
| DB_ERROR        | database operation failed     |

---

## Tool: update_task

**Description**: Update an existing task's fields.

**Input Schema**:

| Parameter   | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| user_id     | string | yes      | UUID of the task owner             |
| task_id     | string | yes      | UUID of the task to update         |
| title       | string | no       | New title (1-200 chars)            |
| description | string | no       | New description (max 1000)         |
| status      | string | no       | New status (pending/in_progress/completed) |
| priority    | string | no       | New priority (low/medium/high/urgent) |

At least one of `title`, `description`, `status`, or `priority` MUST
be provided.

**Success Response** (`data` field):

```json
{
  "id": "uuid-string",
  "user_id": "uuid-string",
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "due_date": null,
  "completed_at": null,
  "created_at": "2026-02-11T12:00:00",
  "updated_at": "2026-02-11T12:30:00"
}
```

**Error Cases**:

| Code                | Condition                              |
|---------------------|----------------------------------------|
| MISSING_USER_ID     | user_id not provided or empty          |
| INVALID_USER_ID     | user_id not a valid UUID               |
| INVALID_TASK_ID     | task_id not a valid UUID               |
| TASK_NOT_FOUND      | task doesn't exist or wrong user       |
| NO_FIELDS_TO_UPDATE | no update fields provided              |
| VALIDATION_ERROR    | field value fails validation           |
| DB_ERROR            | database operation failed              |

---

## Tool: complete_task

**Description**: Mark a task as completed.

**Input Schema**:

| Parameter | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| user_id   | string | yes      | UUID of the task owner     |
| task_id   | string | yes      | UUID of the task to complete |

**Success Response** (`data` field):

```json
{
  "id": "uuid-string",
  "user_id": "uuid-string",
  "title": "Buy groceries",
  "status": "completed",
  "completed_at": "2026-02-11T13:00:00",
  "updated_at": "2026-02-11T13:00:00"
}
```

**Error Cases**:

| Code            | Condition                          |
|-----------------|------------------------------------|
| MISSING_USER_ID | user_id not provided or empty      |
| INVALID_USER_ID | user_id not a valid UUID           |
| INVALID_TASK_ID | task_id not a valid UUID           |
| TASK_NOT_FOUND  | task doesn't exist or wrong user   |
| DB_ERROR        | database operation failed          |

---

## Tool: delete_task

**Description**: Permanently delete a task.

**Input Schema**:

| Parameter | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| user_id   | string | yes      | UUID of the task owner     |
| task_id   | string | yes      | UUID of the task to delete |

**Success Response** (`data` field):

```json
{
  "task_id": "uuid-string",
  "deleted": true
}
```

**Error Cases**:

| Code            | Condition                          |
|-----------------|------------------------------------|
| MISSING_USER_ID | user_id not provided or empty      |
| INVALID_USER_ID | user_id not a valid UUID           |
| INVALID_TASK_ID | task_id not a valid UUID           |
| TASK_NOT_FOUND  | task doesn't exist or wrong user   |
| DB_ERROR        | database operation failed          |
