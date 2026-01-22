<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * List courses with optional filters.
     */
    public function index(Request $request)
    {
        $query = Course::query();

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        $courses = $query->with('department')->get();
        return response()->json($courses);
    }

    /**
     * Create a new course (Admin/Lecturer).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|unique:courses',
            'title' => 'required|string',
            'unit' => 'required|integer|min:1',
            'level' => 'required|string',
            'semester' => 'required|string|in:First,Second',
            'is_elective' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $course = Course::create($request->all());

        return response()->json([
            'message' => 'Course created successfully',
            'course' => $course
        ], 201);
    }

    /**
     * Enroll a student in courses.
     */
    public function enroll(Request $request)
    {
        // Expects an array of course_ids
        $validator = Validator::make($request->all(), [
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can enroll in courses.'], 403);
        }

        DB::beginTransaction();
        try {
            $registrations = [];
            foreach ($request->course_ids as $courseId) {
                $registrations[] = CourseRegistration::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'course_id' => $courseId,
                        'academic_session_id' => $request->academic_session_id,
                    ],
                    ['status' => 'registered']
                );
            }
            DB::commit();
            return response()->json([
                'message' => 'Courses registered successfully',
                'registrations' => $registrations
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Enrollment failed.'], 500);
        }
    }
}
