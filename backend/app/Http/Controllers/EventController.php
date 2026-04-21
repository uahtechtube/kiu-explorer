<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * Get all events (with optional filtering)
     */
    public function index(Request $request)
    {
        $query = Event::with(['association', 'creator'])
            ->where('status', '!=', 'cancelled');

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by upcoming/past
        if ($request->filter === 'upcoming') {
            $query->where('start_time', '>=', now());
        } elseif ($request->filter === 'past') {
            $query->where('start_time', '<', now());
        }

        // Search
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $events = $query->latest('start_time')->get();

        // Add registration status for authenticated user
        if ($request->user()) {
            $events->each(function($event) use ($request) {
                $event->is_registered = EventRegistration::where('event_id', $event->id)
                    ->where('user_id', $request->user()->id)
                    ->exists();
                $event->participants_count = EventRegistration::where('event_id', $event->id)->count();
            });
        }

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Get single event details
     */
    public function show(Request $request, $id)
    {
        $event = Event::with(['association', 'creator', 'registrations.user'])
            ->findOrFail($id);

        $event->attendees_count = $event->registrations->count();
        
        if ($request->user()) {
            $event->is_registered = EventRegistration::where('event_id', $event->id)
                ->where('user_id', $request->user()->id)
                ->exists();
        }

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    /**
     * Create new event
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:Academic,Social,Sports,Cultural,Workshop,Other',
            'venue' => 'required|string',
            'start_time' => 'required|date|after:yesterday',
            'end_time' => 'nullable|date|after:start_time',
            'capacity' => 'nullable|integer|min:1',
            'association_id' => 'nullable|exists:associations,id',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['created_by'] = $request->user()->id;
            $data['status'] = 'upcoming';

            // Handle image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('events', 'public');
                $data['image_url'] = Storage::url($path);
            }

            // Ensure association_id is null if empty
            if (empty($data['association_id'])) {
                $data['association_id'] = null;
            }

            $event = Event::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => $event
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update event
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Authorization check
        if ($event->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this event'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|in:Academic,Social,Sports,Cultural,Workshop,Other',
            'venue' => 'sometimes|required|string',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after:start_time',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:upcoming,ongoing,completed,cancelled',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['created_by', 'association_id']);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($event->image_url) {
                $oldPath = str_replace('/storage/', '', $event->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('image')->store('events', 'public');
            $data['image_url'] = Storage::url($path);
        }

        $event->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => $event
        ]);
    }

    /**
     * Delete event
     */
    public function destroy(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Authorization check
        if ($event->created_by !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this event'
            ], 403);
        }

        // Delete image if exists
        if ($event->image_url) {
            $path = str_replace('/storage/', '', $event->image_url);
            Storage::disk('public')->delete($path);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
    }

    /**
     * Register for an event
     */
    public function register(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Check if event is full
        if ($event->capacity) {
            $currentRegistrations = EventRegistration::where('event_id', $event->id)->count();
            if ($currentRegistrations >= $event->capacity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event is already full'
                ], 400);
            }
        }

        // Check if already registered
        $existing = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Already registered for this event'
            ], 400);
        }

        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $request->user()->id,
            'status' => 'registered'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully registered for event',
            'data' => $registration
        ]);
    }

    /**
     * Unregister from an event
     */
    public function unregister(Request $request, $id)
    {
        $registration = EventRegistration::where('event_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Not registered for this event'
            ], 404);
        }

        $registration->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully unregistered from event'
        ]);
    }

    /**
     * Get user's registered events
     */
    public function myEvents(Request $request)
    {
        $registrations = EventRegistration::with('event')
            ->where('user_id', $request->user()->id)
            ->get();

        $events = $registrations->map(function($reg) {
            return $reg->event;
        });

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }
}
