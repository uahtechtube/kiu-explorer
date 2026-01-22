<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'academic_session_id',
        'ca_score',
        'exam_score',
        'total_score',
        'grade',
        'status',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
    
    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class);
    }
}
