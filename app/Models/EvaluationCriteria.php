<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationCriteria extends Model
{
    protected $table = 'evaluation_criteria';

    protected $fillable = [
        'period_id',
        'title',
        'description',
        'type',
        'is_default',
        'order_index',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'order_index' => 'integer',
    ];

    /**
     * Get the period that owns this criteria.
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(EvaluationPeriod::class, 'period_id');
    }

    /**
     * Get the answers for this criteria.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(EvaluationAnswer::class, 'criteria_id');
    }
}
