<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssociationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'association_id',
        'title',
        'file_path',
        'file_type',
        'uploaded_by',
    ];

    public function association()
    {
        return $this->belongsTo(Association::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
