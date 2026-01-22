<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicCalendar extends Model
{
    use HasFactory;

    protected $table = 'academic_calendar';

    protected $fillable = [
        'title',
        'description',
        'type',
        'start_date',
        'end_date',
        'academic_session',
        'semester',
        'color',
        'is_public',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_public' => 'boolean',
    ];

    /**
     * Get upcoming events
     */
    public static function upcoming($limit = 10)
    {
        return self::where('start_date', '>=', now())
            ->where('is_public', true)
            ->orderBy('start_date')
            ->limit($limit)
            ->get();
    }

    /**
     * Get events for a specific session
     */
    public static function forSession($session)
    {
        return self::where('academic_session', $session)
            ->where('is_public', true)
            ->orderBy('start_date')
            ->get();
    }
}
