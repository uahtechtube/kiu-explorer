<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = [
    'general_attendance', 
    'exam_attempts', 
    'assignment_submissions',
    'student_profiles'
];

echo "Checking tables...\n";
foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        echo "[OK] Table '$table' exists.\n";
    } else {
        echo "[MISSING] Table '$table' DOES NOT exist.\n";
    }
}

echo "\nChecking relationships for User ID 1 (if exists)...\n";
$user = \App\Models\User::with('studentProfile')->find(1);
if ($user) {
    echo "User 1 found. Relations: " . ($user->studentProfile ? "Has Profile" : "No Profile") . "\n";
} else {
    echo "User 1 not found.\n";
}
