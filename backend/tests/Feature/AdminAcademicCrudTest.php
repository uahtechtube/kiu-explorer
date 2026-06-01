<?php

namespace Tests\Feature;

use App\Models\Faculty;
use App\Models\Department;
use App\Models\Programme;
use App\Models\AcademicSession;
use App\Models\CampusLocation;
use App\Models\User;
use App\Models\StaffDirectory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAcademicCrudTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Admin user for authenticated CRUD actions
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'account_status' => 'active'
        ]);
    }

    /**
     * Test staff directory dynamic parent faculty resolution (fixes the 1452 foreign key bug)
     */
    public function test_staff_directory_dynamic_parent_resolution()
    {
        // 1. Ensure faculties table is completely empty
        Faculty::truncate();
        $this->assertEquals(0, Faculty::count());

        // 2. Attempt to create a staff directory profile that dynamically creates a department
        $payload = [
            'staff_id' => 'STAFF-100',
            'title' => 'Dr.',
            'surname' => 'Ahmed',
            'first_name' => 'Garba',
            'position' => 'Senior Lecturer',
            'department' => 'Computer Science',
            'office_location' => 'Block A, Office 12',
            'email' => 'garba.ahmed@kiu.edu.ng',
            'phone' => '08031234567',
        ];

        // Perform request as admin
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/school/staff', $payload);

        // 3. Confirm response is successful (HTTP 201 Created)
        $response->assertStatus(201);

        // 4. Confirm a default Faculty was dynamically created to satisfy the foreign key constraint
        $this->assertEquals(1, Faculty::count());
        $faculty = Faculty::first();
        $this->assertEquals('SCI', $faculty->code);

        // 5. Confirm the department was created under the new dynamic faculty
        $this->assertEquals(1, Department::count());
        $dept = Department::first();
        $this->assertEquals('Computer Science', $dept->name);
        $this->assertEquals($faculty->id, $dept->faculty_id);

        // 6. Confirm the staff directory record has the correct department and faculty bindings
        $staff = StaffDirectory::first();
        $this->assertEquals($dept->id, $staff->department_id);
        $this->assertEquals($faculty->id, $staff->faculty_id);
    }

    /**
     * Test Faculties CRUD operations and defensive deletion lockouts
     */
    public function test_admin_faculty_crud()
    {
        // 1. Create a Faculty
        $payload = [
            'name' => 'Faculty of Engineering',
            'code' => 'ENG',
            'description' => 'College of Engineering studies'
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admin/faculties', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('faculties', ['code' => 'ENG']);
        $facultyId = $response->json('data.id');

        // 2. Update the Faculty
        $updatePayload = [
            'name' => 'Faculty of Engineering and Tech',
            'description' => 'Updated description'
        ];

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/faculties/{$facultyId}", $updatePayload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('faculties', [
            'id' => $facultyId,
            'name' => 'Faculty of Engineering and Tech',
            'description' => 'Updated description'
        ]);

        // 3. Eager load count list
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/faculties');
        $response->assertStatus(200);

        // 4. Test defensive check lockout: create a department under it
        $dept = Department::create([
            'faculty_id' => $facultyId,
            'name' => 'Civil Engineering',
            'code' => 'CIV'
        ]);

        // Deleting should fail (HTTP 400) because a child department is bound to it
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/admin/faculties/{$facultyId}");
        $response->assertStatus(400);
        $response->assertJsonFragment([
            'message' => 'Cannot delete Faculty. Please delete or reassign its Departments first.'
        ]);

        // Delete department first
        $dept->delete();

        // Deleting should succeed now
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/admin/faculties/{$facultyId}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('faculties', ['id' => $facultyId]);
    }

    /**
     * Test Academic Sessions singleton current/active status logic
     */
    public function test_admin_session_singleton_activation()
    {
        // 1. Create two academic sessions
        $session1 = AcademicSession::create([
            'name' => '2024/2025',
            'is_current' => true,
            'start_date' => '2024-09-01',
            'end_date' => '2025-07-31'
        ]);

        $session2 = AcademicSession::create([
            'name' => '2025/2026',
            'is_current' => false,
            'start_date' => '2025-09-01',
            'end_date' => '2026-07-31'
        ]);

        $this->assertTrue($session1->fresh()->is_current);
        $this->assertFalse($session2->fresh()->is_current);

        // 2. Set Session 2 as active via API update
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/sessions/{$session2->id}", [
                'is_current' => true
            ]);

        $response->assertStatus(200);

        // 3. Confirm Session 2 became active while Session 1 was automatically set to inactive
        $this->assertFalse($session1->fresh()->is_current);
        $this->assertTrue($session2->fresh()->is_current);
    }

    /**
     * Test Campus Offices CRUD operations inside campus_locations
     */
    public function test_admin_office_crud()
    {
        // 1. Create an Office location
        $payload = [
            'name' => 'Admissions Unit',
            'description' => 'Main block admissions office',
            'operating_hours' => '9:00 AM - 4:00 PM',
            'contact_phone' => '08099998888',
            'contact_email' => 'admissions@kiu.edu.ng',
            'building_code' => 'ADMIN',
            'floor_number' => 1
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admin/offices', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('campus_locations', [
            'name' => 'Admissions Unit',
            'type' => 'office',
            'building_code' => 'ADMIN'
        ]);
        $officeId = $response->json('data.id');

        // 2. Update the Office
        $updatePayload = [
            'operating_hours' => '8:00 AM - 5:00 PM',
            'floor_number' => 2
        ];

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/offices/{$officeId}", $updatePayload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('campus_locations', [
            'id' => $officeId,
            'operating_hours' => '8:00 AM - 5:00 PM',
            'floor_number' => 2
        ]);

        // 3. List offices and verify it returns only type = office
        // Let's create a library point location to make sure it doesn't leak into offices list
        CampusLocation::create([
            'name' => 'Main Library Center',
            'type' => 'library',
            'is_active' => true
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/offices');

        $response->assertStatus(200);
        $response->assertJsonCount(1); // Only the admissions office should be returned
        $response->assertJsonFragment(['name' => 'Admissions Unit']);

        // 4. Delete office
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/admin/offices/{$officeId}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('campus_locations', ['id' => $officeId]);
    }
}
