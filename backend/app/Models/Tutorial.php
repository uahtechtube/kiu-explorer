<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'uploaded_by',
        'title',
        'description',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'youtube_video_id',
        'source_type',
        'views',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Helper to get full URL for file-based tutorials
    public function getFileUrlAttribute()
    {
        if ($this->source_type === 'youtube') {
            return "https://www.youtube.com/watch?v={$this->youtube_video_id}";
        }
        return asset('storage/' . $this->file_path);
    }

    // YouTube thumbnail URL
    public function getYoutubeThumbnailAttribute()
    {
        if ($this->youtube_video_id) {
            return "https://img.youtube.com/vi/{$this->youtube_video_id}/mqdefault.jpg";
        }
        return null;
    }
}
