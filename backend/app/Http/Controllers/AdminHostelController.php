<?php

namespace App\Http\Controllers;

use App\Models\Hostel;
use App\Models\HostelRoom;
use App\Models\HostelBooking;
use App\Models\HostelComplaint;
use Illuminate\Http\Request;

class AdminHostelController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Hostel::withCount('rooms')->get()
        ]);
    }

    public function stats()
    {
        $pendingBookings = HostelBooking::where('status', 'pending')->count();
        $activeComplaints = HostelComplaint::whereIn('status', ['pending', 'in_progress'])->count();
        $totalRooms = HostelRoom::count();
        $availableRooms = HostelRoom::where('status', 'available')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'pending_bookings' => $pendingBookings,
                'active_complaints' => $activeComplaints,
                'total_rooms' => $totalRooms,
                'available_rooms' => $availableRooms,
            ]
        ]);
    }

    public function storeHostel(Request $request)
    {
        $request->validate([
            'name'               => 'required|string|max:255',
            'gender_type'        => 'required|in:male,female,mixed',
            'description'        => 'nullable|string',
            'image_url'          => 'nullable|url',
            'campus_location_id' => 'required|exists:campus_locations,id',
        ]);

        $hostel = Hostel::create($request->only([
            'name', 'gender_type', 'description', 'image_url', 'campus_location_id',
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Hostel created successfully.',
            'data' => $hostel,
        ], 201);
    }

    public function updateHostel($id, Request $request)
    {
        $hostel = Hostel::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'gender_type' => 'sometimes|in:male,female,mixed',
            'description' => 'nullable|string',
            'image_url'   => 'nullable|url',
        ]);

        $hostel->update($request->only([
            'name', 'gender_type', 'description', 'image_url',
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Hostel updated successfully.',
            'data' => $hostel,
        ]);
    }

    public function destroyHostel($id)
    {
        $hostel = Hostel::findOrFail($id);

        $activeBookings = HostelBooking::whereHas('room', fn($q) => $q->where('hostel_id', $hostel->id))
            ->whereIn('status', ['pending', 'approved'])
            ->count();

        if ($activeBookings > 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cannot delete hostel with active or pending bookings.',
            ], 400);
        }

        $hostel->rooms()->delete();
        $hostel->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Hostel deleted successfully.',
        ]);
    }

    public function bookings()
    {
        $bookings = HostelBooking::with([
            'student:id,surname,first_name,matric_number',
            'room.hostel',
            'payment',
        ])->latest()->get();

        // Add computed name field for frontend
        $bookings->each(function ($booking) {
            if ($booking->student) {
                $booking->student->name = trim($booking->student->first_name . ' ' . $booking->student->surname);
            }
        });

        return response()->json([
            'status' => 'success',
            'data'   => $bookings,
        ]);
    }

    public function approveBooking($id)
    {
        $booking = HostelBooking::findOrFail($id);
        
        if ($booking->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Booking is not in a pending state.',
            ], 400);
        }

        $room = $booking->room;
        if ($room->available_slots <= 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No available slots remaining in this room.',
            ], 400);
        }

        $booking->update([
            'status'      => 'approved',
            'approved_at' => now(),
        ]);

        $room->decrement('available_slots');
        if ($room->available_slots === 0) {
            $room->update(['status' => 'full']);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Booking approved successfully.',
        ]);
    }

    public function rejectBooking($id)
    {
        $booking = HostelBooking::findOrFail($id);
        $booking->update(['status' => 'rejected']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Booking rejected.',
        ]);
    }

    public function roomsByHostel($hostelId)
    {
        $hostel = Hostel::findOrFail($hostelId);
        $rooms  = $hostel->rooms()->withCount('bookings')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $rooms,
        ]);
    }

    public function storeRoom($hostelId, Request $request)
    {
        $hostel = Hostel::findOrFail($hostelId);

        $request->validate([
            'room_number'       => 'required|string|max:20',
            'capacity'          => 'required|integer|min:1',
            'price_per_semester'=> 'required|numeric|min:0',
            'amenities'         => 'nullable|array',
        ]);

        $room = $hostel->rooms()->create([
            'room_number'        => $request->room_number,
            'capacity'           => $request->capacity,
            'available_slots'    => $request->capacity,
            'price_per_semester' => $request->price_per_semester,
            'status'             => 'available',
            'amenities'          => $request->amenities ?? [],
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Room added successfully.',
            'data'    => $room,
        ], 201);
    }

    public function updateRoom($id, Request $request)
    {
        $room = HostelRoom::findOrFail($id);

        $request->validate([
            'price_per_semester' => 'sometimes|numeric|min:0',
            'status'             => 'sometimes|in:available,full,maintenance',
            'amenities'          => 'nullable|array',
        ]);

        $room->update($request->only([
            'price_per_semester', 'status', 'amenities',
        ]));

        return response()->json([
            'status'  => 'success',
            'message' => 'Room updated successfully.',
            'data'    => $room,
        ]);
    }

    public function allComplaints()
    {
        $complaints = HostelComplaint::with(['student:id,surname,first_name,matric_number', 'hostel', 'room'])
            ->latest()
            ->get();

        $complaints->each(function ($c) {
            if ($c->student) {
                $c->student->name = trim($c->student->first_name . ' ' . $c->student->surname);
            }
        });

        return response()->json([
            'status' => 'success',
            'data'   => $complaints,
        ]);
    }

    public function updateComplaintStatus($id, Request $request)
    {
        $request->validate([
            'status'        => 'required|in:pending,in_progress,resolved,closed',
            'admin_comment' => 'nullable|string',
        ]);

        $complaint = HostelComplaint::findOrFail($id);
        
        $updateData = [
            'status'        => $request->status,
            'admin_comment' => $request->admin_comment,
        ];

        if ($request->status === 'resolved' && $complaint->status !== 'resolved') {
            $updateData['resolved_at'] = now();
        }

        $complaint->update($updateData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Complaint status updated successfully.',
            'data'    => $complaint,
        ]);
    }
}
