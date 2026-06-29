<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advert extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'media_type',
        'media_url',
        'external_link',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['full_media_url'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getFullMediaUrlAttribute()
    {
        if ($this->media_url) {
            // Check if it's already a full URL
            if (filter_var($this->media_url, FILTER_VALIDATE_URL)) {
                return $this->media_url;
            }
            return url('storage/' . $this->media_url);
        }
        return null;
    }
}
