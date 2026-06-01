<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelAttendance extends Model
{
    use HasFactory;

    protected $table = 'hostel_attendance';

    protected $fillable = [
        'student_id',
        'hostel_id',
        'room_id',
        'direction',
        'timestamp',
        'device_id',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }

    public function room()
    {
        return $this->belongsTo(HostelRoom::class, 'room_id');
    }
}
