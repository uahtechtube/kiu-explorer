<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Association extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'acronym',
        'description',
        'category',
        'president_id',
        'meeting_schedule',
        'logo_url',
        'cover_image_url',
        'logo',
        'banner',
        'type',
        'status',
    ];

    public function members()
    {
        return $this->hasMany(AssociationMember::class);
    }

    public function documents()
    {
        return $this->hasMany(AssociationDocument::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
