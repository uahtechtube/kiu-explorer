<?php
// Load Laravel's autoloader
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// We just need the DB connection, so we can use the facade after bootstrapping
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "<h1>Database Diagnostic</h1>";
try {
    $dbName = DB::connection()->getDatabaseName();
    echo "<p><strong>Connected Database:</strong> " . $dbName . "</p>";

    echo "<h2>Tables:</h2><ul>";
    $tables = DB::select('SHOW TABLES');
    $foundVirtualClasses = false;
    foreach ($tables as $table) {
        $array = (array)$table;
        $tableName = array_values($array)[0];
        echo "<li>" . $tableName . "</li>";
        if ($tableName === 'virtual_classes') {
            $foundVirtualClasses = true;
        }
    }
    echo "</ul>";

    if ($foundVirtualClasses) {
        echo "<h3 style='color: green'>✅ Table 'virtual_classes' EXISTS.</h3>";
        $count = DB::table('virtual_classes')->count();
        echo "<p>Row count: $count</p>";
    } else {
        echo "<h3 style='color: red'>❌ Table 'virtual_classes' DOES NOT EXIST.</h3>";
    }

} catch (\Exception $e) {
    echo "<h3 style='color: red'>Database Connection Failed: " . $e->getMessage() . "</h3>";
}
