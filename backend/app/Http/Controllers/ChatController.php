<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\ConversationParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class ChatController extends Controller
{
    /**
     * List user's conversations.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get private conversations
        $privateConversations = Conversation::where('type', 'private')
            ->whereHas('participants', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['users' => function($query) use ($user) {
                $query->where('users.id', '!=', $user->id); // Get other person info
            }, 'messages' => function($query) {
                $query->latest()->limit(1);
            }])
            ->get();

        // Get group conversations where user is an approved member
        $groupConversations = Conversation::where('type', 'group')
            ->whereHas('group.members', function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->where('status', 'approved');
            })
            ->with(['group', 'messages' => function($query) {
                $query->latest()->limit(1);
            }])
            ->get();

        $allConversations = $privateConversations->merge($groupConversations)
            ->sortByDesc('last_message_at')
            ->values();

        return response()->json($allConversations);
    }

    /**
     * Start a new conversation or get existing.
     */
    public function startConversation(Request $request)
    {
        $request->validate(['recipient_id' => 'required|exists:users,id']);
        $user = $request->user();
        $recipientId = $request->recipient_id;

        if ($user->id == $recipientId) {
            return response()->json(['message' => 'Cannot start chat with self.'], 400);
        }

        // Verify friendship before allowing private chat
        $areFriends = DB::table('friendships')
            ->where('user_id', $user->id)
            ->where('friend_id', $recipientId)
            ->exists();

        if (!$areFriends) {
            return response()->json(['message' => 'You must be friends to start a conversation.'], 403);
        }

        // Check if private conversation already exists between these two
        $conversation = Conversation::where('type', 'private')
            ->whereHas('participants', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereHas('participants', function($q) use ($recipientId) {
                $q->where('user_id', $recipientId);
            })
            ->first();

        if (!$conversation) {
            $conversation = DB::transaction(function () use ($user, $recipientId) {
                $conv = Conversation::create(['type' => 'private']);
                $conv->participants()->create(['user_id' => $user->id]);
                $conv->participants()->create(['user_id' => $recipientId]);
                return $conv;
            });
        }

        return response()->json($conversation->load('users'));
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();
        $conversation = Conversation::findOrFail($id);

        // Verify participation (private or group)
        if ($conversation->type === 'private') {
            if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        } elseif ($conversation->type === 'group') {
            $isMember = $conversation->group->members()
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();
            
            if (!$isMember) {
                return response()->json(['message' => 'You must be an approved member to send messages.'], 403);
            }
        }

        // Check if this is a media message
        if ($request->hasFile('media')) {
            return $this->handleMediaMessage($request, $conversation, $user);
        }

        // Regular text message
        $request->validate(['content' => 'required|string']);

        $message = $conversation->messages()->create([
            'user_id' => $user->id,
            'content' => $request->content,
            'type' => 'text'
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json($message);
    }

    /**
     * Handle media message upload
     */
    private function handleMediaMessage(Request $request, $conversation, $user)
    {
        $request->validate([
            'media' => 'required|file|max:51200', // 50MB max
            'type' => 'required|in:image,document,voice,video,file',
            'content' => 'nullable|string',
        ]);

        $file = $request->file('media');
        $type = $request->type;

        // Validate file type based on message type
        $this->validateMediaType($file, $type);

        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $directory = "messages/{$type}s";

        // Store file
        $path = $file->storeAs($directory, $filename, 'public');

        $messageData = [
            'user_id' => $user->id,
            'content' => $request->content ?? '',
            'type' => $type,
            'media_url' => $path,
            'media_size' => $file->getSize(),
            'media_mime_type' => $file->getMimeType(),
            'file_name' => $file->getClientOriginalName(),
        ];

        // Process based on type
        switch ($type) {
            case 'image':
                $messageData['thumbnail_url'] = $this->generateImageThumbnail($file, $directory);
                break;
            case 'voice':
            case 'video':
                $messageData['media_duration'] = $this->extractMediaDuration($file);
                if ($type === 'video') {
                    $messageData['thumbnail_url'] = $this->generateVideoThumbnail($file, $directory);
                }
                break;
        }

        $message = $conversation->messages()->create($messageData);
        $conversation->update(['last_message_at' => now()]);

        return response()->json($message->load('user:id,surname,first_name'));
    }

    /**
     * Validate media type
     */
    private function validateMediaType($file, $type)
    {
        $mimeType = $file->getMimeType();
        
        $allowedTypes = [
            'image' => ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
            'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'voice' => ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'],
            'video' => ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'],
        ];

        if (isset($allowedTypes[$type]) && !in_array($mimeType, $allowedTypes[$type])) {
            abort(422, "Invalid file type for {$type}. Received: {$mimeType}");
        }
    }

    /**
     * Generate thumbnail for image
     */
    private function generateImageThumbnail($file, $directory)
    {
        try {
            $thumbnailName = 'thumb_' . Str::uuid() . '.jpg';
            $thumbnailPath = $directory . '/thumbnails/' . $thumbnailName;
            
            $img = Image::make($file)
                ->fit(300, 300)
                ->encode('jpg', 80);
            
            Storage::disk('public')->put($thumbnailPath, $img);
            
            return $thumbnailPath;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate thumbnail for video (placeholder for now)
     */
    private function generateVideoThumbnail($file, $directory)
    {
        // TODO: Implement video thumbnail generation using FFmpeg
        // For now, return null
        return null;
    }

    /**
     * Extract media duration (placeholder for now)
     */
    private function extractMediaDuration($file)
    {
        // TODO: Implement duration extraction using getID3 or FFmpeg
        // For now, return null
        return null;
    }

    /**
     * Download media file
     */
    public function downloadMedia($messageId)
    {
        $user = request()->user();
        $message = Message::findOrFail($messageId);
        $conversation = $message->conversation;

        // Verify access
        if ($conversation->type === 'private') {
            if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        } elseif ($conversation->type === 'group') {
            $isMember = $conversation->group->members()
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();
            
            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        if (!$message->media_url) {
            return response()->json(['message' => 'No media file found.'], 404);
        }

        $filePath = storage_path('app/public/' . $message->media_url);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return response()->download($filePath, $message->file_name);
    }

    /**
     * Delete media message (sender only)
     */
    public function deleteMedia($messageId)
    {
        $user = request()->user();
        $message = Message::findOrFail($messageId);

        // Only sender can delete
        if ($message->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Delete files from storage
        if ($message->media_url) {
            Storage::disk('public')->delete($message->media_url);
        }
        if ($message->thumbnail_url) {
            Storage::disk('public')->delete($message->thumbnail_url);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully.']);
    }

    /**
     * Get messages for a conversation.
     */
    public function getMessages(Request $request, $id)
    {
        $user = $request->user();
        $conversation = Conversation::findOrFail($id);

        // Verify access (private or group)
        if ($conversation->type === 'private') {
            if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        } elseif ($conversation->type === 'group') {
            $isMember = $conversation->group->members()
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();
            
            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $messages = $conversation->messages()->with('user:id,surname,first_name')->latest()->paginate(50);

        // Mark as read (only for private chats)
        if ($conversation->type === 'private') {
            $conversation->participants()->where('user_id', $user->id)->update(['last_read_at' => now()]);
        }

        return response()->json($messages);
    }
}
