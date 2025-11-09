<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'division',
        'position',
        'join_date',
        'contact',
        'status',
        'document_path',
        'user_id'
    ];
}
