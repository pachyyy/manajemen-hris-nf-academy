<?php

namespace App\Http\Controllers;

use App\Models\EvaluationPeriod;
use App\Models\EvaluationCriteria;
use App\Models\EmployeeEvaluation;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationPeriodController extends Controller
{
    /**
     * Display a listing of evaluation periods.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Only Admin and HR can access
        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $query = EvaluationPeriod::with('creator:id,name,email');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by period type
        if ($request->filled('period_type')) {
            $query->where('period_type', $request->period_type);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $periods = $query->get()->map(function ($period) {
            return [
                'id' => $period->id,
                'name' => $period->name,
                'period_code' => $period->period_code,
                'period_type' => $period->period_type,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
                'self_assessment_deadline' => $period->self_assessment_deadline?->format('Y-m-d'),
                'hr_evaluation_deadline' => $period->hr_evaluation_deadline?->format('Y-m-d'),
                'status' => $period->status,
                'created_by' => $period->created_by,
                'creator' => $period->creator,
                'created_at' => $period->created_at,
            ];
        });

        return Inertia::render('evaluations/PeriodIndex', [
            'periods' => $periods,
            'filters' => [
                'status' => $request->status,
                'period_type' => $request->period_type,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Show the unified form for creating period with criteria.
     */
    public function createUnified()
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        // Get default criteria templates (those without period_id)
        $defaultCriteria = EvaluationCriteria::whereNull('period_id')
            ->where('is_default', true)
            ->orderBy('order_index')
            ->get(['id', 'title', 'description', 'type', 'order_index', 'is_default']);

        return Inertia::render('evaluations/CreatePenilaianKerja', [
            'defaultCriteria' => $defaultCriteria,
        ]);
    }

    /**
     * Store a newly created period with criteria in one go.
     */
    public function storeWithCriteria(Request $request)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'period_code' => 'required|string|max:255|unique:evaluation_periods,period_code',
            'period_type' => 'required|in:monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'self_assessment_deadline' => 'nullable|date|after_or_equal:start_date',
            'hr_evaluation_deadline' => 'nullable|date|after_or_equal:self_assessment_deadline',
            'description' => 'nullable|string',
            'guidelines' => 'nullable|string',
            'auto_create_evaluations' => 'nullable|boolean',
            'indicators' => 'required|array|min:1',
            'indicators.*.title' => 'required|string|max:255',
            'indicators.*.description' => 'nullable|string',
            'indicators.*.order_index' => 'required|integer',
        ]);

        $validated['created_by'] = $user->id;
        $validated['status'] = 'draft';

        // Create period
        $period = EvaluationPeriod::create([
            'name' => $validated['name'],
            'period_code' => $validated['period_code'],
            'period_type' => $validated['period_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'self_assessment_deadline' => $validated['self_assessment_deadline'] ?? null,
            'hr_evaluation_deadline' => $validated['hr_evaluation_deadline'] ?? null,
            'description' => $validated['description'] ?? null,
            'guidelines' => $validated['guidelines'] ?? null,
            'status' => 'draft',
            'created_by' => $user->id,
        ]);

        // Create criteria
        foreach ($validated['indicators'] as $indicator) {
            $period->criteria()->create([
                'title' => $indicator['title'],
                'description' => $indicator['description'] ?? null,
                'type' => 'rating',
                'is_default' => false,
                'order_index' => $indicator['order_index'],
            ]);
        }

        // Refresh criteria relationship
        $period->load('criteria');

        // Auto-open period and create evaluations
        $period->update(['status' => 'active']);

        // Check if auto_create_evaluations is enabled (default true)
        $autoCreate = $validated['auto_create_evaluations'] ?? true;

        if ($autoCreate) {
            $employees = Employee::all();
            foreach ($employees as $employee) {
                $evaluation = EmployeeEvaluation::create([
                    'employee_id' => $employee->id,
                    'period_id' => $period->id,
                    'status' => 'pending',
                ]);

                foreach ($period->criteria as $criteria) {
                    $evaluation->answers()->create([
                        'criteria_id' => $criteria->id,
                    ]);
                }
            }
        }

        return redirect()->route('evaluation-periods.index')
            ->with('success', 'Rencana penilaian kerja berhasil dibuat dan diaktifkan!');
    }

    /**
     * Store a newly created period.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'period_code' => 'required|string|max:255|unique:evaluation_periods,period_code',
            'period_type' => 'required|in:monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'self_assessment_deadline' => 'nullable|date|after_or_equal:start_date',
            'hr_evaluation_deadline' => 'nullable|date|after_or_equal:self_assessment_deadline',
            'description' => 'nullable|string',
            'guidelines' => 'nullable|string',
        ]);

        $validated['created_by'] = $user->id;
        $validated['status'] = 'draft';

        $period = EvaluationPeriod::create($validated);

        return redirect()->route('evaluation-periods.show', $period)->with('success', 'Evaluation period created successfully.');
    }

    /**
     * Display the specified period.
     */
    public function show(EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $period->load(['creator:id,name,email', 'criteria' => function ($query) {
            $query->orderBy('order_index');
        }]);

        // Get evaluation statistics
        $totalEmployees = Employee::count();
        $evaluationStats = [
            'total' => EmployeeEvaluation::where('period_id', $period->id)->count(),
            'pending' => EmployeeEvaluation::where('period_id', $period->id)->where('status', 'pending')->count(),
            'submitted' => EmployeeEvaluation::where('period_id', $period->id)->where('status', 'submitted')->count(),
            'reviewed' => EmployeeEvaluation::where('period_id', $period->id)->where('status', 'reviewed')->count(),
        ];

        // Get all evaluations for this period
        $evaluations = EmployeeEvaluation::with(['employee', 'reviewer:id,name'])
            ->where('period_id', $period->id)
            ->orderBy('status', 'desc')
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($evaluation) {
                return [
                    'id' => $evaluation->id,
                    'employee_id' => $evaluation->employee_id,
                    'employee_name' => $evaluation->employee 
                        ? $evaluation->employee->first_name . ' ' . $evaluation->employee->last_name
                        : 'N/A',
                    'employee_position' => $evaluation->employee->position ?? 'N/A',
                    'employee_division' => $evaluation->employee->division ?? 'N/A',
                    'status' => $evaluation->status,
                    'total_score' => $evaluation->total_score,
                    'grade' => $evaluation->grade,
                    'reviewer_name' => $evaluation->reviewer->name ?? null,
                    'reviewed_at' => $evaluation->reviewed_at?->format('Y-m-d H:i'),
                    'submitted_at' => $evaluation->submitted_at?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('evaluations/PeriodDetail', [
            'period' => [
                'id' => $period->id,
                'name' => $period->name,
                'period_code' => $period->period_code,
                'period_type' => $period->period_type,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
                'self_assessment_deadline' => $period->self_assessment_deadline?->format('Y-m-d'),
                'hr_evaluation_deadline' => $period->hr_evaluation_deadline?->format('Y-m-d'),
                'description' => $period->description,
                'guidelines' => $period->guidelines,
                'status' => $period->status,
                'created_by' => $period->created_by,
                'creator' => $period->creator,
                'criteria' => $period->criteria,
                'created_at' => $period->created_at,
            ],
            'totalEmployees' => $totalEmployees,
            'evaluationStats' => $evaluationStats,
            'evaluations' => $evaluations,
        ]);
    }

    /**
     * Update the specified period.
     */
    public function update(Request $request, EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        // Can only edit draft periods
        if ($period->status !== 'draft') {
            return back()->withErrors(['error' => 'Can only edit draft periods.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'period_code' => 'required|string|max:255|unique:evaluation_periods,period_code,' . $period->id,
            'period_type' => 'required|in:monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'self_assessment_deadline' => 'nullable|date|after_or_equal:start_date',
            'hr_evaluation_deadline' => 'nullable|date|after_or_equal:self_assessment_deadline',
            'description' => 'nullable|string',
            'guidelines' => 'nullable|string',
        ]);

        $period->update($validated);

        return back()->with('success', 'Evaluation period updated successfully.');
    }

    /**
     * Remove the specified period.
     */
    public function destroy(EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        // Can only delete draft periods
        if ($period->status !== 'draft') {
            return back()->withErrors(['error' => 'Can only delete draft periods.']);
        }

        $period->delete();

        return redirect()->route('evaluation-periods.index')->with('success', 'Evaluation period deleted successfully.');
    }

    /**
     * Open the period (change status to active and create evaluations).
     */
    public function open(EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        if ($period->status !== 'draft') {
            return back()->withErrors(['error' => 'Period must be in draft status to open.']);
        }

        // Check if criteria exist
        if ($period->criteria()->count() === 0) {
            return back()->withErrors(['error' => 'Please add evaluation criteria before opening the period.']);
        }

        // Update period status to active
        $period->update(['status' => 'active']);

        // Create evaluations for all employees
        $employees = Employee::all();
        foreach ($employees as $employee) {
            $evaluation = EmployeeEvaluation::create([
                'employee_id' => $employee->id,
                'period_id' => $period->id,
                'status' => 'pending',
            ]);

            // Create answer placeholders for each criteria
            foreach ($period->criteria as $criteria) {
                $evaluation->answers()->create([
                    'criteria_id' => $criteria->id,
                ]);
            }
        }

        return back()->with('success', 'Period opened successfully. Evaluations created for all employees.');
    }

    /**
     * Close the period (change status to closed).
     */
    public function close(EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        if ($period->status !== 'active') {
            return back()->withErrors(['error' => 'Period must be active to close.']);
        }

        $period->update(['status' => 'closed']);

        return back()->with('success', 'Period closed successfully.');
    }
}
