<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class TutorialController extends Controller
{
    /**
     * List tutorials for a specific course.
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'sometimes|exists:courses,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $query = Tutorial::with(['uploader:id,surname,first_name', 'course:id,code,title']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        $tutorials = $query->orderBy('created_at', 'desc')->get();
            
        // Append URL manually if not using accessors in API resource
        $tutorials->transform(function ($tutorial) {
            $tutorial->url = asset('storage/' . $tutorial->file_path);
            // Map course code/title to category for now if needed, or frontend handles it
            $tutorial->category = $tutorial->course ? $tutorial->course->code : 'General';
            return $tutorial;
        });

        return response()->json([
            'message' => 'Tutorials retrieved successfully',
            'data' => $tutorials
        ]);
    }

    /**
     * Upload a new tutorial (Lecturer/Admin).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:51200', // Max 50MB (adjust as needed)
            'file_type' => 'required|in:video,pdf,audio', // Client declares type, or we infer
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Authorize (Allow Lecturer or Admin)
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'lecturer'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $file = $request->file('file');
        $path = $file->store('tutorials', 'public'); // Store in storage/app/public/tutorials

        $tutorial = Tutorial::create([
            'course_id' => $request->course_id,
            'uploaded_by' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $path,
            'file_type' => $request->file_type,
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'message' => 'Tutorial uploaded successfully',
            'tutorial' => $tutorial,
            'url' => asset('storage/' . $path)
        ], 201);
    }
}
