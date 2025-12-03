<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeEvaluation extends Model
{
    protected $fillable = [
        'employee_id',
        'period_id',
        'status',
        'total_score',
        'grade',
        'manager_feedback',
        'reviewer_id',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'total_score' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the employee being evaluated.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Get the evaluation period.
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(EvaluationPeriod::class, 'period_id');
    }

    /**
     * Get the reviewer (HR/Admin).
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Get the answers for this evaluation.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(EvaluationAnswer::class, 'employee_evaluation_id');
    }

    /**
     * Calculate total score from answers (1-5 scale).
     */
    public function calculateTotalScore(): void
    {
        $totalSelfScore = $this->answers()->sum('self_score');
        $criteriaCount = $this->answers()->count();

        if ($criteriaCount > 0) {
            // Average of self score only (1-5 scale)
            $avgScore = $totalSelfScore / $criteriaCount;
            $this->total_score = round($avgScore, 2);
            $this->grade = $this->calculateGrade($this->total_score);
            $this->save();
        }
    }

    /**
     * Calculate grade based on score (1-5 scale).
     */
    private function calculateGrade(float $score): string
    {
        if ($score >= 4.5) return 'A';  // Sangat Baik
        if ($score >= 3.5) return 'B';  // Baik
        if ($score >= 2.5) return 'C';  // Cukup
        if ($score >= 1.5) return 'D';  // Kurang
        return 'E';  // Sangat Kurang
    }
}
