<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AcademicSession;
use App\Models\Department;
use App\Models\Course;
use App\Models\Announcement;
use App\Models\VirtualClass;
use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "🔧 Fixing Dashboard Data...\n\n";

try {
    // 1. Create Academic Session if missing
    $session = AcademicSession::firstOrCreate(
        ['name' => '2023/2024'],
        [
            'start_date' => '2023-09-01',
            'end_date' => '2024-08-31',
            'is_current' => true
        ]
    );
    echo "✅ Academic Session: {$session->name}\n";

    // 2. Create a Department if missing
    $department = Department::first();
    if (!$department) {
        echo "❌ No departments found. Please run: php artisan db:seed --class=AcademicStructureSeeder\n";
        exit(1);
    }
    echo "✅ Department: {$department->name}\n";

    // 3. Get student user
    $student = User::where('email', 'student@kiu.edu.ng')->first();
    if (!$student) {
        echo "❌ Student user not found!\n";
        exit(1);
    }
    echo "✅ Student: {$student->email}\n";

    // 4. Create sample courses if missing
    $courseCount = Course::count();
    if ($courseCount == 0) {
        Course::create([
            'code' => 'CSC301',
            'title' => 'Data Structures',
            'credit_hours' => 3,
            'department_id' => $department->id,
            'level' => '300',
            'semester' => 'First'
        ]);
        Course::create([
            'code' => 'CSC305',
            'title' => 'Database Systems',
            'credit_hours' => 3,
            'department_id' => $department->id,
            'level' => '300',
            'semester' => 'First'
        ]);
        echo "✅ Created 2 sample courses\n";
    } else {
        echo "✅ Courses: {$courseCount} found\n";
    }

    // 5. Create sample announcement if missing
    $announcementCount = Announcement::count();
    if ($announcementCount == 0) {
        Announcement::create([
            'title' => 'Welcome to KIU Explorer!',
            'content' => 'This is a sample announcement to test the dashboard.',
            'type' => 'general',
            'priority' => 'normal',
            'published_at' => now(),
            'expires_at' => now()->addDays(30)
        ]);
        echo "✅ Created sample announcement\n";
    } else {
        echo "✅ Announcements: {$announcementCount} found\n";
    }

    // 6. Create sample virtual class if missing
    $classCount = VirtualClass::count();
    if ($classCount == 0) {
        $course = Course::first();
        if ($course) {
            VirtualClass::create([
                'course_id' => $course->id,
                'title' => 'Introduction to ' . $course->title,
                'scheduled_at' => now()->addHours(2),
                'duration_minutes' => 60,
                'meeting_link' => 'https://meet.google.com/sample-link',
                'status' => 'scheduled'
            ]);
            echo "✅ Created sample virtual class\n";
        }
    } else {
        echo "✅ Virtual Classes: {$classCount} found\n";
    }

    echo "\n🎉 Dashboard data is ready!\n";
    echo "\n📋 Summary:\n";
    echo "- Academic Sessions: " . AcademicSession::count() . "\n";
    echo "- Departments: " . Department::count() . "\n";
    echo "- Courses: " . Course::count() . "\n";
    echo "- Announcements: " . Announcement::count() . "\n";
    echo "- Virtual Classes: " . VirtualClass::count() . "\n";
    echo "\n✨ Try refreshing your dashboard now!\n";

} catch (\Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
