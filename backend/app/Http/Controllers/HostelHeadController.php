<?php

namespace App\Http\Controllers;

use App\Models\HostelHead;
use App\Models\Hostel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HostelHeadController extends Controller
{
    // ─────────────────────────────────────────────
    // PUBLIC / STUDENT: Get head(s) for all hostels
    // ─────────────────────────────────────────────

    /**
     * GET /api/student/hostel-heads
     * Returns all active hostel heads (one per hostel). Visible to students.
     */
    public function publicIndex()
    {
        $heads = HostelHead::with('hostel:id,name,gender_type')
            ->where('is_active', true)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $heads,
        ]);
    }

    /**
     * GET /api/student/hostel-heads/{hostelId}
     * Get the active head for a specific hostel.
     */
    public function publicShow($hostelId)
    {
        $head = HostelHead::with('hostel:id,name,gender_type')
            ->where('hostel_id', $hostelId)
            ->where('is_active', true)
            ->latest()
            ->first();

        if (!$head) {
            return response()->json([
                'status'  => 'success',
                'data'    => null,
                'message' => 'No active head found for this hostel.',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $head,
        ]);
    }

    // ─────────────────────────────────────────────
    // ADMIN: Full CRUD
    // ─────────────────────────────────────────────

    /**
     * GET /api/admin/hostel-heads
     */
    public function index()
    {
        $heads = HostelHead::with('hostel:id,name,gender_type')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $heads,
        ]);
    }

    /**
     * POST /api/admin/hostel-heads
     */
    public function store(Request $request)
    {
        $request->validate([
            'hostel_id'    => 'required|integer',
            'name'         => 'required|string|max:255',
            'title'        => 'nullable|string|max:100',
            'phone'        => 'nullable|string|max:30',
            'email'        => 'nullable|email|max:255',
            'room_number'  => 'nullable|string|max:50',
            'office_hours' => 'nullable|string|max:255',
            'bio'          => 'nullable|string',
            'image'        => 'nullable|string', // base64 string
            'is_active'    => 'sometimes|boolean',
        ]);

        $imagePath = null;
        if ($request->image) {
            $imagePath = $this->uploadBase64Image($request->image, 'hostel_heads');
        }

        $head = HostelHead::create([
            'hostel_id'    => $request->hostel_id,
            'name'         => $request->name,
            'title'        => $request->title ?? 'Head of Hostel',
            'phone'        => $request->phone,
            'email'        => $request->email,
            'room_number'  => $request->room_number,
            'office_hours' => $request->office_hours,
            'bio'          => $request->bio,
            'image'        => $imagePath,
            'is_active'    => $request->is_active ?? true,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Hostel head created successfully.',
            'data'    => $head->load('hostel:id,name'),
        ], 201);
    }

    /**
     * PUT /api/admin/hostel-heads/{id}
     */
    public function update(Request $request, $id)
    {
        $head = HostelHead::findOrFail($id);

        $request->validate([
            'name'         => 'sometimes|string|max:255',
            'title'        => 'nullable|string|max:100',
            'phone'        => 'nullable|string|max:30',
            'email'        => 'nullable|email|max:255',
            'room_number'  => 'nullable|string|max:50',
            'office_hours' => 'nullable|string|max:255',
            'bio'          => 'nullable|string',
            'image'        => 'nullable|string', // new base64 image or null
            'is_active'    => 'sometimes|boolean',
        ]);

        $data = $request->only([
            'name', 'title', 'phone', 'email', 'room_number', 'office_hours', 'bio', 'is_active',
        ]);

        if ($request->filled('image') && str_starts_with($request->image, 'data:image')) {
            // New base64 image uploaded – delete old file first
            if ($head->image && Storage::disk('public')->exists($head->image)) {
                Storage::disk('public')->delete($head->image);
            }
            $data['image'] = $this->uploadBase64Image($request->image, 'hostel_heads');
        }

        $head->update($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Hostel head updated successfully.',
            'data'    => $head->fresh()->load('hostel:id,name'),
        ]);
    }

    /**
     * DELETE /api/admin/hostel-heads/{id}
     */
    public function destroy($id)
    {
        $head = HostelHead::findOrFail($id);

        if ($head->image && Storage::disk('public')->exists($head->image)) {
            Storage::disk('public')->delete($head->image);
        }

        $head->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Hostel head record deleted successfully.',
        ]);
    }

    // ─────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────

    private function uploadBase64Image(string $base64, string $folder): ?string
    {
        try {
            // Strip "data:image/jpeg;base64," prefix if present
            if (str_contains($base64, ',')) {
                [, $base64] = explode(',', $base64);
            }

            $decoded  = base64_decode($base64);
            $filename = $folder . '/' . uniqid('img_', true) . '.jpg';
            Storage::disk('public')->put($filename, $decoded);
            return $filename;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
