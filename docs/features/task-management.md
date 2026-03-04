# Task Management

A comprehensive task management system with database persistence, tags, comments, and activity logging.

## Features

- **Full CRUD Operations** - Create, read, update, and delete tasks
- **Task Properties** - Title, description, status, priority, due date, assignee
- **Tags** - Categorize tasks with color-coded tags
- **Comments** - Add comments to tasks for collaboration
- **Activity Logging** - Track all task changes with detailed audit trail
- **Bulk Operations** - Update status or delete multiple tasks at once
- **Filtering & Sorting** - Search and filter by status, priority, assignee

## Database Schema

```prisma
model Task {
  id         String        @id @default(cuid())
  title      String
  description String?
  status     TaskStatus    @default(TODO)
  priority   TaskPriority  @default(MEDIUM)
  dueDate    DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  assigneeId String?
  assignee   User?         @relation("TaskAssignee")
  createdById String
  createdBy  User          @relation("TaskCreator")

  tags       TaskTaskTag[]
  comments   TaskComment[]
  attachments TaskAttachment[]
  activities TaskActivity[]
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  ARCHIVED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/tasks` | GET | List tasks with pagination |
| `/api/tasks` | POST | Create a new task |
| `/api/tasks/[id]` | GET | Get a single task |
| `/api/tasks/[id]` | PATCH | Update a task |
| `/api/tasks/[id]` | DELETE | Delete a task |
| `/api/tasks/stats` | GET | Get task statistics |
| `/api/tasks/tags` | GET | Get all available tags |
| `/api/tasks/users` | GET | Get assignable users |
| `/api/tasks/bulk/status` | POST | Bulk update status |
| `/api/tasks/bulk/delete` | POST | Bulk delete tasks |
| `/api/tasks/[id]/comments` | GET | Get task comments |
| `/api/tasks/[id]/comments` | POST | Add a comment |
| `/api/tasks/[id]/activity` | GET | Get task activity log |

## Usage Examples

### Creating a Task

```typescript
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Implement new feature',
    description: 'Add the new feature to the product',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-03-15',
    assigneeId: 'user-id-or-null',
    tagIds: ['tag-id-1', 'tag-id-2'],
  }),
});
```

### Fetching Tasks with Filters

```typescript
const response = await fetch('/api/tasks?page=1&pageSize=20&status=TODO&priority=HIGH');
const data = await response.json();
// Returns: { items: Task[], total: number, page: number, pageSize: number, totalPages: number }
```

### Updating a Task

```typescript
const response = await fetch(`/api/tasks/${taskId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'IN_PROGRESS',
    priority: 'URGENT',
  }),
});
```

### Bulk Status Update

```typescript
const response = await fetch('/api/tasks/bulk/status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskIds: ['task-id-1', 'task-id-2'],
    status: 'DONE',
  }),
});
```

## Component Usage

```tsx
import { TaskDialog } from '@/components/admin/task-dialog';
import { TasksDataTable } from '@/components/admin/tasks-data-table';

function TasksPage() {
  const [createDialog, setCreateDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setCreateDialog(true)}>New Task</Button>
      <TasksDataTable tasks={tasks} onRefresh={handleRefresh} />

      <TaskDialog
        open={createDialog}
        onOpenChange={setCreateDialog}
        mode="create"
        onSuccess={handleRefresh}
      />
    </>
  );
}
```

## Status Workflow

```
TODO → IN_PROGRESS → REVIEW → DONE
                    ↓
                 ARCHIVED
```

## Priority Levels

| Priority | Description | Color |
|----------|-------------|-------|
| LOW | Nice to have | Blue |
| MEDIUM | Standard priority | Yellow |
| HIGH | Important | Orange |
| URGENT | Critical | Red |

## Permissions Required

All task operations require authentication. The following permissions are checked:

| Operation | Permission |
|-----------|------------|
| View tasks | `TASK_READ` |
| Create tasks | `TASK_CREATE` |
| Edit tasks | `TASK_UPDATE` |
| Delete tasks | `TASK_DELETE` |
| Assign tasks | `TASK_ASSIGN` |
| Manage tags | `TASK_TAG_MANAGE` |

## Activity Logging

All task changes are automatically logged with:

- **CREATED** - New task created
- **UPDATED** - Task modified (generic)
- **STATUS_CHANGED** - Task status updated (with from/to values)
- **PRIORITY_CHANGED** - Task priority updated (with from/to values)
- **ASSIGNED** - Task assigned to user
- **UNASSIGNED** - Task unassigned from user
- **DUE_DATE_CHANGED** - Due date modified
- **COMMENT_ADDED** - New comment added
- **DELETED** - Task deleted
