<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'name',
        'degree_type', // e.g., B.Sc, M.Sc
        'duration',    // e.g., 4 years
        'description',
    ];

    /**
     * Get the department that owns the programme.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the faculty through the department.
     */
    public function faculty()
    {
        return $this->hasOneThrough(Faculty::class, Department::class, 'id', 'id', 'department_id', 'faculty_id');
    }
}
