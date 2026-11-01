<?php

namespace App\Http\Controllers;

use App\Models\Advert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdvertController extends Controller
{
    /**
     * Display active adverts for students.
     */
    public function index(Request $request)
    {
        $adverts = Advert::where('is_active', true)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($adverts);
    }

    /**
     * Display the specified advert.
     */
    public function show($id)
    {
        $advert = Advert::findOrFail($id);

        // Check if student is attempting to view inactive advert
        if (!$advert->is_active && (!request()->user() || !request()->user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($advert);
    }

    /**
     * Display all adverts for admin management.
     */
    public function adminIndex(Request $request)
    {
        if ($request->user() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $query = Advert::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $adverts = $query->orderByDesc('created_at')->get();

        return response()->json($adverts);
    }

    /**
     * Store a newly created advert.
     */
    public function store(Request $request)
    {
        if ($request->user() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'media_type' => 'required|in:image,video,none',
            'media_file' => 'nullable|file|max:51200', // 50MB
            'external_link' => 'nullable|string',
            'is_active' => 'string|in:true,false,1,0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except(['media_file']);
        $data['created_by'] = $request->user()->id;
        $data['is_active'] = $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true;

        if ($request->hasFile('media_file') && $request->media_type !== 'none') {
            $file = $request->file('media_file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('adverts', $filename, 'public');
            $data['media_url'] = $path;
        }

        $advert = Advert::create($data);

        return response()->json([
            'message' => 'Advert created successfully.',
            'data' => $advert
        ], 201);
    }

    /**
     * Update the specified advert.
     */
    public function update(Request $request, $id)
    {
        if ($request->user() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $advert = Advert::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'media_type' => 'required|in:image,video,none',
            'media_file' => 'nullable|file|max:51200', // 50MB
            'external_link' => 'nullable|string',
            'is_active' => 'string|in:true,false,1,0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except(['media_file']);
        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('media_file') && $request->media_type !== 'none') {
            // Delete old file
            if ($advert->media_url) {
                Storage::disk('public')->delete($advert->media_url);
            }
            
            $file = $request->file('media_file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('adverts', $filename, 'public');
            $data['media_url'] = $path;
        } elseif ($request->media_type === 'none' && $advert->media_url) {
            // If media_type changed to none, delete old media file
            Storage::disk('public')->delete($advert->media_url);
            $data['media_url'] = null;
        }

        $advert->update($data);

        return response()->json([
            'message' => 'Advert updated successfully.',
            'data' => $advert
        ]);
    }

    /**
     * Remove the specified advert.
     */
    public function destroy($id)
    {
        if (request()->user() && !request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $advert = Advert::findOrFail($id);

        // Delete file
        if ($advert->media_url) {
            Storage::disk('public')->delete($advert->media_url);
        }

        $advert->delete();

        return response()->json(['message' => 'Advert deleted successfully.']);
    }
}
