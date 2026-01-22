<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolInfo extends Model
{
    use HasFactory;

    protected $table = 'school_info';

    protected $fillable = [
        'school_name',
        'background',
        'history',
        'vision',
        'mission',
        'core_values',
        'logo_url',
        'motto',
        'established_year',
        'address',
        'phone',
        'email',
        'website',
    ];

    protected $casts = [
        'established_year' => 'integer',
    ];
}
