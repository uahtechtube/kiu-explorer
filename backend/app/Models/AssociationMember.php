<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssociationMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'association_id',
        'user_id',
        'role',
        'joined_at',
    ];

    public function association()
    {
        return $this->belongsTo(Association::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
