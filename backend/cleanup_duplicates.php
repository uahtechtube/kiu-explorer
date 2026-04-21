<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\VirtualClass;
use Illuminate\Support\Facades\DB;

echo "Cleaning up duplicate virtual classes...\n";

// Group by unique attributes to find duplicates
$duplicates = VirtualClass::select('course_id', 'title', 'scheduled_at', DB::raw('COUNT(*) as count'))
    ->groupBy('course_id', 'title', 'scheduled_at')
    ->having('count', '>', 1)
    ->get();

$deletedCount = 0;

foreach ($duplicates as $duplicate) {
    echo "Found duplicate: {$duplicate->title} at {$duplicate->scheduled_at} (Count: {$duplicate->count})\n";

    // Get all instances ordered by ID desc
    $instances = VirtualClass::where('course_id', $duplicate->course_id)
        ->where('title', $duplicate->title)
        ->where('scheduled_at', $duplicate->scheduled_at)
        ->orderBy('id', 'desc')
        ->get();

    // Keep the first one (latest ID), delete the rest
    $toDelete = $instances->slice(1);
    
    foreach ($toDelete as $class) {
        // Delete related attendance/messages first if cascading isn't set up
        DB::table('attendances')->where('virtual_class_id', $class->id)->delete();
        DB::table('virtual_class_messages')->where('virtual_class_id', $class->id)->delete();
        
        $class->delete();
        $deletedCount++;
    }
}

echo "Cleanup complete. Deleted {$deletedCount} duplicate classes.\n";
