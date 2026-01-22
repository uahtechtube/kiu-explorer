<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'academic_session_id',
        'is_coordinator',
    ];

    /**
     * Get the lecturer (User) for this allocation.
     */
    public function lecturer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the course for this allocation.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the academic session for this allocation.
     */
    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class);
    }
}
