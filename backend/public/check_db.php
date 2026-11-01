<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');
try {
    $tutorials = \App\Models\Tutorial::latest()->take(5)->get();
    echo json_encode([
        'status' => 'success',
        'count' => \App\Models\Tutorial::count(),
        'latest' => $tutorials
    ]);
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
