<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'room_number',
        'capacity',
        'available_slots',
        'price_per_semester',
        'status',
        'amenities',
    ];

    protected $casts = [
        'amenities' => 'array',
    ];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }

    public function bookings()
    {
        return $this->hasMany(HostelBooking::class);
    }

    public function beds()
    {
        return $this->hasMany(HostelBed::class, 'hostel_room_id');
    }
}
