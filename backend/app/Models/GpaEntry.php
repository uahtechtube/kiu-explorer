<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GpaEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'semester',
        'course_code',
        'course_title',
        'credit_units',
        'grade',
        'grade_points',
    ];

    /**
     * Map grade string to points (Nigerian 5-point scale)
     */
    public static function getPointsFromGrade(string $grade): int
    {
        $grade = strtoupper(trim($grade));
        return match ($grade) {
            'A' => 5,
            'B' => 4,
            'C' => 3,
            'D' => 2,
            'E' => 1,
            default => 0,
        };
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($entry) {
            $entry->grade_points = self::getPointsFromGrade($entry->grade);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
