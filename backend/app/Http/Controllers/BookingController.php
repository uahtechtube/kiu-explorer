<?php

namespace App\Http\Controllers;

use App\Models\HostelBooking;
use App\Models\HostelRoom;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'hostel_room_id' => 'required|exists:hostel_rooms,id',
            'academic_session' => 'required|string',
            'payment_reference' => 'required|string|exists:payments,reference',
        ]);

        $user = $request->user();
        $room = HostelRoom::with('hostel')->findOrFail($request->hostel_room_id);

        if ($room->hostel->gender_type !== 'mixed' && strtolower($room->hostel->gender_type) !== strtolower($user->gender)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This hostel is restricted to ' . ucfirst($room->hostel->gender_type) . ' students.'
            ], 400);
        }

        if ($room->available_slots <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'No available slots in this room.'
            ], 400);
        }

        // Check if student already has a pending or approved booking for this session
        $existingBooking = HostelBooking::where('student_id', $user->id)
            ->where('academic_session', $request->academic_session)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingBooking) {
            return response()->json([
                'status' => 'error',
                'message' => 'You already have an active booking for this session.'
            ], 400);
        }

        $payment = \App\Models\Payment::where('reference', $request->payment_reference)->firstOrFail();

        $booking = HostelBooking::create([
            'student_id' => $user->id,
            'hostel_room_id' => $room->id,
            'academic_session' => $request->academic_session,
            'status' => 'pending',
            'payment_id' => $payment->id,
            'booked_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking request submitted successfully.',
            'data' => $booking
        ], 201);
    }

    public function myBookings(Request $request)
    {
        $bookings = HostelBooking::with(['room.hostel', 'payment'])
            ->where('student_id', $request->user()->id)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    public function cancel($id, Request $request)
    {
        $booking = HostelBooking::where('student_id', $request->user()->id)
            ->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending bookings can be cancelled.'
            ], 400);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking cancelled successfully.'
        ]);
    }
}
