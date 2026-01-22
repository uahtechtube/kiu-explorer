<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'creator_id',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function approvedMembers()
    {
        return $this->hasMany(GroupMember::class)->where('status', 'approved');
    }

    public function conversation()
    {
        return $this->hasOne(Conversation::class);
    }
}
