<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "DB_CONNECTION: " . config('database.default') . "\n";
echo "DB_HOST: " . config('database.connections.mysql.host') . "\n";
echo "DB_PORT: " . config('database.connections.mysql.port') . "\n";
echo "DB_DATABASE: " . config('database.connections.mysql.database') . "\n";
echo "DB_USERNAME: " . config('database.connections.mysql.username') . "\n";
// Don't print full password for security, just length or check if set
echo "DB_PASSWORD length: " . strlen(config('database.connections.mysql.password')) . "\n";

try {
    DB::connection()->getPdo();
    echo "Connection successful!\n";
} catch (\Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
