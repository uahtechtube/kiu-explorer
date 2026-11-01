<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\VirtualClass;
use App\Models\Attendance;
use App\Models\StudentProfile;
use App\Models\GeneralAttendance;

class VirtualClassAndReportsTest extends TestCase
{
    use RefreshDatabase;

    protected $student;
    protected $lecturer;
    protected $admin;
    protected $course;
    protected $virtualClass;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed academic models
        $faculty = \App\Models\Faculty::create(['name' => 'Science', 'code' => 'SCI']);
        $department = \App\Models\Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CSC']);
        $programme = \App\Models\Programme::create(['department_id' => $department->id, 'name' => 'B.Sc. Computer Science', 'code' => 'BSCCSC']);
        $session = \App\Models\AcademicSession::create(['name' => '2026/2027', 'is_active' => true]);

        // 1. Seed base users
        $this->student = User::factory()->create([
            'role' => 'student',
            'surname' => 'Audu',
            'first_name' => 'Garba',
            'email' => 'garba@kiu.edu.ng',
            'matric_number' => 'KIU/CSC/26/1001'
        ]);

        StudentProfile::create([
            'user_id' => $this->student->id,
            'faculty_id' => $faculty->id,
            'department_id' => $department->id,
            'programme_id' => $programme->id,
            'academic_session_id' => $session->id,
        ]);

        $this->lecturer = User::factory()->create([
            'role' => 'lecturer',
            'surname' => 'Ibrahim',
            'first_name' => 'Bello',
            'email' => 'bello@kiu.edu.ng'
        ]);

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'surname' => 'Mustapha',
            'first_name' => 'Adamu',
            'email' => 'adamu@kiu.edu.ng'
        ]);

        // 2. Create course
        $this->course = Course::create([
            'department_id' => $department->id,
            'code' => 'CSC 401',
            'title' => 'Introduction to Software Engineering',
            'unit' => 3,
            'level' => '400',
            'semester' => 'First',
            'description' => 'Software engineering principles and SDLC'
        ]);

        // 3. Create virtual class
        $this->virtualClass = VirtualClass::create([
            'course_id' => $this->course->id,
            'lecturer_id' => $this->lecturer->id,
            'title' => 'SDLC Methodologies Live Session',
            'description' => 'Interactive session on Agile and Waterfall models',
            'scheduled_at' => now()->addMinutes(30),
            'duration' => 60,
            'status' => 'upcoming',
            'is_chat_muted' => false
        ]);
    }

    /**
     * Test student joining a class and raising hand
     */
    public function test_student_joins_and_raises_hand()
    {
        // 1. Start class as lecturer
        $this->actingAs($this->lecturer)
             ->postJson("/api/virtual-classes/{$this->virtualClass->id}/start")
             ->assertStatus(200);

        // 2. Join class as student (which creates attendance)
        $this->actingAs($this->student)
             ->postJson("/api/virtual-classes/{$this->virtualClass->id}/join")
             ->assertStatus(200);

        $this->assertDatabaseHas('attendances', [
            'virtual_class_id' => $this->virtualClass->id,
            'user_id' => $this->student->id,
            'status' => 'present'
        ]);

        // 3. Raise hand
        $response = $this->actingAs($this->student)
             ->postJson("/api/student/virtual-classes/{$this->virtualClass->id}/raise-hand");

        $response->assertStatus(200)
                 ->assertJson([
                     'is_hand_raised' => true
                 ]);

        $this->assertDatabaseHas('attendances', [
            'virtual_class_id' => $this->virtualClass->id,
            'user_id' => $this->student->id,
            'is_hand_raised' => true
        ]);
    }

    /**
     * Test chat muting and posting restrictions
     */
    public function test_chat_muting_enforcement()
    {
        // 1. Join class so attendance and chat can begin
        $this->actingAs($this->lecturer)
             ->postJson("/api/virtual-classes/{$this->virtualClass->id}/start");
        $this->actingAs($this->student)
             ->postJson("/api/virtual-classes/{$this->virtualClass->id}/join");

        // 2. Lecturer mutes chat
        $this->actingAs($this->lecturer)
             ->postJson("/api/lecturer/virtual-classes/{$this->virtualClass->id}/toggle-chat-mute")
             ->assertStatus(200)
             ->assertJson([
                 'is_chat_muted' => true
             ]);

        // 3. Student tries to post a message (should be blocked)
        $this->actingAs($this->student)
             ->postJson("/api/student/virtual-classes/{$this->virtualClass->id}/chat", [
                 'message' => 'Hello lecturer, I have a question.'
             ])
             ->assertStatus(403)
             ->assertJson([
                 'message' => 'The classroom chat has been muted by the moderator.'
             ]);

        // 4. Lecturer unmutes chat
        $this->actingAs($this->lecturer)
             ->postJson("/api/lecturer/virtual-classes/{$this->virtualClass->id}/toggle-chat-mute")
             ->assertStatus(200)
             ->assertJson([
                 'is_chat_muted' => false
             ]);

        // 5. Student posts message again (should succeed)
        $this->actingAs($this->student)
             ->postJson("/api/student/virtual-classes/{$this->virtualClass->id}/chat", [
                 'message' => 'Hello, is it unmuted now?'
             ])
             ->assertStatus(200);

        $this->assertDatabaseHas('virtual_class_messages', [
            'virtual_class_id' => $this->virtualClass->id,
            'user_id' => $this->student->id,
            'message' => 'Hello, is it unmuted now?'
        ]);
    }

    /**
     * Test Reports Exporter CSV Downloads
     */
    public function test_reports_exporter_csv_downloads()
    {
        // Add general attendance logs
        GeneralAttendance::create([
            'student_id' => $this->student->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'present'
        ]);

        // 1. Test Student Academic Report CSV Download
        $academicRes = $this->actingAs($this->student)
             ->get("/api/reports/academic?format=csv");

        $academicRes->assertStatus(200);
        $academicRes->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        
        ob_start();
        $academicRes->sendContent();
        $academicContent = ob_get_clean();
        $this->assertStringContainsString('ACADEMIC PERFORMANCE REPORT', $academicContent);
        $this->assertStringContainsString($this->student->name, $academicContent);

        // 2. Test Student Attendance Audit Report CSV Download
        $attendanceRes = $this->actingAs($this->student)
             ->get("/api/reports/attendance?format=csv");

        $attendanceRes->assertStatus(200);
        $attendanceRes->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        
        ob_start();
        $attendanceRes->sendContent();
        $attendanceContent = ob_get_clean();
        $this->assertStringContainsString('ATTENDANCE AUDIT LOG', $attendanceContent);
        $this->assertStringContainsString('PRESENT', $attendanceContent);

        // 3. Test Admin System Analytics CSV Download
        $systemRes = $this->actingAs($this->admin)
             ->get("/api/reports/system-usage?format=csv");

        $systemRes->assertStatus(200);
        $systemRes->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        
        ob_start();
        $systemRes->sendContent();
        $systemContent = ob_get_clean();
        $this->assertStringContainsString('SYSTEM ANALYTICS & LOGISTICS REPORT', $systemContent);
        $this->assertStringContainsString('Total Registered Users:', $systemContent);
    }

    /**
     * Test student dashboard returns real database metrics
     */
    public function test_student_dashboard_real_data()
    {
        // 1. Create a registration for our student in a course
        $academicSession = \App\Models\AcademicSession::first();
        
        \App\Models\CourseRegistration::create([
            'user_id' => $this->student->id,
            'course_id' => $this->course->id,
            'academic_session_id' => $academicSession->id,
            'total_score' => 85.00, // Generates grade 'A'
            'status' => 'registered'
        ]);

        // 2. Fetch student dashboard
        $response = $this->actingAs($this->student)
             ->getJson('/api/student/dashboard');

        // 3. Assertions
        $response->assertStatus(200)
                 ->assertJsonPath('student.matric_number', $this->student->matric_number)
                 ->assertJsonPath('overview.enrolled_courses', 1)
                 ->assertJsonPath('overview.cgpa', '5.00'); // Grade point of A (score 85) is 5.00
    }

    /**
     * Test student logout revokes access token
     */
    public function test_student_logout()
    {
        $response = $this->actingAs($this->student)
             ->postJson('/api/auth/logout');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Logged out successfully.'
                 ]);
    }

    /**
     * Test lecturer scheduling a virtual class and sending notifications to students
     */
    public function test_lecturer_schedules_class_and_notifies_students()
    {
        // 1. Enroll student in the course
        $session = \App\Models\AcademicSession::first();
        \App\Models\CourseRegistration::create([
            'user_id' => $this->student->id,
            'course_id' => $this->course->id,
            'academic_session_id' => $session->id,
            'status' => 'registered'
        ]);

        // 2. Schedule a class as lecturer
        $classData = [
            'course_id' => $this->course->id,
            'title' => 'SDLC Methodologies Part 2',
            'description' => 'Continuation of agile and scrum methodologies',
            'scheduled_at' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'duration' => 90,
            'meeting_link' => 'https://meet.jit.si/csc-401-sdlc-2'
        ];

        $response = $this->actingAs($this->lecturer)
             ->postJson('/api/virtual-classes', $classData);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Virtual class scheduled successfully');

        // 3. Assert database has the virtual class
        $this->assertDatabaseHas('virtual_classes', [
            'course_id' => $this->course->id,
            'lecturer_id' => $this->lecturer->id,
            'title' => 'SDLC Methodologies Part 2'
        ]);

        // 4. Assert database notifications table has the notification entry
        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $this->student->id,
            'type' => 'App\Notifications\GenericNotification'
        ]);

        // 5. Fetch notification as student and verify the format
        $notificationResponse = $this->actingAs($this->student)
             ->getJson('/api/student/notifications');

        $notificationResponse->assertStatus(200)
             ->assertJsonStructure([
                 'data' => [
                     '*' => [
                         'id',
                         'title',
                         'message',
                         'type',
                         'created_at',
                         'is_read'
                     ]
                 ]
             ]);

        // Check content of the notification
        $data = $notificationResponse->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('New Virtual Class Scheduled', $data[0]['title']);
        $this->assertStringContainsString('SDLC Methodologies Part 2', $data[0]['message']);
        $this->assertEquals('academic', $data[0]['type']);
        $this->assertFalse($data[0]['is_read']);
    }
}
