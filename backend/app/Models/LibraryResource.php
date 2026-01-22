<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibraryResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'category',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'cover_image',
        'course_id',
        'uploaded_by',
        'downloads_count',
        'is_public',
        'is_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'downloads_count' => 'integer',
        'file_size' => 'integer',
    ];

    protected $appends = ['full_file_url', 'full_cover_url'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getFullFileUrlAttribute()
    {
        if ($this->file_path) {
            return url('storage/' . $this->file_path);
        }
        return null;
    }

    public function getFullCoverUrlAttribute()
    {
        if ($this->cover_image) {
            return url('storage/' . $this->cover_image);
        }
        return null;
    }

    public function incrementDownloads()
    {
        $this->increment('downloads_count');
    }
}
