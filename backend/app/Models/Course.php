<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'code',
        'title',
        'unit',
        'level',
        'semester',
        'description',
        'is_elective',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_registrations')
                    ->withPivot('academic_session_id', 'score', 'grade')
                    ->withTimestamps();
    }

    public function lecturers()
    {
        return $this->belongsToMany(User::class, 'course_allocations')
                    ->withPivot('academic_session_id', 'is_coordinator')
                    ->withTimestamps();
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
