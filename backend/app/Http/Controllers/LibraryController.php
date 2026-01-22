<?php

namespace App\Http\Controllers;

use App\Models\LibraryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LibraryController extends Controller
{
    /**
     * List library resources
     */
    public function index(Request $request)
    {
        $query = LibraryResource::with(['course', 'uploader:id,surname,first_name'])
            ->where('is_approved', true)
            ->where('is_public', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $resources = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($resources);
    }

    /**
     * Get specific resource
     */
    public function show($id)
    {
        $resource = LibraryResource::with(['course', 'uploader:id,surname,first_name'])->findOrFail($id);

        return response()->json($resource);
    }

    /**
     * Upload resource (Lecturer/Admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'category' => 'required|in:textbook,journal,past_question,reference,research,other',
            'description' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'file' => 'required|file|max:51200|mimes:pdf,doc,docx,ppt,pptx', // 50MB
            'cover_image' => 'nullable|image|max:5120', // 5MB
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('library', $filename, 'public');

        $data = $request->except(['file', 'cover_image']);
        $data['file_path'] = $path;
        $data['file_type'] = $file->getClientOriginalExtension();
        $data['file_size'] = $file->getSize();
        $data['uploaded_by'] = $request->user()->id;
        $data['is_approved'] = $request->user()->isAdmin(); // Auto-approve for admin

        if ($request->hasFile('cover_image')) {
            $cover = $request->file('cover_image');
            $coverName = 'cover_' . Str::uuid() . '.' . $cover->getClientOriginalExtension();
            $coverPath = $cover->storeAs('library/covers', $coverName, 'public');
            $data['cover_image'] = $coverPath;
        }

        $resource = LibraryResource::create($data);

        return response()->json([
            'message' => 'Resource uploaded successfully.',
            'data' => $resource
        ], 201);
    }

    /**
     * Download resource
     */
    public function download($id)
    {
        $resource = LibraryResource::findOrFail($id);

        if (!$resource->is_approved || !$resource->is_public) {
            return response()->json(['message' => 'Resource not available.'], 403);
        }

        $filePath = storage_path('app/public/' . $resource->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        $resource->incrementDownloads();

        return response()->download($filePath, $resource->title . '.' . $resource->file_type);
    }

    /**
     * Approve resource (Admin only)
     */
    public function approve($id)
    {
        $resource = LibraryResource::findOrFail($id);

        $resource->update([
            'is_approved' => true,
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Resource approved successfully.',
            'data' => $resource
        ]);
    }

    /**
     * Delete resource
     */
    public function destroy($id)
    {
        $resource = LibraryResource::findOrFail($id);

        // Delete files
        if ($resource->file_path) {
            Storage::disk('public')->delete($resource->file_path);
        }
        if ($resource->cover_image) {
            Storage::disk('public')->delete($resource->cover_image);
        }

        $resource->delete();

        return response()->json(['message' => 'Resource deleted successfully.']);
    }
}
