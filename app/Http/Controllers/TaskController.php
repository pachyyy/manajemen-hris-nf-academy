<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Start query
        $query = Task::with(['assignedTo:id,name,email', 'assignedBy:id,name,email']);

        // Filter by assigned user (only for Admin/HR)
        if ($user->role_id == 1 || $user->role_id == 2) {
            if ($request->filled('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }
        } else {
            // Staff can only see their assigned tasks
            $query->where('assigned_to', $user->id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by division (only for Admin/HR)
        if (($user->role_id == 1 || $user->role_id == 2) && $request->filled('division')) {
            $query->where('division', $request->division);
        }

        // Filter by deadline range
        if ($request->filled('deadline_from')) {
            $query->whereDate('deadline', '>=', $request->deadline_from);
        }
        if ($request->filled('deadline_to')) {
            $query->whereDate('deadline', '<=', $request->deadline_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        switch ($sortBy) {
            case 'deadline_nearest':
                $query->orderBy('deadline', 'asc');
                break;
            case 'priority_highest':
                // SQLite compatible sorting using CASE
                $query->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END");
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        $tasks = $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'division' => $task->division,
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

        // Get list of employees for filter dropdown
        $employees = Employee::with('user:id,name,email')
            ->whereHas('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->user_id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                    'division' => $employee->division,
                ];
            });

        $divisions = [
            ['value' => 'admin', 'label' => 'Admin'],
            ['value' => 'marketing', 'label' => 'Marketing'],
            ['value' => 'operasional', 'label' => 'Operasional'],
            ['value' => 'riset dan pengembangan', 'label' => 'Riset dan Pengembangan'],
        ];

        return Inertia::render('tasks/Index', [
            'tasks' => $tasks,
            'canManage' => $user->role_id == 1 || $user->role_id == 2,
            'employees' => $employees,
            'divisions' => $divisions,
            'filters' => [
                'status' => $request->status,
                'priority' => $request->priority,
                'assigned_to' => $request->assigned_to,
                'division' => $request->division,
                'deadline_from' => $request->deadline_from,
                'deadline_to' => $request->deadline_to,
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_order' => $request->get('sort_order', 'desc'),
            ],
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
                    'division' => $employee->division,
                    'position' => $employee->position,
                ];
            });

        $divisions = [
            ['value' => 'admin', 'label' => 'Admin'],
            ['value' => 'marketing', 'label' => 'Marketing'],
            ['value' => 'operasional', 'label' => 'Operasional'],
            ['value' => 'riset dan pengembangan', 'label' => 'Riset dan Pengembangan'],
        ];

        return Inertia::render('tasks/Create', [
            'staffUsers' => $employees,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'division' => 'required|string|in:admin,marketing,operasional,riset dan pengembangan',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'required|date|after_or_equal:today',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
        ]);

        $validated['assigned_by'] = Auth::id();

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('task-attachments', 'public');
        }

        $task = Task::create($validated);

        // Dispatch the event for notification
        event(new \App\Events\TaskAssigned($task));

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
                'division' => $task->division,
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
                    'division' => $employee->division,
                    'position' => $employee->position,
                ];
            });

        $divisions = [
            ['value' => 'admin', 'label' => 'Admin'],
            ['value' => 'marketing', 'label' => 'Marketing'],
            ['value' => 'operasional', 'label' => 'Operasional'],
            ['value' => 'riset dan pengembangan', 'label' => 'Riset dan Pengembangan'],
        ];

        return Inertia::render('tasks/Edit', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'division' => $task->division,
                'assigned_to' => $task->assigned_to,
                'assigned_by' => $task->assigned_by,
                'priority' => $task->priority,
                'deadline' => $task->deadline->format('Y-m-d'),
                'status' => $task->status,
                'attachment' => $task->attachment,
            ],
            'staffUsers' => $employees,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Update the specified task in storage.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'division' => 'nullable|string|in:admin,marketing,operasional,riset dan pengembangan',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'required|date|after_or_equal:today',
            'status' => 'required|in:belum,proses,selesai',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
        ]);

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
