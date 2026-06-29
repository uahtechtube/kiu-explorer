<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'logo',
        'banner',
        'contact_phone',
        'whatsapp_number',
        'contact_email',
        'status',
    ];

    /**
     * Get the student who owns the shop.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who owns the shop (alias).
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the products listed under this shop.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
