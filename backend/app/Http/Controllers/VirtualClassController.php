<?php

namespace App\Http\Controllers;

use App\Models\VirtualClass;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VirtualClassController extends Controller
{
    /**
     * List virtual classes. Students can see all upcoming/active classes.
     */
    public function index(Request $request)
    {
        $query = VirtualClass::with(['course', 'lecturer:id,surname,first_name']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // By default show upcoming and active
            $query->whereIn('status', ['upcoming', 'active']);
        }

        $classes = $query->orderBy('scheduled_at', 'asc')->get();

        return response()->json($classes);
    }

    /**
     * Store a new virtual class (Lecturers only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration' => 'required|integer|min:1',
            'meeting_link' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        if ($user->role !== 'lecturer' && $user->role !== 'admin') {
            return response()->json(['message' => 'Only lecturers or admins can schedule classes.'], 403);
        }

        $virtualClass = VirtualClass::create([
            'course_id' => $request->course_id,
            'lecturer_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'scheduled_at' => $request->scheduled_at,
            'duration' => $request->duration,
            'meeting_link' => $request->meeting_link,
            'status' => 'upcoming',
        ]);

        return response()->json([
            'message' => 'Virtual class scheduled successfully',
            'virtual_class' => $virtualClass
        ], 201);
    }

    /**
     * Start a class (Lecturers only).
     */
    public function startClass(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        
        if ($request->user()->id !== $virtualClass->lecturer_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $virtualClass->update(['status' => 'active']);

        return response()->json([
            'message' => 'Class is now live',
            'virtual_class' => $virtualClass
        ]);
    }

    /**
     * Join a class and mark attendance.
     */
    public function joinClass(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        $user = $request->user();

        // Register attendance
        Attendance::firstOrCreate([
            'virtual_class_id' => $virtualClass->id,
            'user_id' => $user->id,
        ], [
            'joined_at' => now(),
        ]);

        return response()->json([
            'message' => 'Joined class successfully',
            'meeting_link' => $virtualClass->meeting_link,
            'virtual_class' => $virtualClass
        ]);
    }

    /**
     * End a class (Lecturers only).
     */
    public function endClass(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        
        if ($request->user()->id !== $virtualClass->lecturer_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $virtualClass->update(['status' => 'ended']);

        // Mark end time for all students who forgot to leave? 
        // Or just mark it as ended.

        return response()->json([
            'message' => 'Class has ended',
            'virtual_class' => $virtualClass
        ]);
    }
}
