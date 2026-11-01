<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelHead extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'name',
        'title',
        'phone',
        'email',
        'room_number',
        'office_hours',
        'bio',
        'image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }
}
