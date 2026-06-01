<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poll extends Model
{
    use HasFactory;

    protected $fillable = [
        'association_id',
        'created_by',
        'title',
        'description',
        'starts_at',
        'ends_at',
        'allow_multiple_votes',
        'show_results_before_voting',
        'is_active',
    ];

    protected $casts = [
        'allow_multiple_votes' => 'boolean',
        'show_results_before_voting' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function association()
    {
        return $this->belongsTo(Association::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function options()
    {
        return $this->hasMany(PollOption::class);
    }

    public function votes()
    {
        return $this->hasMany(PollVote::class);
    }
}
