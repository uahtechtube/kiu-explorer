<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PopupAnnouncement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'image',
        'video',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
