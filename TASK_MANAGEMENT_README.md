# Task Management Feature - Documentation

## Overview

The Task Management feature allows Admin and HR users to assign tasks to staff members, track their progress, and manage deadlines.

## Features Implemented

### 1. Role-Based Access Control

- **Admin & HR:**
    - Create new tasks
    - Edit existing tasks
    - Delete tasks
    - View all tasks in the system
    - Assign tasks to any staff member

- **Staff:**
    - View only tasks assigned to them
    - Update task status (Belum Mulai → Proses → Selesai)
    - Upload attachments as proof of task completion

### 2. Task Properties

Each task has the following properties:

- **Title**: Short description of the task
- **Description**: Detailed explanation of what needs to be done
- **Assigned To**: User who needs to complete the task
- **Assigned By**: User who created the task (auto-filled)
- **Priority**: Low, Medium, or High
- **Deadline**: Date by which the task should be completed
- **Status**: Belum Mulai (Not Started), Proses (In Progress), Selesai (Completed)
- **Attachment**: Optional file attachment (PDF, DOC, DOCX, JPG, JPEG, PNG - Max 5MB)

### 3. Pages Created

#### Task List (`/tasks` or `/penugasan`)

- Shows a table of all tasks (filtered by role)
- Displays: Title, Assigned To, Priority, Status, Deadline
- Actions: View Details, Edit (Admin/HR only), Delete (Admin/HR only)
- Create Task button (Admin/HR only)

#### Create Task (`/tasks/create`)

- Form to create a new task
- Fields: Title, Description, Assign To, Priority, Deadline, Attachment
- Only accessible by Admin and HR

#### Edit Task (`/tasks/{id}/edit`)

- Form to edit an existing task
- Can update all task properties including status
- Only accessible by Admin and HR

#### Task Details (`/tasks/{id}`)

- Shows complete task information
- Displays assigned user details, deadline, and attachment (if any)
- Staff members can update status and upload proof of completion
- Edit button for Admin/HR

### 4. Backend Components

#### Database Migration

- `2025_11_21_063610_create_tasks_table.php`
- Creates `tasks` table with all required fields

#### Model

- `App\Models\Task`
- Relationships: `assignedTo()`, `assignedBy()`

#### Controller

- `App\Http\Controllers\TaskController`
- Methods: index, create, store, show, edit, update, updateStatus, destroy, getTasksData

#### Request Validation

- `App\Http\Requests\StoreTaskRequest`
- `App\Http\Requests\UpdateTaskRequest`
- Validates all task inputs with custom error messages

#### Middleware

- `App\Http\Middleware\IsHrOrAdmin`
- Protects routes that should only be accessible by Admin or HR

### 5. Frontend Components

#### React/Inertia Pages

- `resources/js/pages/tasks/Index.tsx` - Task list page
- `resources/js/pages/tasks/Create.tsx` - Create task form
- `resources/js/pages/tasks/Edit.tsx` - Edit task form
- `resources/js/pages/tasks/Show.tsx` - Task details page

All pages use existing UI components from the project (shadcn/ui):

- Button, Card, Table, Badge, Input, Textarea, Select, Label

### 6. Routes

#### Web Routes

```php
GET  /penugasan                   → Task list
GET  /tasks                       → Task list
GET  /tasks/create                → Create form (Admin/HR only)
POST /tasks                       → Store task (Admin/HR only)
GET  /tasks/{task}                → Task details
GET  /tasks/{task}/edit           → Edit form (Admin/HR only)
PUT  /tasks/{task}                → Update task (Admin/HR only)
PATCH /tasks/{task}/status        → Update status (Assigned staff only)
DELETE /tasks/{task}              → Delete task (Admin/HR only)
```

#### API Route

```php
GET /api/tasks → Get tasks data (JSON)
```

## Installation & Usage

### 1. Database Setup

The migration has already been run. The `tasks` table is created in your database.

### 2. Access the Feature

- Navigate to `/penugasan` or `/tasks` in your application
- Admin and HR will see all tasks with a "Create Task" button
- Staff will see only their assigned tasks

### 3. Creating a Task (Admin/HR)

1. Click "Create Task" button
2. Fill in all required fields:
    - Task Title
    - Description
    - Assign To (select a user)
    - Priority (Low/Medium/High)
    - Deadline
    - Optional: Upload an attachment
3. Click "Create Task"

### 4. Updating Task Status (Staff)

1. Click on a task to view details
2. Click "Update Status" button
3. Select new status from dropdown
4. Optional: Upload proof of completion
5. Click "Update Status"

### 5. Editing a Task (Admin/HR)

1. Click on a task to view details
2. Click "Edit Task" button
3. Modify any fields as needed
4. Click "Update Task"

### 6. Deleting a Task (Admin/HR)

1. From the task list, click the three-dot menu icon
2. Select "Delete"
3. Confirm deletion in the modal

## File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   └── TaskController.php
│   ├── Middleware/
│   │   └── IsHrOrAdmin.php
│   └── Requests/
│       ├── StoreTaskRequest.php
│       └── UpdateTaskRequest.php
├── Models/
│   └── Task.php
database/
└── migrations/
    └── 2025_11_21_063610_create_tasks_table.php
resources/
└── js/
    └── pages/
        └── tasks/
            ├── Index.tsx
            ├── Create.tsx
            ├── Edit.tsx
            └── Show.tsx
routes/
├── web.php (task routes added)
└── api.php (task API route added)
```

## Future Enhancements (Version 2)

The system is designed to be modular and ready for upgrades:

1. **Approval Workflow**: Require HR approval before marking tasks as complete
2. **Notifications**: Email/push notifications for new tasks, deadlines, and status updates
3. **Dashboard & Analytics**: Graphical visualization of task completion rates, overdue tasks
4. **Comments System**: Allow discussion threads on tasks
5. **Task Templates**: Pre-defined task templates for common assignments
6. **Recurring Tasks**: Support for repeating tasks
7. **Task Categories**: Organize tasks by department or category
8. **Time Tracking**: Track time spent on tasks
9. **Subtasks**: Break down large tasks into smaller subtasks
10. **File Gallery**: Multiple file attachments per task

## Notes

- All function names and variables are in English as requested
- The UI design matches the existing application style
- Role-based permissions are enforced at both middleware and controller levels
- File uploads are validated for type and size (max 5MB)
- Attachments are stored in `storage/app/public/task-attachments/`
- The feature integrates seamlessly with existing authentication and role systems
