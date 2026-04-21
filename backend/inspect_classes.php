<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\VirtualClass;

echo "Inspecting Virtual Classes...\n";

$classes = VirtualClass::all();

echo "Total Classes: " . $classes->count() . "\n";

foreach ($classes as $class) {
    echo "ID: {$class->id} | Course: {$class->course_id} | Title: {$class->title} | Scheduled: {$class->scheduled_at}\n";
}
