<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostelRoommateProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'sleep_habit',
        'study_habit',
        'cleanliness',
        'social_habit',
        'bio',
        'interests',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
