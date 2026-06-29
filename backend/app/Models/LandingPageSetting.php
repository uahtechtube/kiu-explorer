<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageSetting extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'landing_page_settings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'app_name',
        'hero_title',
        'hero_subtitle',
        'apk_version',
        'apk_size',
        'apk_file_path',
        'download_count',
        'primary_color',
        'secondary_color',
        'features',
        'faqs',
        'screenshots',
        'hero_image_path',
        'hero_video_path',
        'theme_mode',
        'show_features',
        'show_faqs',
        'show_stats',
        'custom_sections',
        'show_team',
        'team'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'features' => 'array',
        'faqs' => 'array',
        'screenshots' => 'array',
        'custom_sections' => 'array',
        'team' => 'array',
        'download_count' => 'integer',
        'show_features' => 'boolean',
        'show_faqs' => 'boolean',
        'show_stats' => 'boolean',
        'show_team' => 'boolean',
    ];
}
