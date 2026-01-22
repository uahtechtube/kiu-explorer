<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'document_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'is_verified',
        'verified_by',
        'verified_at',
        'verification_notes',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
    ];

    protected $appends = ['full_file_url'];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getFullFileUrlAttribute()
    {
        if ($this->file_path) {
            return url('storage/' . $this->file_path);
        }
        return null;
    }

    public function getFormattedSizeAttribute()
    {
        if (!$this->file_size) return null;
        
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
