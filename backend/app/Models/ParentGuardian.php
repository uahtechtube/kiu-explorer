<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentGuardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'full_name',
        'relationship',
        'phone_number',
        'alternative_phone',
        'email',
        'address',
        'occupation',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
