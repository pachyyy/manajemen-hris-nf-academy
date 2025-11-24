<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Training extends Model
{
    protected $fillable = [
        'title',
        'description',
        'trainer_name',
        'type',
        'start_time',
        'end_time',
        'location',
        'quota',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants()
    {
        return $this->hasMany(TrainingParticipants::class);
    }

    public function results()
    {
        return $this->hasMany(TrainingResult::class);
    }
}
