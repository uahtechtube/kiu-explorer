<?php

namespace App\Http\Controllers;

use App\Models\PopupAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminPopupAnnouncementController extends Controller
{
    /**
     * Get the active popup announcement (Public / Student access).
     */
    public function getActive()
    {
        $popup = PopupAnnouncement::where('is_active', true)->latest()->first();

        return response()->json($popup, 200);
    }

    /**
     * Get list of all popup announcements (Admin only).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $popups = PopupAnnouncement::latest()->paginate(10);
        return response()->json($popups, 200);
    }

    /**
     * Create or update a popup announcement (Admin only).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'registration_updates' => 'nullable|string',
            'documentation_deadlines' => 'nullable|string',
            'student_dues' => 'nullable|string',
            'events' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            $isActive = $request->is_active ?? false;

            // If we are activating this popup, deactivate all others
            if ($isActive) {
                PopupAnnouncement::where('is_active', true)->update(['is_active' => false]);
            }

            $popup = PopupAnnouncement::create([
                'title' => $request->title,
                'registration_updates' => $request->registration_updates,
                'documentation_deadlines' => $request->documentation_deadlines,
                'student_dues' => $request->student_dues,
                'events' => $request->events,
                'is_active' => $isActive,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Popup announcement configured successfully.',
                'popup' => $popup
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Action failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Toggle active state of a popup (Admin only).
     */
    public function toggleActive(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $popup = PopupAnnouncement::findOrFail($id);

        DB::beginTransaction();
        try {
            $newStatus = !$popup->is_active;

            if ($newStatus) {
                // Deactivate all others
                PopupAnnouncement::where('is_active', true)->update(['is_active' => false]);
            }

            $popup->update(['is_active' => $newStatus]);

            DB::commit();

            return response()->json([
                'message' => $newStatus ? 'Popup activated successfully.' : 'Popup deactivated successfully.',
                'popup' => $popup
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Action failed.'], 500);
        }
    }

    /**
     * Delete a popup announcement (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $popup = PopupAnnouncement::findOrFail($id);
        $popup->delete();

        return response()->json(['message' => 'Popup announcement deleted successfully.'], 200);
    }
}
