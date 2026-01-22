<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Department;
use App\Models\Programme;
use App\Models\AcademicSession;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    /**
     * Get all faculties.
     */
    public function getFaculties()
    {
        $faculties = Faculty::all();
        return response()->json($faculties);
    }

    /**
     * Get departments by faculty ID.
     */
    public function getDepartments($facultyId)
    {
        $departments = Department::where('faculty_id', $facultyId)->get();
        return response()->json($departments);
    }

    /**
     * Get programmes by department ID.
     */
    public function getProgrammes($departmentId)
    {
        $programmes = Programme::where('department_id', $departmentId)->get();
        return response()->json($programmes);
    }

    /**
     * Get all academic sessions.
     */
    public function getSessions()
    {
        $sessions = AcademicSession::orderBy('name', 'desc')->get();
        return response()->json($sessions);
    }
}
