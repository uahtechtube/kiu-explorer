<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMember;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GroupController extends Controller
{
    /**
     * List/search groups.
     */
    public function index(Request $request)
    {
        $query = Group::with('creator:id,surname,first_name')
            ->withCount(['approvedMembers']);

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Only show public groups unless user is a member
        $user = $request->user();
        $query->where(function($q) use ($user) {
            $q->where('is_public', true)
              ->orWhereHas('members', function($memberQuery) use ($user) {
                  $memberQuery->where('user_id', $user->id);
              });
        });

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * Create a new group.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:departmental,general,course',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();

        $group = DB::transaction(function () use ($request, $user) {
            // Create group
            $group = Group::create([
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'creator_id' => $user->id,
                'is_public' => $request->is_public ?? true,
            ]);

            // Add creator as admin member
            GroupMember::create([
                'group_id' => $group->id,
                'user_id' => $user->id,
                'role' => 'admin',
                'status' => 'approved',
            ]);

            // Create conversation for the group
            Conversation::create([
                'name' => $group->name,
                'type' => 'group',
                'group_id' => $group->id,
            ]);

            return $group;
        });

        return response()->json([
            'message' => 'Group created successfully.',
            'group' => $group->load('creator'),
        ], 201);
    }

    /**
     * Get group details.
     */
    public function show($id)
    {
        $group = Group::with(['creator:id,surname,first_name', 'approvedMembers.user:id,surname,first_name,passport_photograph'])
            ->findOrFail($id);

        return response()->json($group);
    }

    /**
     * Request to join a group.
     */
    public function requestJoin($id)
    {
        $user = request()->user();
        $group = Group::findOrFail($id);

        // Check if already a member
        $existingMember = GroupMember::where('group_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingMember) {
            if ($existingMember->status === 'approved') {
                return response()->json(['message' => 'Already a member of this group.'], 400);
            } elseif ($existingMember->status === 'pending') {
                return response()->json(['message' => 'Join request already pending.'], 400);
            }
        }

        $member = GroupMember::create([
            'group_id' => $id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Join request sent. Waiting for admin approval.',
            'request' => $member,
        ], 201);
    }

    /**
     * Approve a join request (admin only).
     */
    public function approveJoinRequest($groupId, $userId)
    {
        $user = request()->user();
        $group = Group::findOrFail($groupId);

        // Verify user is admin
        $isAdmin = GroupMember::where('group_id', $groupId)
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->where('status', 'approved')
            ->exists();

        if (!$isAdmin) {
            return response()->json(['message' => 'Only group admins can approve join requests.'], 403);
        }

        $member = GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($member->status !== 'pending') {
            return response()->json(['message' => 'Request already processed.'], 400);
        }

        $member->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Join request approved.',
            'member' => $member->load('user:id,surname,first_name'),
        ]);
    }

    /**
     * Reject a join request (admin only).
     */
    public function rejectJoinRequest($groupId, $userId)
    {
        $user = request()->user();

        // Verify user is admin
        $isAdmin = GroupMember::where('group_id', $groupId)
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->where('status', 'approved')
            ->exists();

        if (!$isAdmin) {
            return response()->json(['message' => 'Only group admins can reject join requests.'], 403);
        }

        $member = GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($member->status !== 'pending') {
            return response()->json(['message' => 'Request already processed.'], 400);
        }

        $member->update(['status' => 'rejected']);

        return response()->json(['message' => 'Join request rejected.']);
    }

    /**
     * List group members.
     */
    public function listMembers($id)
    {
        $members = GroupMember::where('group_id', $id)
            ->where('status', 'approved')
            ->with('user:id,surname,first_name,passport_photograph')
            ->get();

        return response()->json($members);
    }

    /**
     * Leave a group.
     */
    public function leave($id)
    {
        $user = request()->user();

        $member = GroupMember::where('group_id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Not a member of this group.'], 400);
        }

        // Prevent last admin from leaving
        if ($member->role === 'admin') {
            $adminCount = GroupMember::where('group_id', $id)
                ->where('role', 'admin')
                ->where('status', 'approved')
                ->count();

            if ($adminCount === 1) {
                return response()->json(['message' => 'Cannot leave group as the only admin. Assign another admin first.'], 400);
            }
        }

        $member->delete();

        return response()->json(['message' => 'Left group successfully.']);
    }
}
