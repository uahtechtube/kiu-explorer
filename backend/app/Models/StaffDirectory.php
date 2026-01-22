<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffDirectory extends Model
{
    use HasFactory;

    protected $table = 'staff_directory';

    protected $fillable = [
        'staff_id',
        'title',
        'surname',
        'first_name',
        'other_names',
        'position',
        'faculty_id',
        'department_id',
        'office_location',
        'email',
        'phone',
        'photo_url',
        'specialization',
        'qualifications',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function getFullNameAttribute()
    {
        return trim("{$this->title} {$this->surname} {$this->first_name} {$this->other_names}");
    }
}
