<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'birth_date',
        'division',
        'position',
        'status',
        'join_date',
        'bank_name',
        'bank_account_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attendances() {
        return $this->hasMany(Attendance::class);
    }
}
