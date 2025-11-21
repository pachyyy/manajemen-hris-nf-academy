<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Employee;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index()
    {
        $user = Auth::user();

        // Admin and HR can see all tasks
        if ($user->role_id == 1 || $user->role_id == 2) {
            $tasks = Task::with(['assignedTo:id,name,email', 'assignedBy:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'description' => $task->description,
                        'assigned_to' => $task->assigned_to,
                        'assigned_by' => $task->assigned_by,
                        'priority' => $task->priority,
                        'deadline' => $task->deadline->format('Y-m-d'),
                        'status' => $task->status,
                        'attachment' => $task->attachment,
                        'created_at' => $task->created_at,
                        'updated_at' => $task->updated_at,
                        'assigned_to_user' => $task->assignedTo,
                        'assigned_by_user' => $task->assignedBy,
                    ];
                });
        } else {
            // Staff can only see their assigned tasks
            $tasks = Task::with(['assignedTo:id,name,email', 'assignedBy:id,name,email'])
                ->where('assigned_to', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'description' => $task->description,
                        'assigned_to' => $task->assigned_to,
                        'assigned_by' => $task->assigned_by,
                        'priority' => $task->priority,
                        'deadline' => $task->deadline->format('Y-m-d'),
                        'status' => $task->status,
                        'attachment' => $task->attachment,
                        'created_at' => $task->created_at,
                        'updated_at' => $task->updated_at,
                        'assigned_to_user' => $task->assignedTo,
                        'assigned_by_user' => $task->assignedBy,
                    ];
                });
        }

        return Inertia::render('tasks/Index', [
            'tasks' => $tasks,
            'canManage' => $user->role_id == 1 || $user->role_id == 2,
        ]);
    }    /**
     * Show the form for creating a new task.
     */
    public function create()
    {
        // Get all employees with their user account
        $employees = Employee::with('user:id,name,email')
            ->whereHas('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->user_id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                    'email' => $employee->user->email ?? '',
                    'position' => $employee->position,
                ];
            });

        return Inertia::render('tasks/Create', [
            'staffUsers' => $employees,
        ]);
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();
        $validated['assigned_by'] = Auth::id();

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('task-attachments', 'public');
        }

        Task::create($validated);

        return redirect()->route('tasks.index')->with('success', 'Task created successfully.');
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task)
    {
        $user = Auth::user();

        // Check if user has permission to view this task
        if ($user->role_id != 1 && $user->role_id != 2 && $task->assigned_to != $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $task->load(['assignedTo:id,name,email', 'assignedBy:id,name,email']);

        return Inertia::render('tasks/Show', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'assigned_to' => $task->assigned_to,
                'assigned_by' => $task->assigned_by,
                'priority' => $task->priority,
                'deadline' => $task->deadline->format('Y-m-d'),
                'status' => $task->status,
                'attachment' => $task->attachment,
                'created_at' => $task->created_at,
                'assigned_to_user' => $task->assignedTo,
                'assigned_by_user' => $task->assignedBy,
            ],
            'canManage' => $user->role_id == 1 || $user->role_id == 2,
        ]);
    }    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task)
    {
        // Get all employees with their user account
        $employees = Employee::with('user:id,name,email')
            ->whereHas('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->user_id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                    'email' => $employee->user->email ?? '',
                    'position' => $employee->position,
                ];
            });

        return Inertia::render('tasks/Edit', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'assigned_to' => $task->assigned_to,
                'assigned_by' => $task->assigned_by,
                'priority' => $task->priority,
                'deadline' => $task->deadline->format('Y-m-d'),
                'status' => $task->status,
                'attachment' => $task->attachment,
            ],
            'staffUsers' => $employees,
        ]);
    }

    /**
     * Update the specified task in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $validated = $request->validated();

        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($task->attachment) {
                Storage::disk('public')->delete($task->attachment);
            }
            $validated['attachment'] = $request->file('attachment')->store('task-attachments', 'public');
        }

        $task->update($validated);

        return redirect()->route('tasks.index')->with('success', 'Task updated successfully.');
    }

    /**
     * Update task status (for staff).
     */
    public function updateStatus(Request $request, Task $task)
    {
        $user = Auth::user();

        // Check if user is assigned to this task
        if ($task->assigned_to != $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:belum,proses,selesai',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($task->attachment) {
                Storage::disk('public')->delete($task->attachment);
            }
            $validated['attachment'] = $request->file('attachment')->store('task-attachments', 'public');
        }

        $task->update($validated);

        return redirect()->route('tasks.show', $task)->with('success', 'Task status updated successfully.');
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Task $task)
    {
        // Delete attachment if exists
        if ($task->attachment) {
            Storage::disk('public')->delete($task->attachment);
        }

        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully.');
    }

    /**
     * Get tasks data for API.
     */
    public function getTasksData()
    {
        $user = Auth::user();

        if ($user->role_id == 1 || $user->role_id == 2) {
            $tasks = Task::with(['assignedTo', 'assignedBy'])->orderBy('created_at', 'desc')->get();
        } else {
            $tasks = Task::with(['assignedTo', 'assignedBy'])
                ->where('assigned_to', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($tasks);
    }
}
