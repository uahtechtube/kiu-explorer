<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\LecturerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DeanController extends Controller
{
    /**
     * Get statistics for the Dean's Faculty.
     */
    public function stats(Request $request)
    {
        $dean = $request->user();
        if ($dean->role !== 'dean' && $dean->role !== 'admin' && $dean->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $facultyId = $dean->faculty_id;
        if (!$facultyId) {
            return response()->json(['error' => 'Dean is not assigned to a Faculty.'], 400);
        }

        $hodCount = User::where('role', 'hod')->where('faculty_id', $facultyId)->count();
        $lecturerCount = User::where('role', 'lecturer')->where('faculty_id', $facultyId)->count();
        $tutorCount = User::where('role', 'tutor')->where('faculty_id', $facultyId)->count();
        $studentCount = User::where('role', 'student')->where('faculty_id', $facultyId)->count();

        return response()->json([
            'faculty_id' => $facultyId,
            'stats' => [
                'hods' => $hodCount,
                'lecturers' => $lecturerCount,
                'tutors' => $tutorCount,
                'students' => $studentCount,
                'total_users' => $hodCount + $lecturerCount + $tutorCount + $studentCount
            ]
        ], 200);
    }

    /**
     * Create HOD, Lecturer, or Tutor inside the Dean's Faculty.
     */
    public function createUser(Request $request)
    {
        $dean = $request->user();
        if ($dean->role !== 'dean' && $dean->role !== 'admin' && $dean->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $facultyId = $dean->faculty_id;
        if (!$facultyId) {
            return response()->json(['error' => 'Dean is not assigned to a Faculty.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'surname' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:hod,lecturer,tutor',
            'department_id' => 'required|exists:departments,id'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'user_id' => 'KIU-' . strtoupper(uniqid()),
                'surname' => $request->surname,
                'first_name' => $request->first_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'faculty_id' => $facultyId,
                'department_id' => $request->department_id,
                'account_status' => 'active'
            ]);

            if ($request->role === 'lecturer' || $request->role === 'tutor') {
                $user->lecturerProfile()->create([
                    'department_id' => $request->department_id,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => ucfirst($request->role) . ' created successfully.',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }

    /**
     * List all students in the Dean's Faculty.
     */
    public function students(Request $request)
    {
        $dean = $request->user();
        if ($dean->role !== 'dean' && $dean->role !== 'admin' && $dean->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $facultyId = $dean->faculty_id;
        if (!$facultyId) {
            return response()->json(['error' => 'Dean is not assigned to a Faculty.'], 400);
        }

        $students = User::where('role', 'student')
            ->where('faculty_id', $facultyId)
            ->with(['studentProfile.department', 'studentProfile.programme'])
            ->paginate(15);

        return response()->json($students, 200);
    }
}
