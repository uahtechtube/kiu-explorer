<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneralAttendance extends Model
{
    use HasFactory;

    protected $table = 'general_attendance';

    protected $fillable = [
        'student_id',
        'attendance_date',
        'check_in_time',
        'check_out_time',
        'status',
        'notes',
        'marked_by',
    ];

    protected $casts = [
        'attendance_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function marker()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
