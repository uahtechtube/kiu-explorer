<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'name',
        'code',
        'description',
    ];

    /**
     * Get the faculty that owns the department.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    /**
     * Get the programmes for the department.
     */
    public function programmes()
    {
        return $this->hasMany(Programme::class);
    }
}
