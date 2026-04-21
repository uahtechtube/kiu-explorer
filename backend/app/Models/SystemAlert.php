<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemAlert extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'severity',
        'is_resolved',
        'resolved_at',
        'resolved_by',
        'metadata'
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the user who resolved the alert
     */
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope to get unresolved alerts
     */
    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    /**
     * Scope to get critical alerts
     */
    public function scopeCritical($query)
    {
        return $query->where('type', 'critical');
    }

    /**
     * Scope to filter by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to filter by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', '>=', $severity);
    }

    /**
     * Mark alert as resolved
     */
    public function resolve($userId = null)
    {
        $this->update([
            'is_resolved' => true,
            'resolved_at' => now(),
            'resolved_by' => $userId ?? auth()->id()
        ]);
    }

    /**
     * Get color based on type
     */
    public function getColorAttribute()
    {
        return match($this->type) {
            'critical' => '#EF4444',
            'warning' => '#F59E0B',
            'info' => '#3B82F6',
            default => '#64748B'
        };
    }

    /**
     * Get icon based on type
     */
    public function getIconAttribute()
    {
        return match($this->type) {
            'critical' => 'alert-circle',
            'warning' => 'alert-triangle',
            'info' => 'info',
            default => 'bell'
        };
    }
}
