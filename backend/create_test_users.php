<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

echo "Creating test users...\n\n";

// Admin
$admin = User::updateOrCreate(
    ['email' => 'admin@kiu.edu.ng'],
    [
        'user_id' => 'ADMIN-001',
        'surname' => 'Admin',
        'first_name' => 'System',
        'email' => 'admin@kiu.edu.ng',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'username' => 'admin',
        'account_status' => 'active',
        'gender' => 'Male',
        'nationality' => 'Nigerian',
    ]
);
echo "✅ Admin created: admin@kiu.edu.ng\n";

// Lecturer
$lecturer = User::updateOrCreate(
    ['email' => 'lecturer@kiu.edu.ng'],
    [
        'user_id' => 'LEC-001',
        'surname' => 'Ibrahim',
        'first_name' => 'Dr. Ali',
        'email' => 'lecturer@kiu.edu.ng',
        'password' => Hash::make('password'),
        'role' => 'lecturer',
        'username' => 'ali_lecturer',
        'account_status' => 'active',
        'gender' => 'Male',
        'nationality' => 'Nigerian',
    ]
);
echo "✅ Lecturer created: lecturer@kiu.edu.ng\n";

// Student
$student = User::updateOrCreate(
    ['email' => 'student@kiu.edu.ng'],
    [
        'user_id' => 'STU-001',
        'matric_number' => 'KIU/2023/CSC/001',
        'surname' => 'Musa',
        'first_name' => 'Abubakar',
        'email' => 'student@kiu.edu.ng',
        'password' => Hash::make('password'),
        'role' => 'student',
        'username' => 'abubakar_musa',
        'account_status' => 'active',
        'gender' => 'Male',
        'nationality' => 'Nigerian',
        'state_of_origin' => 'Kano',
        'phone_number' => '08012345678',
    ]
);
echo "✅ Student created: student@kiu.edu.ng\n";

// Student Profile
$department = Department::first();
if ($department) {
    StudentProfile::updateOrCreate(
        ['user_id' => $student->id],
        [
            'department_id' => $department->id,
            'level' => '300',
            'academic_session_id' => 1,
        ]
    );
    echo "✅ Student profile created\n";
}

echo "\n🎉 All test users created successfully!\n";
echo "\nLogin credentials:\n";
echo "- Admin: admin@kiu.edu.ng / password\n";
echo "- Lecturer: lecturer@kiu.edu.ng / password\n";
echo "- Student: student@kiu.edu.ng / password\n";
