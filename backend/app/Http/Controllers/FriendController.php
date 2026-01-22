<?php

namespace App\Http\Controllers;

use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FriendController extends Controller
{
    /**
     * Send a friend request.
     */
    public function sendRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        $receiverId = $request->receiver_id;

        // Cannot send request to self
        if ($user->id == $receiverId) {
            return response()->json(['message' => 'Cannot send friend request to yourself.'], 400);
        }

        // Check if already friends
        if ($user->friends()->where('friend_id', $receiverId)->exists()) {
            return response()->json(['message' => 'Already friends with this user.'], 400);
        }

        // Check if request already exists
        $existingRequest = FriendRequest::where(function($query) use ($user, $receiverId) {
            $query->where('sender_id', $user->id)->where('receiver_id', $receiverId);
        })->orWhere(function($query) use ($user, $receiverId) {
            $query->where('sender_id', $receiverId)->where('receiver_id', $user->id);
        })->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                return response()->json(['message' => 'Friend request already pending.'], 400);
            }
        }

        $friendRequest = FriendRequest::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Friend request sent successfully.',
            'request' => $friendRequest->load('receiver:id,surname,first_name'),
        ], 201);
    }

    /**
     * Accept a friend request.
     */
    public function acceptRequest($id)
    {
        $user = request()->user();
        $friendRequest = FriendRequest::findOrFail($id);

        // Verify the user is the receiver
        if ($friendRequest->receiver_id != $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($friendRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already processed.'], 400);
        }

        DB::transaction(function () use ($friendRequest) {
            // Update request status
            $friendRequest->update(['status' => 'accepted']);

            // Create bidirectional friendship
            DB::table('friendships')->insert([
                ['user_id' => $friendRequest->sender_id, 'friend_id' => $friendRequest->receiver_id, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $friendRequest->receiver_id, 'friend_id' => $friendRequest->sender_id, 'created_at' => now(), 'updated_at' => now()],
            ]);
        });

        return response()->json([
            'message' => 'Friend request accepted.',
            'friend' => User::find($friendRequest->sender_id)->only(['id', 'surname', 'first_name']),
        ]);
    }

    /**
     * Reject a friend request.
     */
    public function rejectRequest($id)
    {
        $user = request()->user();
        $friendRequest = FriendRequest::findOrFail($id);

        if ($friendRequest->receiver_id != $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($friendRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already processed.'], 400);
        }

        $friendRequest->update(['status' => 'rejected']);

        return response()->json(['message' => 'Friend request rejected.']);
    }

    /**
     * List all friends.
     */
    public function listFriends(Request $request)
    {
        $user = $request->user();
        $friends = $user->friends()->select('users.id', 'surname', 'first_name', 'passport_photograph')->get();

        return response()->json($friends);
    }

    /**
     * List pending friend requests (received).
     */
    public function listPendingRequests(Request $request)
    {
        $user = $request->user();
        $requests = FriendRequest::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with('sender:id,surname,first_name,passport_photograph')
            ->get();

        return response()->json($requests);
    }

    /**
     * Unfriend a user.
     */
    public function unfriend($id)
    {
        $user = request()->user();

        // Check if they are friends
        if (!$user->friends()->where('friend_id', $id)->exists()) {
            return response()->json(['message' => 'Not friends with this user.'], 400);
        }

        DB::transaction(function () use ($user, $id) {
            // Remove bidirectional friendship
            DB::table('friendships')->where('user_id', $user->id)->where('friend_id', $id)->delete();
            DB::table('friendships')->where('user_id', $id)->where('friend_id', $user->id)->delete();
        });

        return response()->json(['message' => 'Unfriended successfully.']);
    }
}
