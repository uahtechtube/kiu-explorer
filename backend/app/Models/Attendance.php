<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'virtual_class_id',
        'user_id',
        'joined_at',
        'left_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
    ];

    public function virtualClass()
    {
        return $this->belongsTo(VirtualClass::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
