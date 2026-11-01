<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');
try {
    // Truncate the dummy announcements completely
    \Illuminate\Support\Facades\DB::table('announcements')->truncate();
    
    // Check if notifications table exists and has data
    $notificationsCount = 0;
    if (\Illuminate\Support\Facades\Schema::hasTable('notifications')) {
        $notificationsCount = \Illuminate\Support\Facades\DB::table('notifications')->count();
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Mock announcements successfully deleted!',
        'notifications_in_db' => $notificationsCount
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
