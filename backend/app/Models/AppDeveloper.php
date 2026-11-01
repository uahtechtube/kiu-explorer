<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppDeveloper extends Model
{
    use HasFactory;

    protected $table = 'app_developers';

    protected $fillable = [
        'name',
        'photo_url',
        'position',
        'donation',
        'phone',
        'email',
        'github',
        'linkedin',
        'twitter',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
