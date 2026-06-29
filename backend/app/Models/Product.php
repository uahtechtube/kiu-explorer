<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'price',
        'image_url',
        'gallery',
        'category',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'gallery' => 'array',
    ];

    protected $appends = ['full_gallery'];

    /**
     * Get the shop that lists this product.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get all reviews for this product.
     */
    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Resolve full URLs for gallery media files.
     */
    public function getFullGalleryAttribute()
    {
        if (!$this->gallery) {
            return [];
        }
        return array_map(function ($item) {
            $url = $item['url'] ?? '';
            if ($url && !filter_var($url, FILTER_VALIDATE_URL)) {
                $url = url('storage/' . str_replace('storage/', '', $url));
            }
            return [
                'type' => $item['type'] ?? 'image',
                'url' => $url
            ];
        }, $this->gallery);
    }
}
