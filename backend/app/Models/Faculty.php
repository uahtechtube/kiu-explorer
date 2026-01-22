<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    /**
     * Get the departments for the faculty.
     */
    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    /**
     * Get all programmes through departments.
     */
    public function programmes()
    {
        return $this->hasManyThrough(Programme::class, Department::class);
    }
}
