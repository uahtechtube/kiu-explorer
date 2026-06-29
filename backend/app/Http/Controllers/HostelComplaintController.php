<?php

namespace App\Http\Controllers;

use App\Models\HostelComplaint;
use App\Models\HostelBooking;
use Illuminate\Http\Request;

class HostelComplaintController extends Controller
{
    public function index(Request $request)
    {
        $complaints = HostelComplaint::with(['hostel', 'room'])
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $complaints
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|in:plumbing,electrical,carpentry,cleaning,security,other',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'hostel_id' => 'nullable|exists:hostels,id',
            'room_number' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        $complaint = HostelComplaint::create([
            'student_id' => $user->id,
            'hostel_id' => $request->hostel_id,
            'hostel_room_id' => null,
            'room_number' => $request->room_number,
            'category' => $request->category,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Complaint submitted successfully.',
            'data' => $complaint
        ], 201);
    }

    public function show($id, Request $request)
    {
        $complaint = HostelComplaint::with(['hostel', 'room'])
            ->where('student_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $complaint
        ]);
    }
}
