<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a push notification to a single user.
     *
     * @param User $user
     * @param string $title
     * @param string $body
     * @param array $data
     * @return bool
     */
    public static function sendToUser(User $user, string $title, string $body, array $data = []): bool
    {
        if (!$user->expo_push_token) {
            Log::info("Push notification skipped: User #{$user->id} has no Expo push token registered.");
            return false;
        }

        return self::sendNotification($user->expo_push_token, $title, $body, $data);
    }

    /**
     * Send a push notification to multiple users.
     *
     * @param \Illuminate\Support\Collection|array $users
     * @param string $title
     * @param string $body
     * @param array $data
     * @return int Number of successfully dispatched notifications
     */
    public static function sendToMultiple($users, string $title, string $body, array $data = []): int
    {
        $tokens = collect($users)
            ->pluck('expo_push_token')
            ->filter()
            ->values()
            ->toArray();

        if (empty($tokens)) {
            return 0;
        }

        return self::sendBatchNotification($tokens, $title, $body, $data);
    }

    /**
     * Dispatch push notification call to Expo API.
     */
    private static function sendNotification(string $token, string $title, string $body, array $data): bool
    {
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-Encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', [
                'to' => $token,
                'sound' => 'default',
                'title' => $title,
                'body' => $body,
                'data' => $data,
            ]);

            if ($response->successful()) {
                Log::debug("Expo Push sent successfully to token: {$token}");
                return true;
            }

            Log::error("Expo Push failed with status {$response->status()}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Expo Push connection error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Dispatch batch push notifications to Expo API.
     */
    private static function sendBatchNotification(array $tokens, string $title, string $body, array $data): int
    {
        // Expo supports up to 100 notifications per batch request
        $chunks = array_chunk($tokens, 100);
        $successCount = 0;

        foreach ($chunks as $chunk) {
            $payload = array_map(function ($token) use ($title, $body, $data) {
                return [
                    'to' => $token,
                    'sound' => 'default',
                    'title' => $title,
                    'body' => $body,
                    'data' => $data,
                ];
            }, $chunk);

            try {
                $response = Http::withHeaders([
                    'Accept' => 'application/json',
                    'Accept-Encoding' => 'gzip, deflate',
                    'Content-Type' => 'application/json',
                ])->post('https://exp.host/--/api/v2/push/send', $payload);

                if ($response->successful()) {
                    $successCount += count($chunk);
                } else {
                    Log::error("Expo Push batch failed: " . $response->body());
                }
            } catch (\Exception $e) {
                Log::error("Expo Push batch exception: " . $e->getMessage());
            }
        }

        return $successCount;
    }
}
