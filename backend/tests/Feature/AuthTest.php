<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_registration()
    {
        // Seed mandatory academic records
        $faculty = \App\Models\Faculty::create(['name' => 'Science', 'code' => 'SCI']);
        $department = \App\Models\Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CSC']);
        $programme = \App\Models\Programme::create(['department_id' => $department->id, 'name' => 'B.Sc. Computer Science', 'code' => 'BSCCSC']);
        $session = \App\Models\AcademicSession::create(['name' => '2026/2027', 'is_active' => true]);

        $payload = [
            'surname' => 'Doe',
            'first_name' => 'John',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'matric_number' => 'KIU/2026/001',
            'faculty_id' => $faculty->id,
            'department_id' => $department->id,
            'programme_id' => $programme->id,
            'academic_session_id' => $session->id,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
        $this->assertDatabaseHas('student_profiles', [
            'department_id' => $department->id,
            'faculty_id' => $faculty->id
        ]);
    }
}
