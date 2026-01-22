<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Course;
use App\Models\Department;
use App\Models\VirtualClass;

class VirtualClassSeeder extends Seeder
{
    public function run()
    {
        // 1. Ensure a DEPARTMENT exists (should from AcademicStructureSeeder)
        $department = Department::first();
        if (!$department) {
            // Fallback create one if empty
             $departmentId = DB::table('departments')->insertGetId([
                'name' => 'Department of Computer Science',
                'faculty_id' => 1, // Assume ID 1 exists or let it fail/null if no constraint
                 'created_at' => now(), 'updated_at' => now()
            ]);
        } else {
            $departmentId = $department->id;
        }

        // 2. Ensure a LECTURER exists
        $lecturer = User::where('role', 'lecturer')->first();
        if (!$lecturer) {
            $lecturer = User::create([
                'surname' => 'Ibrahim',
                'first_name' => 'Dr.',
                'other_names' => 'Aliyu',
                'email' => 'lecturer@kiu.edu.ng',
                'password' => Hash::make('password'),
                'role' => 'lecturer',
                'gender' => 'Male',
                'phone_number' => '08011111111',
                'username' => 'dr_ibrahim',
                'account_status' => 'active',
            ]);
            $this->command->info('Created Demo Lecturer: Dr. Ibrahim');
        }

        // 3. Ensure a COURSE exists
        $course = Course::where('code', 'GST 111')->first();
        if (!$course) {
            $course = Course::create([
                'department_id' => $departmentId,
                'code' => 'GST 111',
                'title' => 'Communication in English',
                'unit' => 2,
                'level' => '100',
                'semester' => 'First',
                'description' => 'Introduction to effective communication skills.',
                'is_elective' => false,
            ]);
            $this->command->info('Created Demo Course: GST 111');
        }

         // 4. Ensure another COURSE exists
        $course2 = Course::where('code', 'CSC 101')->first();
         if (!$course2) {
            $course2 = Course::create([
                'department_id' => $departmentId,
                'code' => 'CSC 101',
                'title' => 'Introduction to Computer Science',
                'unit' => 3,
                'level' => '100',
                'semester' => 'First',
                'description' => 'Fundamental concepts of computing.',
                'is_elective' => false,
            ]);
             $this->command->info('Created Demo Course: CSC 101');
        }

        // 5. Seed Virtual Classes
        VirtualClass::create([
            'course_id' => $course->id,
            'lecturer_id' => $lecturer->id,
            'title' => 'Effective Listening Skills',
            'description' => 'Techniques for active listening.',
            'scheduled_at' => Carbon::tomorrow()->setHour(10)->setMinute(0),
            'meeting_link' => 'https://meet.google.com/test-link-1',
            'status' => 'upcoming',
        ]);

        VirtualClass::create([
            'course_id' => $course2->id,
            'lecturer_id' => $lecturer->id,
            'title' => 'History of Computing',
            'description' => 'From Abacus to Modern PCs.',
            'scheduled_at' => Carbon::tomorrow()->addDay()->setHour(14)->setMinute(0),
            'meeting_link' => 'https://meet.google.com/test-link-2',
            'status' => 'upcoming',
        ]);

        VirtualClass::create([
            'course_id' => $course->id,
            'lecturer_id' => $lecturer->id,
            'title' => 'Writing Skills Workshop',
             'description' => 'Improving academic writing.',
            'scheduled_at' => Carbon::today()->subHour(2), // Past/Active
            'meeting_link' => 'https://meet.google.com/test-link-3',
            'status' => 'active',
        ]);
        
        $this->command->info('Seeded 3 Virtual Classes.');
    }
}
