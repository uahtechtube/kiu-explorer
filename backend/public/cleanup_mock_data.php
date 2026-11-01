<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');
try {
    $deleted = \Illuminate\Support\Facades\DB::table('virtual_classes')->delete();
    
    $announcements = \App\Models\Announcement::count();
    $latestAnnouncements = \App\Models\Announcement::latest()->take(5)->get(['id','title','target_audience','is_active','published_at']);
    
    echo json_encode([
        'status' => 'success',
        'virtual_classes_deleted' => $deleted,
        'announcement_count' => $announcements,
        'latest_announcements' => $latestAnnouncements,
        'message' => 'All mock virtual classes deleted successfully!'
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
