<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'student_id',
        'submission_text',
        'file_path',
        'file_name',
        'file_size',
        'submitted_at',
        'is_late',
        'score',
        'feedback',
        'graded_by',
        'graded_at',
        'status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'is_late' => 'boolean',
        'score' => 'integer',
        'file_size' => 'integer',
    ];

    protected $appends = ['full_file_url', 'final_score'];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function grader()
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function getFullFileUrlAttribute()
    {
        if ($this->file_path) {
            return url('storage/' . $this->file_path);
        }
        return null;
    }

    public function getFinalScoreAttribute()
    {
        if (!$this->score) return null;

        $score = $this->score;

        // Apply late penalty if applicable
        if ($this->is_late && $this->assignment->late_penalty_percent > 0) {
            $penalty = ($score * $this->assignment->late_penalty_percent) / 100;
            $score = max(0, $score - $penalty);
        }

        return $score;
    }
}
