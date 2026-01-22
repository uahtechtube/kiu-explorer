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
        $payload = [
            'surname' => 'Doe',
            'first_name' => 'John',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'matric_number' => 'KIU/2026/001',
            'faculty' => 'Science',
            'department' => 'Computer Science'
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
        $this->assertDatabaseHas('student_profiles', ['department' => 'Computer Science']);
    }
}
