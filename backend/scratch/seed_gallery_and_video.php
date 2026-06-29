<?php

// Bootstrapping Laravel application context
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\BlogPost;
use App\Models\GalleryItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

echo "Seeding gallery items with thumbnails and media blog posts...\n";

// Seed Gallery Items
$galleryData = [
    [
        'title' => 'KIU Main Campus Gate',
        'type' => 'image',
        'media_path' => 'gallery/images/mock_gate.jpg',
        'thumbnail_path' => null,
        'description' => 'A stunning entrance view of Kashim Ibrahim University main gate under blue skies.',
    ],
    [
        'title' => '25th Graduation Ceremony',
        'type' => 'image',
        'media_path' => 'gallery/images/mock_grad.jpg',
        'thumbnail_path' => null,
        'description' => 'Graduates celebrating their success at the KIU main auditorium graduation square.',
    ],
    [
        'title' => 'Campus Virtual Tour Log',
        'type' => 'video',
        'media_path' => 'gallery/videos/mock_tour.mp4',
        'thumbnail_path' => 'gallery/thumbnails/mock_tour_cover.jpg',
        'description' => 'An engaging video log walking students through key classroom blocks, labs, and recreation spots.',
    ],
];

foreach ($galleryData as $data) {
    GalleryItem::updateOrCreate(
        ['title' => $data['title']],
        $data
    );
}
echo "✓ Gallery items seeded.\n";

// Seed Video Blog Post
$videoPost = [
    'title' => 'Interactive Video Walkthrough of KIU Campus',
    'summary' => 'Take an interactive video tour of the main campus, student hotspots, and library halls to familiarize yourself.',
    'content' => "Exploring a new university campus can sometimes feel overwhelming. To make your integration seamless, the KIU Explorer team has put together a comprehensive campus video guide.

In this video log, we walk you through:
1. **The Central Library**: How to access e-resources and study halls.
2. **Main Lecture Blocks**: Finding your classrooms (e.g. Block A, B, and C).
3. **Student Union Square**: The main hub for student activities and social gatherings.

Check out the featured video player at the top of this article to view the full walkthrough! Feel free to leave feedback on the mobile app forums.",
    'video_path' => 'blog/videos/mock_video.mp4',
    'image_path' => 'blog/mock_cover.jpg', // cover thumbnail
    'author_name' => 'Explorer Team',
    'status' => 'published',
    'published_at' => now(),
    'views' => 245,
];

BlogPost::updateOrCreate(
    ['title' => $videoPost['title']],
    [
        'slug' => Str::slug($videoPost['title']),
        'summary' => $videoPost['summary'],
        'content' => $videoPost['content'],
        'video_path' => $videoPost['video_path'],
        'image_path' => $videoPost['image_path'],
        'author_name' => $videoPost['author_name'],
        'status' => $videoPost['status'],
        'published_at' => $videoPost['published_at'],
        'views' => $videoPost['views'],
    ]
);

echo "✓ Video Blog post seeded.\n";

// Ensure directories exist in public disk and write small mock files if they don't exist
Storage::disk('public')->makeDirectory('gallery/images');
Storage::disk('public')->makeDirectory('gallery/videos');
Storage::disk('public')->makeDirectory('gallery/thumbnails');
Storage::disk('public')->makeDirectory('blog/videos');

// Create dummy image and video files if not present to prevent 404 image loads during testing
if (!Storage::disk('public')->exists('gallery/images/mock_gate.jpg')) {
    Storage::disk('public')->put('gallery/images/mock_gate.jpg', 'fake-image-content');
}
if (!Storage::disk('public')->exists('gallery/images/mock_grad.jpg')) {
    Storage::disk('public')->put('gallery/images/mock_grad.jpg', 'fake-image-content');
}
if (!Storage::disk('public')->exists('gallery/thumbnails/mock_tour_cover.jpg')) {
    // Let's make it a tiny colored block placeholder if needed, or simple string content
    Storage::disk('public')->put('gallery/thumbnails/mock_tour_cover.jpg', 'fake-image-content');
}
if (!Storage::disk('public')->exists('blog/mock_cover.jpg')) {
    Storage::disk('public')->put('blog/mock_cover.jpg', 'fake-image-content');
}

// We will write a tiny valid MP4 header/file if needed, but simple placeholder is fine for test
if (!Storage::disk('public')->exists('gallery/videos/mock_tour.mp4')) {
    Storage::disk('public')->put('gallery/videos/mock_tour.mp4', 'fake-video-content');
}
if (!Storage::disk('public')->exists('blog/videos/mock_video.mp4')) {
    Storage::disk('public')->put('blog/videos/mock_video.mp4', 'fake-video-content');
}

echo "✓ Mock asset files created under public storage folder.\n";
echo "All done!\n";
