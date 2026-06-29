<?php

namespace App\Http\Controllers;

use App\Models\Hostel;
use App\Models\HostelRule;
use Illuminate\Http\Request;

class HostelRuleController extends Controller
{
    public function index(Request $request, $hostelId)
    {
        $user = $request->user();

        $query = HostelRule::where('hostel_id', $hostelId);

        // Students only see active rules
        if ($user && $user->role === 'student') {
            $query->where('is_active', true);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->orderBy('created_at', 'asc')->get()
        ]);
    }

    public function store(Request $request, $hostelId)
    {
        $hostel = Hostel::findOrFail($hostelId);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $rule = HostelRule::create([
            'hostel_id' => $hostelId,
            'title' => $request->title,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Hostel rule created successfully.',
            'data' => $rule
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $rule = HostelRule::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $rule->update($request->only(['title', 'description', 'is_active']));

        return response()->json([
            'status' => 'success',
            'message' => 'Hostel rule updated successfully.',
            'data' => $rule
        ]);
    }

    public function destroy($id)
    {
        $rule = HostelRule::findOrFail($id);
        $rule->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Hostel rule deleted successfully.'
        ]);
    }
}
