<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get a student user
$user = App\Models\User::where('role', 'student')->first();

if (!$user) {
    echo "No student user found in database.\n";
    exit(1);
}

echo "Testing dashboard endpoint for user: {$user->email}\n\n";

// Create a token for the user
$token = $user->createToken('test-token')->plainTextToken;

// Make the request
try {
    $request = Illuminate\Http\Request::create('/api/student/dashboard', 'GET');
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $request->headers->set('Accept', 'application/json');
    
    $response = $app->handle($request);
    
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Response Body:\n";
    echo $response->getContent() . "\n";
    
} catch (Exception $e) {
    echo "Exception caught:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack Trace:\n";
    echo $e->getTraceAsString() . "\n";
}
