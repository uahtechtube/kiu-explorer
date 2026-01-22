<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'content',
        'type',
        'media_url',
        'media_size',
        'media_mime_type',
        'media_duration',
        'thumbnail_url',
        'file_name',
    ];

    protected $appends = ['full_media_url', 'full_thumbnail_url'];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get full URL for media file
     */
    public function getFullMediaUrlAttribute()
    {
        if ($this->media_url) {
            return url('storage/' . $this->media_url);
        }
        return null;
    }

    /**
     * Get full URL for thumbnail
     */
    public function getFullThumbnailUrlAttribute()
    {
        if ($this->thumbnail_url) {
            return url('storage/' . $this->thumbnail_url);
        }
        return null;
    }

    /**
     * Check if message is media type
     */
    public function isMedia(): bool
    {
        return in_array($this->type, ['image', 'document', 'voice', 'video', 'file']);
    }

    /**
     * Get human-readable file size
     */
    public function getFormattedSizeAttribute()
    {
        if (!$this->media_size) return null;
        
        $bytes = $this->media_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get formatted duration (for voice/video)
     */
    public function getFormattedDurationAttribute()
    {
        if (!$this->media_duration) return null;
        
        $minutes = floor($this->media_duration / 60);
        $seconds = $this->media_duration % 60;
        
        return sprintf('%02d:%02d', $minutes, $seconds);
    }
}
