<?php

namespace App\Http\Controllers;

use App\Models\EmployeeEvaluation;
use App\Models\EvaluationPeriod;
use App\Models\Employee;
use App\Models\EvaluationAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Display a listing of evaluations (for HR/Admin).
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $query = EmployeeEvaluation::with([
            'employee.user:id,name,email',
            'period:id,name,period_code,status',
            'reviewer:id,name,email'
        ]);

        // Filter by period
        if ($request->filled('period_id')) {
            $query->where('period_id', $request->period_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by employee
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $evaluations = $query->get()->map(function ($evaluation) {
            return [
                'id' => $evaluation->id,
                'employee_id' => $evaluation->employee_id,
                'employee_name' => $evaluation->employee ? 
                    $evaluation->employee->first_name . ' ' . $evaluation->employee->last_name : 'N/A',
                'employee_division' => $evaluation->employee->division ?? 'N/A',
                'period' => $evaluation->period,
                'status' => $evaluation->status,
                'total_score' => $evaluation->total_score,
                'grade' => $evaluation->grade,
                'submitted_at' => $evaluation->submitted_at?->format('Y-m-d H:i'),
                'reviewed_at' => $evaluation->reviewed_at?->format('Y-m-d H:i'),
                'reviewer' => $evaluation->reviewer,
            ];
        });

        // Get periods for filter
        $periods = EvaluationPeriod::select('id', 'name', 'period_code', 'status')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get employees for filter
        $employees = Employee::with('user:id,name')
            ->whereHas('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                ];
            });

        return Inertia::render('evaluations/Index', [
            'evaluations' => $evaluations,
            'periods' => $periods,
            'employees' => $employees,
            'filters' => [
                'period_id' => $request->period_id,
                'status' => $request->status,
                'employee_id' => $request->employee_id,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Display list of self-assessment periods for employee.
     */
    public function selfAssessmentList()
    {
        $user = Auth::user();
        
        // Get employee record
        $employee = Employee::where('user_id', $user->id)->first();
        
        // If no employee record, return empty list
        if (!$employee) {
            return Inertia::render('evaluations/SelfAssessmentList', [
                'evaluations' => [],
                'error' => 'Employee record not found. Please contact HR.',
            ]);
        }

        // Get active periods with evaluations
        $evaluations = EmployeeEvaluation::with('period')
            ->where('employee_id', $employee->id)
            ->whereHas('period', function ($query) {
                $query->whereIn('status', ['active', 'closed']);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($evaluation) {
                return [
                    'id' => $evaluation->id,
                    'period' => $evaluation->period,
                    'status' => $evaluation->status,
                    'total_score' => $evaluation->total_score,
                    'grade' => $evaluation->grade,
                    'submitted_at' => $evaluation->submitted_at?->format('Y-m-d H:i'),
                    'reviewed_at' => $evaluation->reviewed_at?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('evaluations/SelfAssessmentList', [
            'evaluations' => $evaluations,
        ]);
    }

    /**
     * Show self-assessment form for employee.
     */
    public function selfAssessmentForm(EvaluationPeriod $period)
    {
        $user = Auth::user();
        
        // Get employee record
        $employee = Employee::where('user_id', $user->id)->first();
        
        if (!$employee) {
            abort(404, 'Employee record not found.');
        }

        // Get evaluation for this employee and period
        $evaluation = EmployeeEvaluation::with(['answers.criteria' => function ($query) {
            $query->orderBy('order_index');
        }])
            ->where('employee_id', $employee->id)
            ->where('period_id', $period->id)
            ->first();

        if (!$evaluation) {
            abort(404, 'Evaluation not found.');
        }

        // Check if already reviewed (can't edit after reviewed)
        if ($evaluation->status === 'reviewed') {
            return redirect()->route('evaluations.show', $evaluation)
                ->with('info', 'This evaluation has already been reviewed and cannot be edited.');
        }

        return Inertia::render('evaluations/SelfAssessmentForm', [
            'evaluation' => [
                'id' => $evaluation->id,
                'status' => $evaluation->status,
                'period' => $period,
                'answers' => $evaluation->answers->map(function ($answer) {
                    return [
                        'id' => $answer->id,
                        'criteria' => $answer->criteria,
                        'self_score' => $answer->self_score,
                        'self_note' => $answer->self_note,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Submit self-assessment.
     */
    public function submitSelfAssessment(Request $request, EmployeeEvaluation $evaluation)
    {
        $user = Auth::user();
        
        // Verify this evaluation belongs to the authenticated employee
        $employee = Employee::where('user_id', $user->id)->first();
        
        if (!$employee || $evaluation->employee_id !== $employee->id) {
            abort(403, 'Unauthorized action.');
        }

        // Can't submit if already reviewed
        if ($evaluation->status === 'reviewed') {
            return back()->withErrors(['error' => 'This evaluation has already been reviewed.']);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.id' => 'required|exists:evaluation_answers,id',
            'answers.*.self_score' => 'nullable|integer|min:0|max:100',
            'answers.*.self_note' => 'nullable|string',
        ]);

        // Update each answer
        foreach ($validated['answers'] as $answerData) {
            $answer = EvaluationAnswer::find($answerData['id']);
            
            // Verify answer belongs to this evaluation
            if ($answer->employee_evaluation_id !== $evaluation->id) {
                continue;
            }

            $answer->update([
                'self_score' => $answerData['self_score'] ?? null,
                'self_note' => $answerData['self_note'] ?? null,
            ]);
        }

        // Update evaluation status to submitted
        $evaluation->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return redirect()->route('evaluations.self-assessment.list')
            ->with('success', 'Self-assessment submitted successfully.');
    }

    /**
     * Display the specified evaluation.
     */
    public function show(EmployeeEvaluation $evaluation)
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        // Check permissions
        $canView = false;
        if ($user->role_id == 1 || $user->role_id == 2) {
            $canView = true; // Admin/HR can view all
        } elseif ($employee && $evaluation->employee_id === $employee->id) {
            $canView = true; // Employee can view their own
        }

        if (!$canView) {
            abort(403, 'Unauthorized action.');
        }

        $evaluation->load([
            'employee.user:id,name,email',
            'period',
            'reviewer:id,name,email',
            'answers.criteria' => function ($query) {
                $query->orderBy('order_index');
            }
        ]);

        return Inertia::render('evaluations/Show', [
            'evaluation' => [
                'id' => $evaluation->id,
                'employee_name' => $evaluation->employee->first_name . ' ' . $evaluation->employee->last_name,
                'employee_division' => $evaluation->employee->division,
                'employee_position' => $evaluation->employee->position,
                'period' => $evaluation->period,
                'status' => $evaluation->status,
                'total_score' => $evaluation->total_score,
                'grade' => $evaluation->grade,
                'manager_feedback' => $evaluation->manager_feedback,
                'submitted_at' => $evaluation->submitted_at?->format('Y-m-d H:i'),
                'reviewed_at' => $evaluation->reviewed_at?->format('Y-m-d H:i'),
                'reviewer' => $evaluation->reviewer,
                'answers' => $evaluation->answers->map(function ($answer) {
                    return [
                        'id' => $answer->id,
                        'criteria' => $answer->criteria,
                        'self_score' => $answer->self_score,
                        'self_note' => $answer->self_note,
                        'hr_score' => $answer->hr_score,
                        'hr_feedback' => $answer->hr_feedback,
                    ];
                }),
            ],
            'canManage' => $user->role_id == 1 || $user->role_id == 2,
        ]);
    }

    /**
     * Get evaluation results for employee.
     */
    public function results()
    {
        $user = Auth::user();
        
        $employee = Employee::where('user_id', $user->id)->first();
        
        // If no employee record, return empty list
        if (!$employee) {
            return Inertia::render('evaluations/Results', [
                'evaluations' => [],
                'error' => 'Employee record not found. Please contact HR.',
            ]);
        }

        // Get all reviewed evaluations
        $evaluations = EmployeeEvaluation::with('period')
            ->where('employee_id', $employee->id)
            ->where('status', 'reviewed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($evaluation) {
                return [
                    'id' => $evaluation->id,
                    'period' => $evaluation->period,
                    'total_score' => $evaluation->total_score,
                    'grade' => $evaluation->grade,
                    'manager_feedback' => $evaluation->manager_feedback,
                    'reviewed_at' => $evaluation->reviewed_at?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('evaluations/Results', [
            'evaluations' => $evaluations,
        ]);
    }

    /**
     * Approve evaluation (HR/Admin review).
     */
    public function approveEvaluation(Request $request, EmployeeEvaluation $evaluation)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'manager_feedback' => 'required|string',
        ]);

        // Calculate total score from self_score only
        $evaluation->calculateTotalScore();

        // Update evaluation
        $evaluation->update([
            'status' => 'reviewed',
            'manager_feedback' => $validated['manager_feedback'],
            'reviewer_id' => $user->id,
            'reviewed_at' => now(),
        ]);

        return redirect()->route('evaluation-periods.show', $evaluation->period_id)
            ->with('success', 'Evaluasi berhasil disetujui.');
    }

    /**
     * Request revision for evaluation.
     */
    public function requestRevision(Request $request, EmployeeEvaluation $evaluation)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'manager_feedback' => 'required|string',
        ]);

        $evaluation->update([
            'status' => 'revision_requested',
            'manager_feedback' => $validated['manager_feedback'],
            'reviewer_id' => $user->id,
        ]);

        return redirect()->route('evaluation-periods.show', $evaluation->period_id)
            ->with('success', 'Revisi berhasil diminta. Karyawan akan menerima notifikasi.');
    }
}
