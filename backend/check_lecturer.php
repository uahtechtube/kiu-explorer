<?php

// Quick test script to check lecturer data
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check lecturer user
$lecturer = App\Models\User::where('email', 'lecturer@kiu.edu.ng')->first();

if (!$lecturer) {
    echo "❌ Lecturer user not found!\n";
    exit(1);
}

echo "✅ Lecturer found: {$lecturer->name} (ID: {$lecturer->id})\n";
echo "   Role: {$lecturer->role}\n\n";

// Check lecturer profile
$profile = $lecturer->lecturerProfile;
if ($profile) {
    echo "✅ Lecturer profile exists\n";
} else {
    echo "⚠️  No lecturer profile found - creating one...\n";
    $profile = App\Models\LecturerProfile::create([
        'user_id' => $lecturer->id,
        'department_id' => 1,
        'staff_id' => 'LEC-001',
    ]);
    echo "✅ Lecturer profile created\n";
}

// Check course allocations
$allocations = App\Models\CourseAllocation::where('user_id', $lecturer->id)->count();
echo "\n📚 Course allocations: {$allocations}\n";

if ($allocations == 0) {
    echo "⚠️  No course allocations found - creating test allocation...\n";
    
    // Get or create a test course
    $course = App\Models\Course::first();
    if ($course) {
        App\Models\CourseAllocation::create([
            'user_id' => $lecturer->id,
            'course_id' => $course->id,
            'academic_session_id' => 1,
        ]);
        echo "✅ Test course allocation created\n";
    }
}

echo "\n✅ All checks complete!\n";
