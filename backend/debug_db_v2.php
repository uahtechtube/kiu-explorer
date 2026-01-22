<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

$logFile = __DIR__.'/debug_output.txt';
file_put_contents($logFile, "--- DEBUG START ---\n");

try {
    // 1. Check Connection
    $dbName = DB::connection()->getDatabaseName();
    file_put_contents($logFile, "Connected to Database: " . $dbName . "\n", FILE_APPEND);

    // 2. List Tables
    $tables = DB::select('SHOW TABLES');
    $tableNames = array_map(function($t) { return array_values((array)$t)[0]; }, $tables);
    file_put_contents($logFile, "Existing Tables: " . implode(', ', $tableNames) . "\n", FILE_APPEND);

    if (in_array('virtual_classes', $tableNames)) {
        file_put_contents($logFile, "✅ 'virtual_classes' ALREADY EXISTS.\n", FILE_APPEND);
        // Verify columns
        $columns = Schema::getColumnListing('virtual_classes');
        file_put_contents($logFile, "Columns: " . implode(', ', $columns) . "\n", FILE_APPEND);
    } else {
        file_put_contents($logFile, "❌ 'virtual_classes' MISSING. Attempting creation...\n", FILE_APPEND);
        
        Schema::create('virtual_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->nullable(); 
            $table->foreignId('lecturer_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->integer('duration')->default(60);
            $table->string('meeting_link')->nullable();
            $table->string('recording_url')->nullable();
            $table->boolean('is_recorded')->default(false);
            $table->enum('status', ['upcoming', 'active', 'ended'])->default('upcoming');
            $table->timestamps();
        });
        
        file_put_contents($logFile, "✅ 'virtual_classes' CREATED.\n", FILE_APPEND);
    }

    // 3. Ensure Data
    $count = DB::table('virtual_classes')->count();
    file_put_contents($logFile, "Row Count: " . $count . "\n", FILE_APPEND);

    if ($count == 0) {
        DB::table('virtual_classes')->insert([
            'title' => 'Emergency Repair Class',
            'description' => 'Created by debug_db_v2.php',
            'scheduled_at' => now()->addDay(),
            'status' => 'upcoming',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        file_put_contents($logFile, "Seeded 1 row.\n", FILE_APPEND);
    }

} catch (\Exception $e) {
    file_put_contents($logFile, "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    file_put_contents($logFile, "TRACE: " . $e->getTraceAsString() . "\n", FILE_APPEND);
}

file_put_contents($logFile, "--- DEBUG END ---\n", FILE_APPEND);
