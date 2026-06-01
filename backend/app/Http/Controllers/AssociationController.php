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
                $membership = AssociationMember::where('association_id', $association->id)
                    ->where('user_id', $request->user()->id)
                    ->first();
                $association->is_member = $membership !== null && $membership->status === 'approved';
                $association->membership_status = $membership ? $membership->status : null;
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
        $association = Association::with(['members.user', 'events', 'documents'])
            ->withCount('members')
            ->findOrFail($id);

        if ($request->user()) {
            $membership = AssociationMember::where('association_id', $association->id)
                ->where('user_id', $request->user()->id)
                ->first();

            $association->is_member = $membership !== null && $membership->status === 'approved';
            $association->membership_status = $membership ? $membership->status : null;
            $association->member_role = $membership ? $membership->role : null;
        }

        return response()->json([
            'success' => true,
            'data' => $association
        ]);
    }

    /**
     * Create new association
     */
    public function store(Request $request)
    {
        // Authorization check - allow both admin and student
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators and students can create associations'
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

        // Auto-assign student creator as president
        if ($request->user()->role === 'student' && empty($data['president_id'])) {
            $data['president_id'] = $request->user()->id;
        }

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

        // Add president as approved member if specified
        $presidentId = $association->president_id ?: $request->user()->id;
        AssociationMember::create([
            'association_id' => $association->id,
            'user_id' => $presidentId,
            'role' => 'president',
            'status' => 'approved', // Automatically approved president membership
            'joined_at' => now()
        ]);

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
     * Delete association (Admin or President)
     */
    public function destroy(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Authorization check - only admin or president
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$membership || $membership->role !== 'president')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this association. Only system administrators or the association president can disband it.'
            ], 403);
        }

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
     * Join association (Pending approval)
     */
    public function join(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Check if already a member or pending request
        $existing = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Already requested or joined this association (Status: ' . ucfirst($existing->status) . ')'
            ], 400);
        }

        $membership = AssociationMember::create([
            'association_id' => $association->id,
            'user_id' => $request->user()->id,
            'role' => 'member',
            'status' => 'pending', // Awaiting approval
            'joined_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Membership request submitted successfully. Awaiting approval.',
            'data' => $membership
        ]);
    }

    /**
     * Get pending join requests (for executives / admin)
     */
    public function pendingRequests(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Check if user is executive
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$membership || !in_array($membership->role, ['president', 'vice_president', 'secretary']))) {
            return response()->json([
                'success' => false,
                'message' => 'Only executives or administrators can view join requests'
            ], 403);
        }

        $requests = AssociationMember::with('user')
            ->where('association_id', $association->id)
            ->where('status', 'pending')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Approve join request
     */
    public function approveRequest(Request $request, $associationId, $userId)
    {
        $association = Association::findOrFail($associationId);

        // Check if logged-in user is executive
        $execMembership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$execMembership || !in_array($execMembership->role, ['president', 'vice_president', 'secretary']))) {
            return response()->json([
                'success' => false,
                'message' => 'Only executives or administrators can approve requests'
            ], 403);
        }

        $member = AssociationMember::where('association_id', $associationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $member->update([
            'status' => 'approved',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Join request approved successfully',
            'data' => $member
        ]);
    }

    /**
     * Reject/Remove join request
     */
    public function rejectRequest(Request $request, $associationId, $userId)
    {
        $association = Association::findOrFail($associationId);

        // Check if logged-in user is executive
        $execMembership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$execMembership || !in_array($execMembership->role, ['president', 'vice_president', 'secretary']))) {
            return response()->json([
                'success' => false,
                'message' => 'Only executives or administrators can reject requests'
            ], 403);
        }

        $member = AssociationMember::where('association_id', $associationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $member->delete(); // Delete the pending request completely

        return response()->json([
            'success' => true,
            'message' => 'Join request rejected and removed'
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
            ->where('status', 'approved')
            ->get();

        $associations = $memberships->map(function($membership) {
            $assoc = $membership->association;
            if ($assoc) {
                $assoc->member_role = $membership->role;
            }
            return $assoc;
        })->filter();

        return response()->json([
            'success' => true,
            'data' => $associations->values()
        ]);
    }

    /**
     * Get association members (for executives & admins)
     */
    public function members(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Check if user is executive
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$membership || !in_array($membership->role, ['president', 'vice_president', 'secretary']))) {
            return response()->json([
                'success' => false,
                'message' => 'Only executives or administrators can view member list'
            ], 403);
        }

        $members = AssociationMember::with('user')
            ->where('association_id', $association->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }

    /**
     * Add document to association archive
     */
    public function addDocument(Request $request, $id)
    {
        $association = Association::findOrFail($id);

        // Authorization check - only admin or president
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$membership || $membership->role !== 'president')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to add documents'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'file_url' => 'required|string',
            'type' => 'nullable|string|max:10',
        ]);

        $document = \App\Models\AssociationDocument::create([
            'association_id' => $association->id,
            'title' => $request->title,
            'file_path' => $request->file_url,
            'file_type' => $request->type ?? 'PDF',
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document added successfully to archives',
            'data' => $document
        ], 201);
    }

    /**
     * Delete document from association archive
     */
    public function deleteDocument(Request $request, $associationId, $documentId)
    {
        $association = Association::findOrFail($associationId);

        // Authorization check - only admin or president
        $membership = AssociationMember::where('association_id', $association->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($request->user()->role !== 'admin' && (!$membership || $membership->role !== 'president')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete documents'
            ], 403);
        }

        $document = \App\Models\AssociationDocument::where('association_id', $associationId)
            ->where('id', $documentId)
            ->firstOrFail();

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document removed from archives'
        ]);
    }
}
