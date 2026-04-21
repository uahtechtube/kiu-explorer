<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hostel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'campus_location_id',
        'gender_type',
        'description',
        'image_url',
        'is_active',
    ];

    public function campusLocation()
    {
        return $this->belongsTo(CampusLocation::class);
    }

    public function rooms()
    {
        return $this->hasMany(HostelRoom::class);
    }
}
