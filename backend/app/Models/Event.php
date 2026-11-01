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

    protected $appends = ['type', 'location', 'banner_url'];

    public function getTypeAttribute()
    {
        $category = $this->category;
        switch ($category) {
            case 'Academic':
                return 'Academic';
            case 'Workshop':
                return 'Career';
            case 'Social':
            case 'Sports':
            case 'Cultural':
                return 'Social';
            default:
                return 'Social';
        }
    }

    public function getLocationAttribute()
    {
        return $this->venue;
    }

    public function getBannerUrlAttribute()
    {
        return $this->image_url ?? $this->banner ?? 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe6?w=800&q=80';
    }

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
