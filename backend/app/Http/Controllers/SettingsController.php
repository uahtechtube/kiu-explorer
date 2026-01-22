<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get user settings
     */
    public function getSettings(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'notification_preferences' => $user->notification_preferences ? json_decode($user->notification_preferences) : $this->getDefaultPreferences(),
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updateNotifications(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'push_notifications' => 'boolean',
            'email_notifications' => 'boolean',
            'news_updates' => 'boolean',
            'assignment_alerts' => 'boolean',
            'event_reminders' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        $user->notification_preferences = json_encode($request->all());
        $user->save();

        return response()->json([
            'message' => 'Notification preferences updated',
            'preferences' => json_decode($user->notification_preferences)
        ]);
    }

    /**
     * Change Password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    private function getDefaultPreferences()
    {
        return [
            'push_notifications' => true,
            'email_notifications' => true,
            'news_updates' => true,
            'assignment_alerts' => true,
            'event_reminders' => true,
        ];
    }
}
