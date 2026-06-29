<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title'
    ];

    /**
     * Get the student who owns this conversation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the messages listed under this conversation.
     */
    public function messages()
    {
        return $this->hasMany(AiMessage::class);
    }
}
