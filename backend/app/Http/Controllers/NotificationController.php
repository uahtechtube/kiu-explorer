<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications->map(function ($notification) {
            $data = is_array($notification->data) ? $notification->data : json_decode($notification->data, true);
            return [
                'id' => $notification->id,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'type' => $data['type'] ?? 'system',
                'created_at' => $notification->created_at ? $notification->created_at->toIso8601String() : now()->toIso8601String(),
                'is_read' => $notification->read_at !== null,
            ];
        });

        $systemAlerts = \App\Models\SystemAlert::latest()->get()->map(function ($alert) {
            return [
                'id' => 'system-alert-' . $alert->id,
                'title' => $alert->title,
                'message' => $alert->message,
                'type' => $alert->type === 'info' ? 'system' : 'alert',
                'created_at' => $alert->created_at ? $alert->created_at->toIso8601String() : now()->toIso8601String(),
                'is_read' => (bool)$alert->is_resolved,
            ];
        });

        $merged = $notifications->concat($systemAlerts)->sortByDesc('created_at')->values();

        return response()->json(['data' => $merged]);
    }

    public function unread(Request $request)
    {
        $notifications = $request->user()->unreadNotifications->map(function ($notification) {
            $data = is_array($notification->data) ? $notification->data : json_decode($notification->data, true);
            return [
                'id' => $notification->id,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'type' => $data['type'] ?? 'system',
                'created_at' => $notification->created_at ? $notification->created_at->toIso8601String() : now()->toIso8601String(),
                'is_read' => false,
            ];
        });

        $systemAlerts = \App\Models\SystemAlert::unresolved()->latest()->get()->map(function ($alert) {
            return [
                'id' => 'system-alert-' . $alert->id,
                'title' => $alert->title,
                'message' => $alert->message,
                'type' => $alert->type === 'info' ? 'system' : 'alert',
                'created_at' => $alert->created_at ? $alert->created_at->toIso8601String() : now()->toIso8601String(),
                'is_read' => false,
            ];
        });

        $merged = $notifications->concat($systemAlerts)->sortByDesc('created_at')->values();

        return response()->json(['data' => $merged]);
    }

    public function markAsRead(Request $request, $id)
    {
        if (is_string($id) && str_starts_with($id, 'system-alert-')) {
            return response()->json(['message' => 'Marked as read']);
        }

        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }

    public function clearAll(Request $request)
    {
        $request->user()->notifications()->delete();
        return response()->json(['message' => 'All notifications cleared']);
    }
}
