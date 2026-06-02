<?php

namespace App\Http\Controllers;

use App\Models\AppDeveloper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AppDeveloperController extends Controller
{
    /**
     * Get active developers list (Public/Student)
     */
    public function index()
    {
        $developers = AppDeveloper::where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();
        return response()->json($developers);
    }

    /**
     * Store a new developer profile (Admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized admin operation.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'donation' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'github' => 'nullable|string|max:2048',
            'linkedin' => 'nullable|string|max:2048',
            'twitter' => 'nullable|string|max:2048',
            'description' => 'nullable|string',
            'photo' => 'nullable|string', // base64 string
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except(['photo']);

        if ($request->filled('photo')) {
            try {
                $imagePath = $this->uploadBase64Image($request->photo, 'developer-photos');
                $data['photo_url'] = url($imagePath);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to parse image: ' . $e->getMessage()], 422);
            }
        }

        $developer = AppDeveloper::create(array_merge($data, ['is_active' => true]));

        return response()->json([
            'message' => 'Developer profile created successfully.',
            'data' => $developer
        ], 201);
    }

    /**
     * Update an existing developer profile (Admin only)
     */
    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized admin operation.'], 403);
        }

        $developer = AppDeveloper::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'donation' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'github' => 'nullable|string|max:2048',
            'linkedin' => 'nullable|string|max:2048',
            'twitter' => 'nullable|string|max:2048',
            'description' => 'nullable|string',
            'photo' => 'nullable|string', // base64 string
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except(['photo']);

        if ($request->filled('photo')) {
            try {
                // Delete old image if exists on disk
                if ($developer->photo_url) {
                    $oldPath = str_replace(url('/'), '', $developer->photo_url);
                    $oldPath = ltrim(str_replace('storage/', '', $oldPath), '/');
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                $imagePath = $this->uploadBase64Image($request->photo, 'developer-photos');
                $data['photo_url'] = url($imagePath);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to parse image: ' . $e->getMessage()], 422);
            }
        }

        $developer->update($data);

        return response()->json([
            'message' => 'Developer profile updated successfully.',
            'data' => $developer
        ]);
    }

    /**
     * Delete developer profile (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized admin operation.'], 403);
        }

        $developer = AppDeveloper::findOrFail($id);

        // Delete photo if exists
        if ($developer->photo_url) {
            $oldPath = str_replace(url('/'), '', $developer->photo_url);
            $oldPath = ltrim(str_replace('storage/', '', $oldPath), '/');
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $developer->delete();

        return response()->json(['message' => 'Developer profile deleted successfully.']);
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
