<?php

namespace App\Http\Controllers;

use App\Models\CampusLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CampusController extends Controller
{
    /**
     * List campus locations
     */
    public function index(Request $request)
    {
        $query = CampusLocation::where('is_active', true);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('building_code', 'like', "%{$search}%");
            });
        }

        $locations = $query->orderBy('name')->get();

        return response()->json($locations);
    }

    /**
     * Get emergency points
     */
    public function emergencyPoints()
    {
        $points = CampusLocation::emergencyPoints();

        return response()->json($points);
    }

    /**
     * Create location (Admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:building,facility,emergency_point,office,library,cafeteria,hostel,sports,other',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'operating_hours' => 'nullable|string',
            'floor_number' => 'nullable|integer',
            'building_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $location = CampusLocation::create($request->all());

        return response()->json([
            'message' => 'Location created successfully.',
            'data' => $location
        ], 201);
    }

    /**
     * Update location (Admin)
     */
    public function update(Request $request, $id)
    {
        $location = CampusLocation::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:building,facility,emergency_point,office,library,cafeteria,hostel,sports,other',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'operating_hours' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'floor_number' => 'nullable|integer',
            'building_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $location->update($request->all());

        return response()->json([
            'message' => 'Location updated successfully.',
            'data' => $location
        ]);
    }

    /**
     * Delete location (Admin)
     */
    public function destroy($id)
    {
        $location = CampusLocation::findOrFail($id);
        $location->delete();

        return response()->json(['message' => 'Location deleted successfully.']);
    }
}
