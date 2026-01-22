<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    /**
     * List announcements for current user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $announcements = Announcement::forUser($user);

        return response()->json($announcements);
    }

    /**
     * Get specific announcement
     */
    public function show($id)
    {
        $announcement = Announcement::with('publisher:id,surname,first_name')->findOrFail($id);

        return response()->json($announcement);
    }

    /**
     * Create announcement (Admin only)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,academic,emergency,event,exam,administrative',
            'target_audience' => 'required|in:all,students,lecturers,staff,level_100,level_200,level_300,level_400,level_500',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'expires_at' => 'nullable|date|after:now',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,jpg,jpeg,png,doc,docx', // 5MB
            'send_notification' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('attachment');
        $data['published_by'] = $request->user()->id;
        $data['published_at'] = now();

        // Handle attachment upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('announcements', $filename, 'public');
            $data['attachment_url'] = $path;
        }

        $announcement = Announcement::create($data);

        // TODO: Send notifications if send_notification is true
        // This would integrate with your notification system

        return response()->json([
            'message' => 'Announcement created successfully.',
            'data' => $announcement->load('publisher:id,surname,first_name')
        ], 201);
    }

    /**
     * Update announcement (Admin only)
     */
    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'type' => 'sometimes|in:general,academic,emergency,event,exam,administrative',
            'target_audience' => 'sometimes|in:all,students,lecturers,staff,level_100,level_200,level_300,level_400,level_500',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'expires_at' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('attachment');

        // Handle attachment upload
        if ($request->hasFile('attachment')) {
            // Delete old attachment
            if ($announcement->attachment_url) {
                Storage::disk('public')->delete($announcement->attachment_url);
            }

            $file = $request->file('attachment');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('announcements', $filename, 'public');
            $data['attachment_url'] = $path;
        }

        $announcement->update($data);

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'data' => $announcement->load('publisher:id,surname,first_name')
        ]);
    }

    /**
     * Delete announcement (Admin only)
     */
    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);

        // Delete attachment if exists
        if ($announcement->attachment_url) {
            Storage::disk('public')->delete($announcement->attachment_url);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully.']);
    }

    /**
     * Get announcements by type
     */
    public function byType(Request $request, $type)
    {
        $user = $request->user();
        
        $announcements = Announcement::forUser($user)
            ->where('type', $type)
            ->get();

        return response()->json($announcements);
    }

    /**
     * Get urgent announcements
     */
    public function urgent(Request $request)
    {
        $user = $request->user();
        
        $announcements = Announcement::forUser($user)
            ->where('priority', 'urgent')
            ->get();

        return response()->json($announcements);
    }
}
