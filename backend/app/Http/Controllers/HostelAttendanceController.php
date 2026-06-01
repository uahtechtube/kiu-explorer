<?php

namespace App\Http\Controllers;

use App\Models\HostelAttendance;
use App\Models\HostelBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HostelAttendanceController extends Controller
{
    public function history(Request $request)
    {
        $user = $request->user();
        $logs = HostelAttendance::with(['hostel', 'room'])
            ->where('student_id', $user->id)
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'room_id' => 'required|exists:hostel_rooms,id',
            'direction' => 'required|in:in,out',
            'device_id' => 'nullable|string',
        ]);

        $user = $request->user();

        // Verify the student actually has an approved booking for this room/hostel
        $booking = HostelBooking::where('student_id', $user->id)
            ->where('hostel_room_id', $request->room_id)
            ->where('status', 'approved')
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have an approved booking for this room.'
            ], 403);
        }

        $log = HostelAttendance::create([
            'student_id' => $user->id,
            'hostel_id' => $request->hostel_id,
            'room_id' => $request->room_id,
            'direction' => $request->direction,
            'timestamp' => now(),
            'device_id' => $request->device_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance logged successfully as checked ' . $request->direction . '.',
            'data' => $log
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        // Admin view of all attendance logs
        $logs = HostelAttendance::with(['student:id,first_name,surname,matric_number', 'hostel', 'room'])
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}
