<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Running FAST cleanup of duplicate virtual classes...\n";

try {
    // Delete rows where a row with the SAME attributes but a LARGER ID exists
    // This keeps the row with the largest ID (the latest one)
    $affected = DB::delete('
        DELETE t1 FROM virtual_classes t1
        INNER JOIN virtual_classes t2 
        WHERE 
            t1.id < t2.id AND 
            t1.course_id = t2.course_id AND 
            t1.title = t2.title AND 
            t1.scheduled_at = t2.scheduled_at
    ');

    echo "✅ Cleanup complete. Deleted $affected duplicate classes.\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
