<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingResult extends Model
{
    protected $fillable = [
        'training_id',
        'user_id',
        'score',
        'status',
        'certificate_path',
        'notes',
    ];

    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
