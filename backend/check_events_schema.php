<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "Checking events table structure...\n\n";

try {
    $columns = Schema::getColumnListing('events');
    echo "Columns in events table:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    echo "\n\nDetailed column info:\n";
    $details = DB::select('DESCRIBE events');
    foreach ($details as $detail) {
        echo "  {$detail->Field}: {$detail->Type}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
