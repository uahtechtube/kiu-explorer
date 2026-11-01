<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\SystemAlert;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Programme;
use App\Models\AcademicSession;
use App\Models\StudentProfile;

class NotificationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $student;
    protected $lecturer;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed base structure
        $faculty = Faculty::create(['name' => 'Science', 'code' => 'SCI']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CSC']);
        $programme = Programme::create(['department_id' => $department->id, 'name' => 'B.Sc. Computer Science', 'code' => 'BSCCSC']);
        $session = AcademicSession::create(['name' => '2026/2027', 'is_active' => true]);

        // Create student
        $this->student = User::factory()->create([
            'role' => 'student',
            'email' => 'student@kiu.edu.ng',
            'matric_number' => 'KIU/CSC/26/1001'
        ]);

        StudentProfile::create([
            'user_id' => $this->student->id,
            'faculty_id' => $faculty->id,
            'department_id' => $department->id,
            'programme_id' => $programme->id,
            'academic_session_id' => $session->id,
        ]);

        // Create lecturer
        $this->lecturer = User::factory()->create([
            'role' => 'lecturer',
            'email' => 'lecturer@kiu.edu.ng'
        ]);
    }

    public function test_student_and_lecturer_can_fetch_unified_notifications_and_system_alerts()
    {
        // 1. Create a system alert in the database
        $systemAlert = SystemAlert::create([
            'type' => 'critical',
            'title' => 'Emergency Alert',
            'message' => 'The campus gates are closed due to weather conditions.',
            'severity' => 5,
        ]);

        // 2. Create a standard notification for the student
        $this->student->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\CustomNotification',
            'data' => [
                'title' => 'Personal Notification',
                'message' => 'Your assignment is graded.',
                'type' => 'academic',
            ],
        ]);

        // --- TEST STUDENT FEED ---
        $response = $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/student/notifications');

        $response->assertStatus(200);
        $data = $response->json('data');

        // Confirm both items exist
        $this->assertCount(2, $data);

        // Confirm correct types and formats
        $systemAlertItem = collect($data)->firstWhere('id', 'system-alert-' . $systemAlert->id);
        $this->assertNotNull($systemAlertItem);
        $this->assertEquals('Emergency Alert', $systemAlertItem['title']);
        $this->assertEquals('alert', $systemAlertItem['type']); // Critical maps to alert

        $personalNotificationItem = collect($data)->first(fn($item) => $item['id'] !== 'system-alert-' . $systemAlert->id);
        $this->assertNotNull($personalNotificationItem);
        $this->assertEquals('Personal Notification', $personalNotificationItem['title']);
        $this->assertEquals('academic', $personalNotificationItem['type']);

        // --- TEST LECTURER FEED ---
        // Lecturer doesn't have personal notifications, but should see the global system alert
        $responseLecturer = $this->actingAs($this->lecturer, 'sanctum')
            ->getJson('/api/student/notifications');

        $responseLecturer->assertStatus(200);
        $dataLecturer = $responseLecturer->json('data');

        $this->assertCount(1, $dataLecturer);
        $this->assertEquals('system-alert-' . $systemAlert->id, $dataLecturer[0]['id']);
        $this->assertEquals('Emergency Alert', $dataLecturer[0]['title']);
    }

    public function test_can_mark_system_alert_as_read_gracefully()
    {
        $response = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/student/notifications/read-all');
        $response->assertStatus(200);

        $responseSingle = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/student/notifications/system-alert-99/read');
        $responseSingle->assertStatus(200);
    }
}
