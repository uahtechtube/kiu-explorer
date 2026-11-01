<?php

// Bootstrapping Laravel application context
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\LandingPageSetting;
use App\Models\BlogPost;
use App\Models\GalleryItem;

echo "Updating database entries from 'Kampala International University' to 'Kashim Ibrahim University'...\n";

// Update Settings Subtitle
$settings = LandingPageSetting::first();
if ($settings) {
    $settings->hero_subtitle = str_replace(
        'Kampala International University',
        'Kashim Ibrahim University',
        $settings->hero_subtitle
    );
    $settings->save();
    echo "✓ LandingPageSetting updated.\n";
}

// Update Blog Posts Content
$posts = BlogPost::all();
foreach ($posts as $post) {
    $post->summary = str_replace(
        'Kampala International University',
        'Kashim Ibrahim University',
        $post->summary
    );
    $post->content = str_replace(
        'Kampala International University',
        'Kashim Ibrahim University',
        $post->content
    );
    $post->save();
}
echo "✓ Blog posts content updated.\n";

// Update Gallery Items Description
$items = GalleryItem::all();
foreach ($items as $item) {
    $item->description = str_replace(
        'Kampala International University',
        'Kashim Ibrahim University',
        $item->description
    );
    $item->save();
}
echo "✓ Gallery items description updated.\n";

echo "All done!\n";
