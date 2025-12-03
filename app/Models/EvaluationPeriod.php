<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationPeriod extends Model
{
    protected $fillable = [
        'name',
        'period_code',
        'period_type',
        'start_date',
        'end_date',
        'self_assessment_deadline',
        'hr_evaluation_deadline',
        'description',
        'guidelines',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'self_assessment_deadline' => 'date',
        'hr_evaluation_deadline' => 'date',
    ];

    /**
     * Get the user who created this period.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the criteria for this period.
     */
    public function criteria(): HasMany
    {
        return $this->hasMany(EvaluationCriteria::class, 'period_id');
    }

    /**
     * Get the employee evaluations for this period.
     */
    public function employeeEvaluations(): HasMany
    {
        return $this->hasMany(EmployeeEvaluation::class, 'period_id');
    }
}
