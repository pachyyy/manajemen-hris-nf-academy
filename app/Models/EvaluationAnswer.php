<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationAnswer extends Model
{
    protected $fillable = [
        'employee_evaluation_id',
        'criteria_id',
        'self_score',
        'self_note',
        'hr_score',
        'hr_feedback',
    ];

    protected $casts = [
        'self_score' => 'integer',
        'hr_score' => 'integer',
    ];

    /**
     * Get the employee evaluation.
     */
    public function employeeEvaluation(): BelongsTo
    {
        return $this->belongsTo(EmployeeEvaluation::class, 'employee_evaluation_id');
    }

    /**
     * Get the criteria.
     */
    public function criteria(): BelongsTo
    {
        return $this->belongsTo(EvaluationCriteria::class, 'criteria_id');
    }
}
