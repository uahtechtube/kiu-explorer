<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VaultDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'category',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'description',
        'is_pinned',
        'is_encrypted',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_encrypted' => 'boolean',
        'file_size' => 'integer',
    ];

    protected $appends = ['formatted_size'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedSizeAttribute()
    {
        if (!$this->file_size) return '0 B';
        
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
