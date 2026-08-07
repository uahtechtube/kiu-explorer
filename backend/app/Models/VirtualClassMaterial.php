<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VirtualClassMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'virtual_class_id',
        'name',
        'type',
        'file_path',
        'file_size',
        'downloads',
    ];

    protected $casts = [
        'downloads' => 'integer',
    ];

    public function virtualClass()
    {
        return $this->belongsTo(VirtualClass::class);
    }
}