<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'question_id',
        'selected_option_id',
        'theory_answer',
        'marks_obtained',
    ];

    public function attempt()
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption()
    {
        return $this->belongsTo(Option::class, 'selected_option_id');
    }
}
