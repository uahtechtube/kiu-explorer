<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Department;
use App\Models\Programme;
use App\Models\AcademicSession;
use App\Models\CampusLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminAcademicController extends Controller
{
    // ==========================================
    // FACULTY CRUD
    // ==========================================

    public function getFaculties()
    {
        return response()->json(Faculty::withCount('departments')->get());
    }

    public function storeFaculty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:faculties,name',
            'code' => 'required|string|max:50|unique:faculties,code',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $faculty = Faculty::create($request->all());

        return response()->json([
            'message' => 'Faculty created successfully.',
            'data' => $faculty
        ], 201);
    }

    public function updateFaculty(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:faculties,name,' . $id,
            'code' => 'sometimes|required|string|max:50|unique:faculties,code,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $faculty->update($request->all());

        return response()->json([
            'message' => 'Faculty updated successfully.',
            'data' => $faculty
        ]);
    }

    public function destroyFaculty($id)
    {
        $faculty = Faculty::findOrFail($id);

        // Defensive check: prevent orphaned departments
        if ($faculty->departments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete Faculty. Please delete or reassign its Departments first.'
            ], 400);
        }

        $faculty->delete();

        return response()->json([
            'message' => 'Faculty deleted successfully.'
        ]);
    }


    // ==========================================
    // DEPARTMENT CRUD
    // ==========================================

    public function getDepartments()
    {
        return response()->json(Department::with(['faculty'])->withCount('programmes')->get());
    }

    public function storeDepartment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'faculty_id' => 'required|exists:faculties,id',
            'name' => 'required|string|max:255|unique:departments,name',
            'code' => 'required|string|max:50|unique:departments,code',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $department = Department::create($request->all());

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => $department->load('faculty')
        ], 201);
    }

    public function updateDepartment(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'faculty_id' => 'sometimes|required|exists:faculties,id',
            'name' => 'sometimes|required|string|max:255|unique:departments,name,' . $id,
            'code' => 'sometimes|required|string|max:50|unique:departments,code,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $department->update($request->all());

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => $department->load('faculty')
        ]);
    }

    public function destroyDepartment($id)
    {
        $department = Department::findOrFail($id);

        // Defensive check: prevent orphaned programmes
        if ($department->programmes()->exists()) {
            return response()->json([
                'message' => 'Cannot delete Department. Please delete or reassign its Programmes first.'
            ], 400);
        }

        $department->delete();

        return response()->json([
            'message' => 'Department deleted successfully.'
        ]);
    }


    // ==========================================
    // PROGRAMME CRUD
    // ==========================================

    public function getProgrammes()
    {
        return response()->json(Programme::with(['department.faculty'])->get());
    }

    public function storeProgramme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255|unique:programmes,name',
            'degree_type' => 'required|string|max:50',
            'duration' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $programme = Programme::create($request->all());

        return response()->json([
            'message' => 'Programme created successfully.',
            'data' => $programme->load('department.faculty')
        ], 201);
    }

    public function updateProgramme(Request $request, $id)
    {
        $programme = Programme::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'department_id' => 'sometimes|required|exists:departments,id',
            'name' => 'sometimes|required|string|max:255|unique:programmes,name,' . $id,
            'degree_type' => 'sometimes|required|string|max:50',
            'duration' => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $programme->update($request->all());

        return response()->json([
            'message' => 'Programme updated successfully.',
            'data' => $programme->load('department.faculty')
        ]);
    }

    public function destroyProgramme($id)
    {
        $programme = Programme::findOrFail($id);

        // Defensive check: prevent breaking student profile relationships
        $hasStudents = DB::table('student_profiles')->where('programme_id', $id)->exists();
        if ($hasStudents) {
            return response()->json([
                'message' => 'Cannot delete Programme. Registered students are currently enrolled in it.'
            ], 400);
        }

        $programme->delete();

        return response()->json([
            'message' => 'Programme deleted successfully.'
        ]);
    }


    // ==========================================
    // ACADEMIC SESSIONS CRUD
    // ==========================================

    public function getSessions()
    {
        return response()->json(AcademicSession::orderBy('name', 'desc')->get());
    }

    public function storeSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:academic_sessions,name',
            'is_current' => 'required|boolean',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $session = DB::transaction(function () use ($request) {
            $isCurrent = $request->is_current;

            if ($isCurrent) {
                // Singleton active logic: turn off all other current marks
                AcademicSession::where('is_current', true)->update(['is_current' => false]);
            }

            return AcademicSession::create($request->all());
        });

        return response()->json([
            'message' => 'Academic Session created successfully.',
            'data' => $session
        ], 201);
    }

    public function updateSession(Request $request, $id)
    {
        $session = AcademicSession::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:50|unique:academic_sessions,name,' . $id,
            'is_current' => 'sometimes|required|boolean',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::transaction(function () use ($request, $session) {
            if ($request->has('is_current') && $request->is_current) {
                // Singleton active logic: turn off all other current marks
                AcademicSession::where('is_current', true)
                    ->where('id', '!=', $session->id)
                    ->update(['is_current' => false]);
            }

            $session->update($request->all());
        });

        return response()->json([
            'message' => 'Academic Session updated successfully.',
            'data' => $session
        ]);
    }

    public function destroySession($id)
    {
        $session = AcademicSession::findOrFail($id);
        $session->delete();

        return response()->json([
            'message' => 'Academic Session deleted successfully.'
        ]);
    }


    // ==========================================
    // CAMPUS OFFICES CRUD
    // ==========================================

    public function getOffices()
    {
        // Offices are campus locations where type = 'office'
        return response()->json(CampusLocation::where('type', 'office')->get());
    }

    public function storeOffice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:campus_locations,name',
            'description' => 'nullable|string',
            'operating_hours' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'building_code' => 'nullable|string|max:50',
            'floor_number' => 'nullable|integer',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = array_merge($request->all(), [
            'type' => 'office',
            'is_active' => $request->input('is_active', true)
        ]);

        $office = CampusLocation::create($data);

        return response()->json([
            'message' => 'Office created successfully.',
            'data' => $office
        ], 201);
    }

    public function updateOffice(Request $request, $id)
    {
        $office = CampusLocation::where('type', 'office')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:campus_locations,name,' . $id,
            'description' => 'nullable|string',
            'operating_hours' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'building_code' => 'nullable|string|max:50',
            'floor_number' => 'nullable|integer',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $office->update($request->all());

        return response()->json([
            'message' => 'Office updated successfully.',
            'data' => $office
        ]);
    }

    public function destroyOffice($id)
    {
        $office = CampusLocation::where('type', 'office')->findOrFail($id);
        $office->delete();

        return response()->json([
            'message' => 'Office deleted successfully.'
        ]);
    }
}
