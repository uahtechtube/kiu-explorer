<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$config = config('database.connections.mysql');

echo "Database Host: " . $config['host'] . "\n";
echo "Database Port: " . $config['port'] . "\n";
echo "Database Name: " . $config['database'] . "\n";
echo "Username: " . $config['username'] . "\n";

try {
    DB::connection()->getPdo();
    echo "Connection to database '" . $config['database'] . "' SUCCESSFUL.\n";
    
    $tables = DB::select('SHOW TABLES');
    echo "Tables found: " . count($tables) . "\n";
    foreach ($tables as $table) {
        $key = 'Tables_in_' . $config['database'];
        if (isset($table->$key)) {
             echo "- " . $table->$key . "\n";
        }
    }
} catch (\Exception $e) {
    echo "Connection FAILED: " . $e->getMessage() . "\n";
}
