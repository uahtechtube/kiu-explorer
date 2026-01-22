<?php

namespace App\Http\Controllers;

use App\Models\CourseAllocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AllocationController extends Controller
{
    /**
     * List all course allocations.
     */
    public function index()
    {
        $allocations = CourseAllocation::with(['lecturer:id,surname,first_name', 'course', 'academicSession'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($allocations);
    }

    /**
     * Allocate a lecturer to a course.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id', // Lecturer
            'course_id' => 'required|exists:courses,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'is_coordinator' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if user is actually a lecturer
        $user = \App\Models\User::find($request->user_id);
        if ($user->role !== 'lecturer') {
            return response()->json(['message' => 'Allocated user must be a lecturer.'], 422);
        }

        $allocation = CourseAllocation::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'course_id' => $request->course_id,
                'academic_session_id' => $request->academic_session_id,
            ],
            [
                'is_coordinator' => $request->is_coordinator ?? false,
            ]
        );

        return response()->json([
            'message' => 'Lecturer allocated to course successfully',
            'allocation' => $allocation
        ], 201);
    }
}
