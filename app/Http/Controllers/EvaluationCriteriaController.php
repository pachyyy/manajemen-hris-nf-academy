<?php

namespace App\Http\Controllers;

use App\Models\EvaluationPeriod;
use App\Models\EvaluationCriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvaluationCriteriaController extends Controller
{
    /**
     * Display a listing of criteria for a period.
     */
    public function index(EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        $criteria = $period->criteria()->orderBy('order_index')->get();

        return response()->json($criteria);
    }

    /**
     * Store a newly created criteria.
     */
    public function store(Request $request, EvaluationPeriod $period)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        // Can only add criteria to draft periods
        if ($period->status !== 'draft') {
            return response()->json(['error' => 'Can only add criteria to draft periods.'], 400);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:rating,text',
            'is_default' => 'boolean',
            'order_index' => 'required|integer|min:0',
        ]);

        $validated['period_id'] = $period->id;

        $criteria = EvaluationCriteria::create($validated);

        return response()->json($criteria, 201);
    }

    /**
     * Update the specified criteria.
     */
    public function update(Request $request, EvaluationPeriod $period, EvaluationCriteria $criteria)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        // Verify criteria belongs to period
        if ($criteria->period_id !== $period->id) {
            abort(404);
        }

        // Can only edit criteria in draft periods
        if ($period->status !== 'draft') {
            return response()->json(['error' => 'Can only edit criteria in draft periods.'], 400);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:rating,text',
            'is_default' => 'boolean',
            'order_index' => 'required|integer|min:0',
        ]);

        $criteria->update($validated);

        return response()->json($criteria);
    }

    /**
     * Remove the specified criteria.
     */
    public function destroy(EvaluationPeriod $period, EvaluationCriteria $criteria)
    {
        $user = Auth::user();

        if ($user->role_id != 1 && $user->role_id != 2) {
            abort(403, 'Unauthorized action.');
        }

        // Verify criteria belongs to period
        if ($criteria->period_id !== $period->id) {
            abort(404);
        }

        // Can only delete criteria in draft periods
        if ($period->status !== 'draft') {
            return response()->json(['error' => 'Can only delete criteria in draft periods.'], 400);
        }

        $criteria->delete();

        return response()->json(null, 204);
    }
}
