<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'created_by',
        'title',
        'description',
        'time_limit',
        'max_attempts',
        'show_answers',
        'is_published',
    ];

    protected $casts = [
        'show_answers' => 'boolean',
        'is_published' => 'boolean',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'quiz_questions');
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
