<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'blog_posts';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'image_path',
        'video_path',
        'author_name',
        'status',
        'published_at',
        'views',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'published_at' => 'datetime',
        'views' => 'integer',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::saving(function ($post) {
            // Automatically generate a slug if it is empty
            if (empty($post->slug)) {
                $slug = Str::slug($post->title);
                
                // Ensure slug uniqueness
                $count = static::where('slug', 'like', $slug . '%')->where('id', '!=', $post->id)->count();
                $post->slug = $count ? "{$slug}-{$count}" : $slug;
            }

            // Set published_at when post is published and it's not set
            if ($post->status === 'published' && empty($post->published_at)) {
                $post->published_at = now();
            }
        });
    }
}
