<?php

namespace App\Http\Controllers;

use App\Models\Hostel;
use App\Models\HostelRoom;
use Illuminate\Http\Request;

class HostelController extends Controller
{
    public function index(Request $request)
    {
        $query = Hostel::with('campusLocation');

        if ($request->has('gender_type')) {
            $query->where('gender_type', $request->gender_type);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->get(),
            'hostel_service_fee' => (float) cache()->get('settings.hostel_service_fee', 5000.00),
        ]);
    }

    public function show($id)
    {
        $hostel = Hostel::with(['campusLocation', 'rooms' => function ($query) {
            $query->where('status', 'available');
        }])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $hostel,
            'hostel_service_fee' => (float) cache()->get('settings.hostel_service_fee', 5000.00),
        ]);
    }

    public function availableRooms($id)
    {
        $rooms = HostelRoom::where('hostel_id', $id)
            ->where('status', 'available')
            ->where('available_slots', '>', 0)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rooms
        ]);
    }
}
