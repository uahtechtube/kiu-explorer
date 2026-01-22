<?php

namespace App\Http\Controllers;

use App\Models\Association;
use App\Models\AssociationMember;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AssociationController extends Controller
{
    /**
     * Get all associations
     */
    public function index(Request $request)
    {
        $query = Association::where('status', 'active');

        // Search
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('acronym', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $associations = $query->withCount('members')->get();

        // Add membership status for authenticated user
        if ($request->user()) {
            $associations->each(function($association) use ($request) {
                $association->is_member = AssociationMember::where('association_id', $association->id)
                    ->where('user_id', $request->user()->id)
                    ->exists();
            });
        }

        return response()->json([
            'success' => true,
            'data' => $associations
        ]);
    }

    /**
     * Get single association details
     */
    public function show(Request $request, $id)
    {
        $association = Association::with(['members.user', 'events'])
            ->withCount('members')
            ->findOrFail($id);

        if ($request->user()) {
            $membership = AssociationMember::where('association_id', $association->id)
                ->where('user_id', $request->user()->id)
                ->first();

            $association->is_member = $membership !== null;
            $association->member_role = $membership ? $membership->role : null;
        }

        return response()->json([
            'success' => true,
            'data' => $association
        ]);
    }

    /**
     * Create new association (Admin only)
     */
    public function store(Request $request)
    {
        // Authorization check
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can create associations'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:associations,name',
            'acronym' => 'required|string|max:20|unique:associations,acronym',
            'description' => 'required|string',
            'category' => 'required|in:Academic,Social,Sports,Cultural,Professional,Other',
            'president_id' => 'nullable|exists:users,id',
            'meeting_schedule' => 'nullable|string',
            'logo' => 'nullable|image|max:1024',
            'cover_image' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['status'] = 'active';

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('associations/logos', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('associations/covers', 'public');
            $data['cover_image_url'] = Storage::url($path);
        }

        $association = Association::create($data);

        // Add president as member if specified
        if ($request->president_id) {
            AssociationMember::create([
                'association_id' => $association->id,
                'user_id' => $request->president_id,
                'role' => 'president',
                'status' => 'active'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Association created successfully',
            'data' => $association
        ], 201);
    }

    /**
     * Update association
     */
    public function update(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Authorization check - only admin or president
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$membership || $membership->role !== 'president')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this association'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:associations,name,' . $id,
            'acronym' => 'sometimes|required|string|max:20|unique:associations,acronym,' . $id,
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|in:Academic,Social,Sports,Cultural,Professional,Other',
            'president_id' => 'nullable|exists:users,id',
            'meeting_schedule' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
            'logo' => 'nullable|image|max:1024',
            'cover_image' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['created_at', 'updated_at']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($association->logo_url) {
                $oldPath = str_replace('/storage/', '', $association->logo_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('logo')->store('associations/logos', 'public');
            $data['logo_url'] = Storage::url($path);
        }

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            if ($association->cover_image_url) {
                $oldPath = str_replace('/storage/', '', $association->cover_image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('cover_image')->store('associations/covers', 'public');
            $data['cover_image_url'] = Storage::url($path);
        }

        $association->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Association updated successfully',
            'data' => $association
        ]);
    }

    /**
     * Delete association (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete associations'
            ], 403);
        }

        $association = Association::findOrFail($id);

        // Delete images
        if ($association->logo_url) {
            $path = str_replace('/storage/', '', $association->logo_url);
            Storage::disk('public')->delete($path);
        }
        if ($association->cover_image_url) {
            $path = str_replace('/storage/', '', $association->cover_image_url);
            Storage::disk('public')->delete($path);
        }

        $association->delete();

        return response()->json([
            'success' => true,
            'message' => 'Association deleted successfully'
        ]);
    }

    /**
     * Join association
     */
    public function join(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Check if already a member
        $existing = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Already a member of this association'
            ], 400);
        }

        $membership = AssociationMember::create([
            'association_id' => $association->id,
            'user_id' => $request->user()->id,
            'role' => 'member',
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully joined association',
            'data' => $membership
        ]);
    }

    /**
     * Leave association
     */
    public function leave(Request $request, $id)
    {
        $membership = AssociationMember::where('association_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$membership) {
            return response()->json([
                'success' => false,
                'message' => 'Not a member of this association'
            ], 404);
        }

        // Prevent president from leaving
        if ($membership->role === 'president') {
            return response()->json([
                'success' => false,
                'message' => 'President cannot leave association. Transfer leadership first.'
            ], 400);
        }

        $membership->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully left association'
        ]);
    }

    /**
     * Get user's associations
     */
    public function myAssociations(Request $request)
    {
        $memberships = AssociationMember::with('association')
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->get();

        $associations = $memberships->map(function($membership) {
            $assoc = $membership->association;
            $assoc->member_role = $membership->role;
            return $assoc;
        });

        return response()->json([
            'success' => true,
            'data' => $associations
        ]);
    }

    /**
     * Get association members (for executives)
     */
    public function members(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Check if user is executive
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$membership || !in_array($membership->role, ['president', 'vice_president', 'secretary'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only executives can view member list'
            ], 403);
        }

        $members = AssociationMember::with('user')
            ->where('association_id', $association->id)
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }
}
