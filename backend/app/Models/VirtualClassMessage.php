<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VirtualClassMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'virtual_class_id',
        'user_id',
        'message',
        'is_lecturer',
    ];

    public function virtualClass()
    {
        return $this->belongsTo(VirtualClass::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
