<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostItemComment extends Model
{
    use HasFactory;

    protected $table = 'lost_item_comments';

    protected $fillable = [
        'lost_item_id',
        'user_id',
        'content',
    ];

    public function lostItem()
    {
        return $this->belongsTo(LostItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
