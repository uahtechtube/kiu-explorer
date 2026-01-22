<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// ANSI Colors
$GREEN = "\033[32m";
$RED = "\033[31m";
$RESET = "\033[0m";
$BOLD = "\033[1m";

function print_header($title) {
    global $BOLD, $RESET;
    echo "\n" . $BOLD . "=== $title ===" . $RESET . "\n";
}

function make_request($method, $uri, $data = [], $token = null) {
    global $kernel;
    
    // Create Request
    $request = Illuminate\Http\Request::create($uri, $method, $data);
    $request->headers->set('Accept', 'application/json');
    if ($token) {
        $request->headers->set('Authorization', 'Bearer ' . $token);
    }
    
    // Handle
    $response = $kernel->handle($request);
    return [
        'status' => $response->getStatusCode(),
        'body' => json_decode($response->getContent(), true),
        'raw' => $response->getContent()
    ];
}

echo "Starting Backend Demonstration...\n";

// 1. Fetch Faculties (Public)
print_header("1. FETCHING FACULTIES (Public Endpoint)");
$res = make_request('GET', '/api/faculties');
if ($res['status'] == 200) {
    echo "{$GREEN}SUCCESS{$RESET}: Found " . count($res['body']) . " faculties.\n";
    echo "Sample: " . $res['body'][0]['name'] . "\n";
    $facultyId = $res['body'][0]['id'];
} else {
    echo "{$RED}FAILED{$RESET}: " . $res['raw'] . "\n";
    exit;
}

// 2. Fetch Departments (Public)
print_header("2. FETCHING DEPARTMENTS for Faculty ID $facultyId");
$res = make_request('GET', "/api/faculties/$facultyId/departments");
if ($res['status'] == 200) {
    echo "{$GREEN}SUCCESS{$RESET}: Found " . count($res['body']) . " departments.\n";
    echo "Sample: " . $res['body'][0]['name'] . "\n";
    $deptId = $res['body'][0]['id'];
} else {
    echo "{$RED}FAILED{$RESET}\n";
}

// 3. Fetch Programmes (Public)
print_header("3. FETCHING PROGRAMMES for Dept ID $deptId");
$res = make_request('GET', "/api/departments/$deptId/programmes");
if ($res['status'] == 200) {
    echo "{$GREEN}SUCCESS{$RESET}: Found " . count($res['body']) . " programmes.\n";
    echo "Sample: " . $res['body'][0]['name'] . "\n";
    $progId = $res['body'][0]['id'];
} else {
    echo "{$RED}FAILED{$RESET}\n";
}

// 4. Fetch Sessions
$res = make_request('GET', '/api/academic-sessions');
$sessionId = $res['body'][0]['id'];

// 5. Register Student
print_header("4. REGISTERING NEW STUDENT");
$email = 'demo_user_' . time() . '@kiu.edu.ng';
$password = 'password123';
$userData = [
    'surname' => 'Doe',
    'first_name' => 'John',
    'email' => $email,
    'password' => $password,
    'password_confirmation' => $password,
    // Academic Info
    'faculty_id' => $facultyId,
    'department_id' => $deptId,
    'programme_id' => $progId,
    'academic_session_id' => $sessionId,
    'matric_number' => 'KIU/2026/' . rand(1000,9999)
];

$res = make_request('POST', '/api/register', $userData);

if ($res['status'] == 201) {
    echo "{$GREEN}SUCCESS{$RESET}: User registered!\n";
    echo "User ID: " . $res['body']['user']['user_id'] . "\n";
    echo "Email: " . $res['body']['user']['email'] . "\n";
    $token = $res['body']['token'];
} else {
    echo "{$RED}FAILED{$RESET}: " . json_encode($res['body']) . "\n";
    $token = null;
}

// 6. Access Protected Route (User Profile)
if ($token) {
    print_header("5. ACCESSING PROTECTED PROFILE via TOKEN");
    $res = make_request('GET', '/api/user', [], $token);
    
    if ($res['status'] == 200) {
        echo "{$GREEN}SUCCESS{$RESET}: Authenticated as " . $res['body']['surname'] . " " . $res['body']['first_name'] . "\n";
    } else {
        echo "{$RED}FAILED{$RESET}: Could not access profile.\n";
    }
}

echo "\n" . $BOLD . "DEMONSTRATION COMPLETE." . $RESET . "\n";
