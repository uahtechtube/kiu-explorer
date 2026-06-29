<?php

namespace App\Http\Controllers;

use App\Models\GalleryItem;
use App\Models\LandingPageSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GalleryController extends Controller
{
    /**
     * Display the public gallery page.
     */
    public function index()
    {
        $galleryItems = GalleryItem::latest()->get();
        
        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = new LandingPageSetting([
                'app_name' => 'KIU Explorer',
                'primary_color' => '#09a5db',
                'secondary_color' => '#0f172a',
                'theme_mode' => 'dark',
            ]);
        }

        return view('gallery.index', compact('galleryItems', 'settings'));
    }

    /**
     * Store a newly uploaded gallery item.
     */
    public function store(Request $request)
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return redirect()->route('cms.login')->withErrors(['email' => 'Please log in to access the CMS.']);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'media' => 'required|file|max:51200', // Max 50MB
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240', // Max 10MB
            'type' => 'required|in:image,video',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput()->with('active_tab', 'gallery');
        }

        $mediaPath = null;
        if ($request->hasFile('media') && $request->file('media')->isValid()) {
            $mediaFile = $request->file('media');
            // Store images and videos in different subfolders for clean storage
            $folder = $request->type === 'video' ? 'gallery/videos' : 'gallery/images';
            $mediaPath = $mediaFile->store($folder, 'public');
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail') && $request->file('thumbnail')->isValid()) {
            $thumbnailFile = $request->file('thumbnail');
            $thumbnailPath = $thumbnailFile->store('gallery/thumbnails', 'public');
        }

        GalleryItem::create([
            'title' => $request->title,
            'media_path' => $mediaPath,
            'thumbnail_path' => $thumbnailPath,
            'type' => $request->type,
            'description' => $request->description,
        ]);

        return back()->with('success', 'Gallery item uploaded successfully!')->with('active_tab', 'gallery');
    }

    /**
     * Remove the specified gallery item.
     */
    public function destroy($id)
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return redirect()->route('cms.login')->withErrors(['email' => 'Please log in to access the CMS.']);
        }

        $item = GalleryItem::findOrFail($id);

        // Delete associated media file from storage
        if ($item->media_path) {
            Storage::disk('public')->delete($item->media_path);
        }

        // Delete associated thumbnail file from storage if it exists
        if ($item->thumbnail_path) {
            Storage::disk('public')->delete($item->thumbnail_path);
        }

        $item->delete();

        return back()->with('success', 'Gallery item deleted successfully!')->with('active_tab', 'gallery');
    }
}
