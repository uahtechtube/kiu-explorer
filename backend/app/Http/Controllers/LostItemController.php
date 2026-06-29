<?php

namespace App\Http\Controllers;

use App\Models\LostItem;
use App\Models\LostItemComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class LostItemController extends Controller
{
    /**
     * Display a listing of active lost and found items.
     */
    public function index(Request $request)
    {
        $query = LostItem::with(['user']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $items = $query->orderByDesc('created_at')->get();

        return response()->json($items);
    }

    /**
     * Display the specified lost and found item with its comments.
     */
    public function show($id)
    {
        $item = LostItem::with(['user', 'comments.user'])->findOrFail($id);
        return response()->json($item);
    }

    /**
     * Store a newly created lost and found item.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'contact_details' => 'required|string|max:255',
            'type' => 'required|in:lost,found',
            'founder' => 'nullable|string|max:255',
            'image' => 'nullable|string', // base64 representation of image
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $data = $request->except(['image']);
            $data['user_id'] = $request->user()->id;

            if ($request->has('image') && $request->image) {
                $imagePath = $this->uploadBase64Image($request->image, 'lost-found');
                $data['image_url'] = $imagePath;
            }

            $item = LostItem::create($data);

            return response()->json([
                'message' => 'Item reported successfully.',
                'data' => $item->load('user')
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to store report: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified lost and found item.
     */
    public function update(Request $request, $id)
    {
        $item = LostItem::findOrFail($id);
        $user = $request->user();

        // Check if user is owner or admin
        if ($item->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'contact_details' => 'required|string|max:255',
            'type' => 'required|in:lost,found',
            'founder' => 'nullable|string|max:255',
            'image' => 'nullable|string', // base64 representation of image
            'status' => 'sometimes|in:open,resolved',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $data = $request->except(['image']);

            if ($request->has('image') && $request->image) {
                // Delete old image file
                if ($item->image_url) {
                    $oldPath = str_replace('storage/', '', $item->image_url);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                $imagePath = $this->uploadBase64Image($request->image, 'lost-found');
                $data['image_url'] = $imagePath;
            }

            $item->update($data);

            return response()->json([
                'message' => 'Item report updated successfully.',
                'data' => $item->load('user')
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update report: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified lost and found item.
     */
    public function destroy(Request $request, $id)
    {
        $item = LostItem::findOrFail($id);
        $user = $request->user();

        if ($item->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Delete image file from storage
        if ($item->image_url) {
            $path = str_replace('storage/', '', $item->image_url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $item->delete();

        return response()->json(['message' => 'Item report deleted successfully.']);
    }

    /**
     * Resolve / change status of the lost and found item.
     */
    public function toggleStatus(Request $request, $id)
    {
        $item = LostItem::findOrFail($id);
        $user = $request->user();

        if ($item->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|in:open,resolved',
        ]);

        $item->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Item status updated successfully.',
            'data' => $item->load('user')
        ]);
    }

    /**
     * Add a comment (message) to a lost and found post.
     */
    public function addComment(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $item = LostItem::findOrFail($id);

        $comment = LostItemComment::create([
            'lost_item_id' => $item->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Comment added successfully.',
            'data' => $comment->load('user')
        ], 201);
    }

    /**
     * Remove a comment.
     */
    public function deleteComment(Request $request, $id)
    {
        $comment = LostItemComment::findOrFail($id);
        $user = $request->user();

        if ($comment->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }

    /**
     * Display a listing of all items for Admin Dashboard.
     */
    public function adminIndex(Request $request)
    {
        if ($request->user() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $query = LostItem::with(['user']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $items = $query->orderByDesc('created_at')->get();

        return response()->json($items);
    }

    /**
     * Helper method to upload base64 image
     */
    private function uploadBase64Image($base64String, $folder = 'images')
    {
        if (strpos($base64String, 'data:image') === 0) {
            $image = str_replace('data:image/', '', $base64String);
            $image = explode(';base64,', $image);
            $extension = $image[0];
            $imageData = base64_decode($image[1]);
        } elseif (strpos($base64String, 'file://') === 0 || strpos($base64String, '/') === 0) {
            $filePath = str_replace('file://', '', $base64String);
            if (file_exists($filePath)) {
                $imageData = file_get_contents($filePath);
                $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            } else {
                throw new \Exception('Image file not found');
            }
        } else {
            $imageData = base64_decode($base64String);
            $extension = 'jpg';
        }

        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $path = $folder . '/' . $fileName;

        Storage::disk('public')->put($path, $imageData);

        return 'storage/' . $path;
    }
}
