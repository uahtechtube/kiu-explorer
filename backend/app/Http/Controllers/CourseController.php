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

            // Add registration status for authenticated student
            if ($request->user() && $request->user()->role === 'student') {
                $course->is_registered = CourseRegistration::where('course_id', $course->id)
                    ->where('user_id', $request->user()->id)
                    ->exists();
            }
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
     * Enroll a student in a single course.
     */
    public function enroll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can enroll in courses.'], 403);
        }

        // Get current academic session
        $currentSession = \App\Models\AcademicSession::where('is_current', true)->first();
        if (!$currentSession) {
            return response()->json(['message' => 'No active academic session found.'], 400);
        }

        // Check if already registered
        $existing = CourseRegistration::where('user_id', $user->id)
            ->where('course_id', $request->course_id)
            ->where('academic_session_id', $currentSession->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already registered for this course.'], 400);
        }

        $registration = CourseRegistration::create([
            'user_id' => $user->id,
            'course_id' => $request->course_id,
            'academic_session_id' => $currentSession->id,
            'status' => 'registered'
        ]);

        return response()->json([
            'message' => 'Course registered successfully',
            'registration' => $registration
        ]);
    }

    /**
     * Get student's registered courses
     */
    public function myRegistrations(Request $request)
    {
        $user = $request->user();
        
        $registrations = CourseRegistration::where('user_id', $user->id)
            ->with('course.department')
            ->get();

        $courses = $registrations->map(function($reg) {
            return $reg->course;
        });

        return response()->json($courses);
    }
}
