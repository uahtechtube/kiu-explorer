<?php
// Explicit credentials - update these to match what we expect
$host = '127.0.0.1';
$port = 3306;
$db   = 'kiu_explorer';
$user = 'root';
$pass = '';

echo "--- START DEBUG ---\n";

// 1. Try to read .env to see what is actually there
echo "Reading .env file...\n";
if (file_exists('.env')) {
    $lines = file('.env');
    foreach ($lines as $line) {
        if (strpos(trim($line), 'DB_') === 0) {
            echo "Found config: " . trim($line) . "\n";
        }
    }
} else {
    echo "ERROR: .env file NOT FOUND.\n";
}

echo "\nTesting Raw MySQL Connection to '$db'...\n";
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db";
    $pdo = new PDO($dsn, $user, $pass);
    echo "SUCCESS: Connected to database '$db'!\n";
    
    echo "Listing tables:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "WARNING: Connected, but NO TABLES found.\n";
    } else {
        foreach ($tables as $table) {
            echo "- $table\n";
        }
    }

} catch (PDOException $e) {
    echo "CONNECTION FAILED: " . $e->getMessage() . "\n";
    
    // Try connecting without DB name to see if server is searchable
    echo "\nRetrying connection without database name...\n";
    try {
        $dsn = "mysql:host=$host;port=$port";
        $pdo = new PDO($dsn, $user, $pass);
        echo "Connected to MySQL Server! Listing available databases:\n";
        $stmt = $pdo->query("SHOW DATABASES");
        $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($dbs as $database) {
            echo "- $database\n";
        }
    } catch (PDOException $e2) {
        echo "SERVER CONNECTION FAILED: " . $e2->getMessage() . "\n";
    }
}
echo "--- END DEBUG ---\n";
