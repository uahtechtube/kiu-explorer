<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HostelBed extends Model
{
    protected $fillable = [
        'hostel_room_id',
        'bed_number',
        'is_occupied',
        'student_id'
    ];

    protected $casts = [
        'is_occupied' => 'boolean',
    ];

    public function room()
    {
        return $this->belongsTo(HostelRoom::class, 'hostel_room_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
