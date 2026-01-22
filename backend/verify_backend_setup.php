<?php

use App\Models\User;
use App\Models\LecturerProfile;
use App\Models\Course;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\AcademicSession;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Starting Verification ---\n";

// 1. Setup Prerequisites (Faculty, Dept, Session)
$faculty = Faculty::firstOrCreate(
    ['code' => 'SCI'],
    ['name' => 'Science', 'description' => 'Faculty of Science']
);
echo "[OK] Faculty verified: {$faculty->name}\n";

$dept = Department::firstOrCreate(
    ['code' => 'CSC'],
    ['name' => 'Computer Science', 'faculty_id' => $faculty->id]
);
echo "[OK] Department verified: {$dept->name}\n";

$session = AcademicSession::firstOrCreate(
    ['name' => '2025/2026'],
    ['is_current' => true]
);

// 2. Create Lecturer
$lecturer = User::updateOrCreate(
    ['email' => 'dr.test@kiu.edu.ng'],
    [
        'surname' => 'Test',
        'first_name' => 'Lecturer',
        'password' => bcrypt('password'),
        'role' => 'lecturer'
    ]
);

$lecturerProfile = LecturerProfile::updateOrCreate(
    ['user_id' => $lecturer->id],
    [
        'department_id' => $dept->id,
        'staff_id' => 'STF-' . rand(1000, 9999),
        'qualification' => 'PhD'
    ]
);
echo "[OK] Lecturer Profile created for: {$lecturer->first_name}\n";

// 3. Create Course
$course = Course::updateOrCreate(
    ['code' => 'CSC205'],
    [
        'title' => 'Introduction to Backend',
        'unit' => 3,
        'level' => '200',
        'semester' => 'First',
        'department_id' => $dept->id
    ]
);
echo "[OK] Course Created: {$course->code}\n";

// 4. Test Relationships
if ($lecturer->isLecturer()) {
   echo "[OK] isLecturer() helper works.\n"; 
} else {
   echo "[FAIL] isLecturer() helper failed.\n"; 
}

// 5. Allocation (Pivot)
$course->lecturers()->syncWithoutDetaching([
    $lecturer->id => ['academic_session_id' => $session->id, 'is_coordinator' => true]
]);
echo "[OK] Lecturer allocated to course.\n";

echo "--- Verification Complete ---\n";
