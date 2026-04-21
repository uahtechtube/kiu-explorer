<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'hostel_room_id',
        'academic_session',
        'status',
        'payment_id',
        'booked_at',
        'approved_at',
    ];

    protected $dates = [
        'booked_at',
        'approved_at',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function room()
    {
        return $this->belongsTo(HostelRoom::class, 'hostel_room_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
