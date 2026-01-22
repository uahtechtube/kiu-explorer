<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'association_id',
        'created_by',
        'title',
        'description',
        'category',
        'venue',
        'start_time',
        'end_time',
        'capacity',
        'image_url',
        'banner',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function association()
    {
        return $this->belongsTo(Association::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }
}
