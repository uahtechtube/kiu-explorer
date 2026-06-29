<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'description',
        'media_type',
        'media_url',
    ];

    protected $appends = ['full_media_url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFullMediaUrlAttribute()
    {
        if ($this->media_url) {
            if (filter_var($this->media_url, FILTER_VALIDATE_URL)) {
                return $this->media_url;
            }
            return url('storage/' . str_replace('storage/', '', $this->media_url));
        }
        return null;
    }
}
