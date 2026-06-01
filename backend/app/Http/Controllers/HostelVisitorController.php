<?php

namespace App\Http\Controllers;

use App\Models\HostelVisitor;
use App\Models\HostelBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HostelVisitorController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $visitors = HostelVisitor::with(['hostel', 'room'])
            ->where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $visitors
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'visitor_name' => 'required|string|max:255',
            'visitor_phone' => 'required|string|max:20',
            'relationship' => 'nullable|string|max:255',
            'purpose' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // Get student's active booking
        $booking = HostelBooking::where('student_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'You must have an approved hostel booking to register a visitor.'
            ], 403);
        }

        $room = $booking->room;

        $visitor = HostelVisitor::create([
            'student_id' => $user->id,
            'hostel_id' => $room->hostel_id,
            'room_id' => $room->id,
            'visitor_name' => $request->visitor_name,
            'visitor_phone' => $request->visitor_phone,
            'relationship' => $request->relationship,
            'purpose' => $request->purpose,
            'status' => 'pre-registered',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Visitor pre-registered successfully.',
            'data' => $visitor
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

        $visitors = HostelVisitor::with(['student:id,first_name,surname,matric_number', 'hostel', 'room'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $visitors
        ]);
    }

    public function checkIn(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $visitor = HostelVisitor::findOrFail($id);

        if ($visitor->status !== 'pre-registered') {
            return response()->json([
                'status' => 'error',
                'message' => 'Visitor is already checked in or checked out.'
            ], 400);
        }

        $visitor->update([
            'check_in' => now(),
            'status' => 'active',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Visitor checked in successfully.',
            'data' => $visitor
        ]);
    }

    public function checkOut(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $visitor = HostelVisitor::findOrFail($id);

        if ($visitor->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Visitor is not active.'
            ], 400);
        }

        $visitor->update([
            'check_out' => now(),
            'status' => 'checked-out',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Visitor checked out successfully.',
            'data' => $visitor
        ]);
    }
}
