<?php

namespace App\Http\Controllers;

use App\Models\HostelLeave;
use App\Models\HostelBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HostelLeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $leaves = HostelLeave::with(['hostel', 'room'])
            ->where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $leaves
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|max:1000',
        ]);

        $user = $request->user();

        // Get student's active booking
        $booking = HostelBooking::where('student_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'You must have an approved hostel booking to apply for leave.'
            ], 403);
        }

        $room = $booking->room;

        $leave = HostelLeave::create([
            'student_id' => $user->id,
            'hostel_id' => $room->hostel_id,
            'room_id' => $room->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Leave request submitted successfully.',
            'data' => $leave
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $leaves = HostelLeave::with(['student:id,first_name,surname,matric_number', 'hostel', 'room'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $leaves
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'approver_comments' => 'nullable|string|max:500',
        ]);

        $leave = HostelLeave::findOrFail($id);

        $leave->update([
            'status' => $request->status,
            'approved_by' => $user->id,
            'approver_comments' => $request->approver_comments,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Leave request ' . $request->status . ' successfully.',
            'data' => $leave
        ]);
    }
}
