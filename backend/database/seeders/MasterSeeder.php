<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Department;
use App\Models\VirtualClass;
use App\Models\Announcement;
use App\Models\LibraryResource;
use App\Models\Event;
use App\Models\Association;
use App\Models\StudentProfile;
use App\Models\CampusLocation;
use App\Models\AcademicCalendar;
use App\Models\StaffDirectory;
use Carbon\Carbon;

class MasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Run Core Structure
        $this->call(AcademicStructureSeeder::class);
        $this->command->info('Academic Structure Seeded.');

        // 2. Create Users
        $defaultAvatar = 'assets/defaults/avatar.png';

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@kiu.edu.ng'],
            [
                'user_id' => 'ADMIN-001',
                'surname' => 'Admin',
                'first_name' => 'System',
                'email' => 'admin@kiu.edu.ng',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'username' => 'admin',
                'passport_photograph' => $defaultAvatar,
                'account_status' => 'active',
            ]
        );

        // Lecturer
        $lecturer = User::firstOrCreate(
            ['email' => 'lecturer@kiu.edu.ng'],
            [
                'user_id' => 'LEC-001',
                'surname' => 'Ibrahim',
                'first_name' => 'Dr. Ali',
                'email' => 'lecturer@kiu.edu.ng',
                'password' => Hash::make('password'),
                'role' => 'lecturer',
                'username' => 'ali_lecturer',
                'passport_photograph' => $defaultAvatar,
                'account_status' => 'active',
            ]
        );

        // Student
        $student = User::firstOrCreate(
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
                'passport_photograph' => $defaultAvatar,
                'account_status' => 'active',
                'gender' => 'Male',
                'nationality' => 'Nigerian',
                'state_of_origin' => 'Kano',
                'lga' => 'Kano Municipal',
                'phone_number' => '08012345678',
            ]
        );

        // Student Profile (without matric_number - it's in users table)
        $department = Department::where('name', 'Computer Science')->first();
        StudentProfile::updateOrCreate(
            ['user_id' => $student->id],
            [
                'department_id' => $department?->id ?? 1,
                'level' => '300',
                'academic_session_id' => 1,
            ]
        );

        // 3. Courses
        $course1 = Course::firstOrCreate(
            ['code' => 'CSC 301'],
            [
                'department_id' => 1,
                'title' => 'Database Management Systems',
                'unit' => 3,
                'level' => '300',
                'semester' => 'First',
            ]
        );

        $course2 = Course::firstOrCreate(
            ['code' => 'CSC 305'],
            [
                'department_id' => 1,
                'title' => 'Operating Systems I',
                'unit' => 3,
                'level' => '300',
                'semester' => 'First',
            ]
        );

        // 4. Announcements
        Announcement::create([
            'title' => 'First Semester Registration Deadline',
            'content' => 'All students are advised to complete their course registration by the end of this month.',
            'type' => 'academic',
            'target_audience' => 'students',
            'priority' => 'high',
            'published_by' => $admin->id,
            'published_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        Announcement::create([
            'title' => 'New Library Resources Available',
            'content' => 'We have added new digital textbooks for Computer Science students.',
            'type' => 'general',
            'target_audience' => 'all',
            'priority' => 'low',
            'published_by' => $admin->id,
            'published_at' => now(),
        ]);

        // 5. Virtual Classes
        VirtualClass::create([
            'course_id' => $course1->id,
            'lecturer_id' => $lecturer->id,
            'title' => 'SQL Queries Workshop',
            'scheduled_at' => now()->addDays(1)->setHour(10),
            'duration' => 60,
            'status' => 'upcoming',
        ]);

        // 6. Events
        Event::create([
            'title' => 'University Cultural Week',
            'description' => 'A week-long celebration of diversity and culture at KIU.',
            'start_time' => now()->addDays(7),
            'venue' => 'Main Convocation Square',
            'category' => 'Social',
            'capacity' => 500,
            'status' => 'upcoming',
            'created_by' => $admin->id,
        ]);

        // 7. Associations
        Association::create([
            'name' => 'National Association of Computer Science Students (NACOSS)',
            'description' => 'The umbrella body for all computing students.',
            'type' => 'academic',
        ]);

        // 8. Library
        LibraryResource::create([
            'title' => 'Mastering Laravel 11',
            'author' => 'Taylor Otwell',
            'category' => 'textbook',
            'description' => 'Modern web development with PHP.',
            'file_type' => 'PDF',
            'file_path' => 'library/sample.pdf',
            'file_size' => 1024000, // 1MB in bytes
            'uploaded_by' => $admin->id,
            'is_approved' => true,
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        // 9. Social Hub Posts
        \App\Models\Post::create([
            'user_id' => $student->id,
            'content' => 'Just finished the first lecture on Database Systems. KIU Explorer makes it so easy to follow up with tutorials! #KIU #ComputerScience',
            'type' => 'social',
        ]);

        \App\Models\Post::create([
            'user_id' => $student->id,
            'content' => 'Anyone joining the SQL workshop tomorrow? Let’s group up!',
            'type' => 'social',
        ]);

        // 10. Campus Locations
        CampusLocation::create([
            'name' => 'Faculty of Law',
            'type' => 'building',
            'description' => 'The administrative and academic building for the Faculty of Law.',
            'building_code' => 'FLW-01',
            'is_active' => true,
        ]);

        CampusLocation::create([
            'name' => 'Main Library',
            'type' => 'library',
            'description' => 'The central university library with vast collections.',
            'building_code' => 'LIB-01',
            'is_active' => true,
        ]);

        // 11. Academic Calendar
        AcademicCalendar::create([
            'title' => 'First Semester Examination Period',
            'description' => 'End of semester examinations for all students.',
            'type' => 'exam',
            'start_date' => Carbon::now()->addMonths(2),
            'end_date' => Carbon::now()->addMonths(2)->addWeeks(3),
            'academic_session' => '2025/2026',
            'semester' => 'First',
            'color' => '#EF4444',
            'is_public' => true,
        ]);

        AcademicCalendar::create([
            'title' => 'Matriculation Ceremony',
            'description' => 'Official induction ceremony for new students.',
            'type' => 'event',
            'start_date' => Carbon::now()->addWeeks(2),
            'end_date' => Carbon::now()->addWeeks(2),
            'academic_session' => '2025/2026',
            'semester' => 'First',
            'color' => '#3B82F6',
            'is_public' => true,
        ]);

        // 12. Staff Directory
        StaffDirectory::create([
            'staff_id' => 'STF-001',
            'title' => 'Prof.',
            'surname' => 'Okonkwo',
            'first_name' => 'Chidi',
            'position' => 'Dean of Science',
            'department_id' => $department->id,
            'email' => 'dean.science@kiu.edu.ng',
            'is_active' => true,
        ]);

        $this->command->info('Master Seeding Finished Successfully!');
    }
}
