<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationSenderController extends Controller
{
    /**
     * Dispatch target-scoped push notifications based on role access.
     */
    public function send(Request $request)
    {
        $sender = $request->user();
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'target' => 'required|in:class,department,faculty,campus',
            'class_id' => 'required_if:target,class',
            'department_id' => 'nullable|integer',
            'faculty_id' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $title = $request->title;
        $body = $request->body;
        $target = $request->target;

        // 1. Class Target (Lecturers / Tutors / Admin)
        if ($target === 'class') {
            if (!in_array($sender->role, ['lecturer', 'tutor', 'admin', 'management', 'hod', 'dean'])) {
                return response()->json(['error' => 'Unauthorized target scope.'], 403);
            }
            
            // Retrieve students registered for the course ID
            $students = User::whereHas('studentProfile.courses', function($q) use($request) {
                $q->where('courses.id', $request->class_id);
            })->get();

            $sentCount = NotificationService::sendToMultiple($students, $title, $body, ['type' => 'class_announcement']);

            return response()->json([
                'message' => "Notifications dispatched to {$sentCount} students in class.",
                'dispatched' => $sentCount
            ], 200);
        }

        // 2. Department Target (HOD / Admin / Management / Dean)
        if ($target === 'department') {
            if (!in_array($sender->role, ['hod', 'admin', 'management', 'dean'])) {
                return response()->json(['error' => 'Unauthorized target scope.'], 403);
            }

            $deptId = ($sender->role === 'hod') ? $sender->department_id : $request->department_id;
            if (!$deptId) {
                return response()->json(['error' => 'Department parameter missing.'], 400);
            }

            $students = User::where('role', 'student')->where('department_id', $deptId)->get();
            $sentCount = NotificationService::sendToMultiple($students, $title, $body, ['type' => 'department_alert']);

            return response()->json([
                'message' => "Notifications dispatched to {$sentCount} students in department.",
                'dispatched' => $sentCount
            ], 200);
        }

        // 3. Faculty Target (Dean / Admin / Management)
        if ($target === 'faculty') {
            if (!in_array($sender->role, ['dean', 'admin', 'management'])) {
                return response()->json(['error' => 'Unauthorized target scope.'], 403);
            }

            $facultyId = ($sender->role === 'dean') ? $sender->faculty_id : $request->faculty_id;
            if (!$facultyId) {
                return response()->json(['error' => 'Faculty parameter missing.'], 400);
            }

            $students = User::where('role', 'student')->where('faculty_id', $facultyId)->get();
            $sentCount = NotificationService::sendToMultiple($students, $title, $body, ['type' => 'faculty_alert']);

            return response()->json([
                'message' => "Notifications dispatched to {$sentCount} students in faculty.",
                'dispatched' => $sentCount
            ], 200);
        }

        // 4. Campus Target (Security / Admin / Management)
        if ($target === 'campus') {
            if (!in_array($sender->role, ['security', 'admin', 'management'])) {
                return response()->json(['error' => 'Unauthorized target scope.'], 403);
            }

            $allUsers = User::whereNotNull('expo_push_token')->get();
            $sentCount = NotificationService::sendToMultiple($allUsers, $title, $body, ['type' => 'campus_emergency']);

            return response()->json([
                'message' => "Campus broadcast sent to {$sentCount} active devices.",
                'dispatched' => $sentCount
            ], 200);
        }

        return response()->json(['error' => 'Invalid dispatch logic.'], 400);
    }
}
