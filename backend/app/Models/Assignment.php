<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'lecturer_id',
        'title',
        'description',
        'instructions',
        'attachment_path',
        'due_date',
        'max_score',
        'allow_late_submission',
        'late_penalty_percent',
        'is_published',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'allow_late_submission' => 'boolean',
        'is_published' => 'boolean',
        'max_score' => 'integer',
        'late_penalty_percent' => 'integer',
    ];

    protected $appends = ['is_overdue', 'full_attachment_url'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function getIsOverdueAttribute()
    {
        return now()->greaterThan($this->due_date);
    }

    public function getFullAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            return url('storage/' . $this->attachment_path);
        }
        return null;
    }
}
