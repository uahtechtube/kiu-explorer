<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'target_audience',
        'priority',
        'published_by',
        'published_at',
        'expires_at',
        'attachment_url',
        'is_active',
        'send_notification',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'send_notification' => 'boolean',
    ];

    protected $appends = ['is_expired', 'full_attachment_url'];

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function getIsExpiredAttribute()
    {
        if (!$this->expires_at) return false;
        return now()->greaterThan($this->expires_at);
    }

    public function getFullAttachmentUrlAttribute()
    {
        if ($this->attachment_url) {
            return url('storage/' . $this->attachment_url);
        }
        return null;
    }

    /**
     * Get active announcements for a user
     */
    public static function forUser($user)
    {
        $query = self::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->where(function($q) use ($user) {
                $q->where('target_audience', 'all')
                  ->orWhere('target_audience', $user->role . 's');
                
                // Check for level-specific announcements
                if ($user->isStudent() && $user->studentProfile) {
                    $level = $user->studentProfile->level;
                    $q->orWhere('target_audience', 'level_' . $level);
                }
            });

        return $query->orderByDesc('priority')
            ->orderByDesc('published_at')
            ->get();
    }
}
