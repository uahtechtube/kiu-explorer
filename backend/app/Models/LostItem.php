<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'image_url',
        'location',
        'founder',
        'contact_details',
        'type',
        'status',
    ];

    protected $appends = ['full_image_url'];

    /**
     * Get the absolute URL for the item image.
     */
    public function getFullImageUrlAttribute()
    {
        if (!$this->image_url) {
            return null;
        }

        if (strpos($this->image_url, 'http') === 0) {
            return $this->image_url;
        }

        return url($this->image_url);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(LostItemComment::class);
    }
}
