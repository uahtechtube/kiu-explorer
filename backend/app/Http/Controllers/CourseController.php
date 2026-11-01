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

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $courses = $query->with('department.faculty')
            ->withCount(['lecturers as allocations_count', 'students as registrations_count'])
            ->get();

        // Add additional data and formatting
        $courses->each(function ($course) use ($request) {
            // Aliases for frontend compatibility
            $course->course_code = $course->code;
            $course->credit_hours = $course->unit;

            // Course registration is now global - everyone is "registered"
            $course->is_registered = true;
        });

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
     * Enroll a student (Legacy/Mock).
     */
    public function enroll(Request $request)
    {
        // Registration is now disabled/global
        return response()->json([
            'message' => 'Course access is now global. No registration needed.',
        ]);
    }

    /**
     * Get student's registered courses (Now returns all courses)
     */
    public function myRegistrations(Request $request)
    {
        $courses = Course::with('department.faculty')->get();
        return response()->json($courses);
    }
}
