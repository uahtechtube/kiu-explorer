<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'latitude',
        'longitude',
        'image_url',
        'contact_phone',
        'contact_email',
        'operating_hours',
        'is_active',
        'floor_number',
        'building_code',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'floor_number' => 'integer',
    ];

    protected $appends = ['full_image_url'];

    public function getFullImageUrlAttribute()
    {
        if ($this->image_url) {
            return url('storage/' . $this->image_url);
        }
        return null;
    }

    public static function emergencyPoints()
    {
        return self::where('type', 'emergency_point')
            ->where('is_active', true)
            ->get();
    }
}
