<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Post;
use App\Models\Comment;
use App\Models\User;
use App\Models\Tutorial;
use App\Models\LibraryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModerationController extends Controller
{

    /**
     * Get all content reports
     */
    public function getReports(Request $request)
    {
        $query = Report::with(['reporter:id,surname,first_name,email', 'reportable']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('reportable_type', $request->type);
        }

        $reports = $query->latest()->paginate(20);

        return response()->json([
            'data' => $reports->items(),
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'total_pages' => $reports->lastPage(),
                'total' => $reports->total(),
            ]
        ]);
    }

    /**
     * Get pending content awaiting approval
     */
    public function getPendingContent()
    {
        $pendingTutorials = Tutorial::where('status', 'pending')
            ->with('lecturer:id,surname,first_name')
            ->get()
            ->map(function ($tutorial) {
                return [
                    'id' => $tutorial->id,
                    'type' => 'tutorial',
                    'title' => $tutorial->title,
                    'description' => $tutorial->description,
                    'uploaded_by' => $tutorial->lecturer->surname . ' ' . $tutorial->lecturer->first_name,
                    'created_at' => $tutorial->created_at,
                ];
            });

        $pendingLibrary = LibraryResource::where('status', 'pending')
            ->with('uploader:id,surname,first_name')
            ->get()
            ->map(function ($resource) {
                return [
                    'id' => $resource->id,
                    'type' => 'library',
                    'title' => $resource->title,
                    'description' => $resource->description,
                    'uploaded_by' => $resource->uploader->surname . ' ' . $resource->uploader->first_name,
                    'created_at' => $resource->created_at,
                ];
            });

        $pendingPosts = Post::where('status', 'pending')
            ->with('user:id,surname,first_name')
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'type' => 'post',
                    'title' => 'Social Post',
                    'description' => $post->content,
                    'uploaded_by' => $post->user->surname . ' ' . $post->user->first_name,
                    'created_at' => $post->created_at,
                ];
            });

        $allPending = collect()
            ->merge($pendingTutorials)
            ->merge($pendingLibrary)
            ->merge($pendingPosts)
            ->sortByDesc('created_at')
            ->values();

        return response()->json([
            'data' => $allPending,
            'counts' => [
                'tutorials' => $pendingTutorials->count(),
                'library' => $pendingLibrary->count(),
                'posts' => $pendingPosts->count(),
                'total' => $allPending->count(),
            ]
        ]);
    }

    /**
     * Approve content
     */
    public function approveContent(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|in:tutorial,library,post',
        ]);

        $model = $this->getModelByType($request->type);
        $content = $model::findOrFail($id);
        
        $content->update(['status' => 'approved']);

        return response()->json([
            'message' => ucfirst($request->type) . ' approved successfully',
            'content' => $content
        ]);
    }

    /**
     * Reject content
     */
    public function rejectContent(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|in:tutorial,library,post',
            'reason' => 'nullable|string',
        ]);

        $model = $this->getModelByType($request->type);
        $content = $model::findOrFail($id);
        
        $content->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        return response()->json([
            'message' => ucfirst($request->type) . ' rejected',
            'content' => $content
        ]);
    }

    /**
     * Delete flagged content
     */
    public function deleteContent(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|in:post,comment,tutorial,library',
        ]);

        $model = $this->getModelByType($request->type);
        $content = $model::findOrFail($id);
        
        $content->delete();

        // Mark related reports as resolved
        Report::where('reportable_type', get_class($content))
            ->where('reportable_id', $id)
            ->update(['status' => 'resolved', 'admin_notes' => 'Content deleted']);

        return response()->json([
            'message' => ucfirst($request->type) . ' deleted successfully'
        ]);
    }

    /**
     * Resolve a report
     */
    public function resolveReport(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        
        $request->validate([
            'action' => 'required|in:dismiss,delete,warn',
            'notes' => 'nullable|string',
        ]);

        if ($request->action === 'delete') {
            // Delete the reported content
            $report->reportable->delete();
            $report->update([
                'status' => 'resolved',
                'admin_notes' => $request->notes ?? 'Content deleted'
            ]);
        } elseif ($request->action === 'warn') {
            // Issue warning (you can implement a warnings system)
            $report->update([
                'status' => 'resolved',
                'admin_notes' => $request->notes ?? 'User warned'
            ]);
        } else {
            // Dismiss report
            $report->update([
                'status' => 'reviewed',
                'admin_notes' => $request->notes ?? 'Report dismissed'
            ]);
        }

        return response()->json([
            'message' => 'Report resolved successfully',
            'report' => $report
        ]);
    }

    /**
     * Get system statistics for moderation
     */
    public function getStats()
    {
        return response()->json([
            'reports' => [
                'pending' => Report::pending()->count(),
                'reviewed' => Report::reviewed()->count(),
                'resolved' => Report::resolved()->count(),
                'total' => Report::count(),
            ],
            'pending_content' => [
                'tutorials' => Tutorial::where('status', 'pending')->count(),
                'library' => LibraryResource::where('status', 'pending')->count(),
                'posts' => Post::where('status', 'pending')->count(),
            ],
            'recent_reports' => Report::with(['reporter:id,surname,first_name'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }

    /**
     * Helper method to get model class by type
     */
    private function getModelByType($type)
    {
        return match($type) {
            'tutorial' => Tutorial::class,
            'library' => LibraryResource::class,
            'post' => Post::class,
            'comment' => Comment::class,
            default => throw new \Exception('Invalid content type'),
        };
    }

    /**
     * Bulk approve content
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'type' => 'required|in:tutorial,library,post'
        ]);

        $model = $this->getModelByType($request->type);
        
        $updated = $model::whereIn('id', $request->ids)
            ->update(['status' => 'approved']);

        return response()->json([
            'message' => "{$updated} items approved successfully",
            'count' => $updated
        ]);
    }

    /**
     * Bulk reject content
     */
    public function bulkReject(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'type' => 'required|in:tutorial,library,post',
            'reason' => 'nullable|string'
        ]);

        $model = $this->getModelByType($request->type);
        
        $updated = $model::whereIn('id', $request->ids)
            ->update([
                'status' => 'rejected',
                'rejection_reason' => $request->reason ?? 'Bulk rejection'
            ]);

        return response()->json([
            'message' => "{$updated} items rejected",
            'count' => $updated
        ]);
    }

    /**
     * Bulk delete content
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'type' => 'required|in:tutorial,library,post,comment'
        ]);

        $model = $this->getModelByType($request->type);
        
        $deleted = $model::whereIn('id', $request->ids)->delete();

        // Mark related reports as resolved
        Report::where('reportable_type', $model)
            ->whereIn('reportable_id', $request->ids)
            ->update(['status' => 'resolved', 'admin_notes' => 'Content bulk deleted']);

        return response()->json([
            'message' => "{$deleted} items deleted successfully",
            'count' => $deleted
        ]);
    }
}
