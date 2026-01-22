<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "--- TESTING API ENDPOINTS ---\n\n";

function test_route($uri) {
    global $kernel;
    $request = Illuminate\Http\Request::create($uri, 'GET');
    $response = $kernel->handle($request);
    echo "GET $uri: Status " . $response->getStatusCode() . "\n";
    $content = $response->getContent();
    // Truncate if too long for display
    echo "Response: " . substr($content, 0, 100) . (strlen($content) > 100 ? "..." : "") . "\n\n";
}

test_route('/api/faculties');
test_route('/api/academic-sessions');

// Need an ID to test dept/programme - assuming ID 1 exists from seed
test_route('/api/faculties/1/departments');
test_route('/api/departments/1/programmes');
