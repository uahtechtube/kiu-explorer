<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\LandingPageSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    /**
     * Display a paginated list of all published blog posts.
     */
    public function index(Request $request)
    {
        $query = BlogPost::where('status', 'published')->latest();

        // Support basic search filtering
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Paginate posts (6 per page)
        $blogPosts = $query->paginate(6);
        
        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = new LandingPageSetting([
                'app_name' => 'KIU Explorer',
                'primary_color' => '#09a5db',
                'secondary_color' => '#0f172a',
                'theme_mode' => 'dark',
            ]);
        }

        return view('blog.index', compact('blogPosts', 'settings'));
    }

    /**
     * Display a single blog post.
     */
    public function show($slug)
    {
        $post = BlogPost::where('slug', $slug)->firstOrFail();

        // Increment view count
        $post->increment('views');

        // Fetch related posts (latest published, excluding current)
        $relatedPosts = BlogPost::where('status', 'published')
            ->where('id', '!=', $post->id)
            ->latest()
            ->limit(3)
            ->get();

        // Fetch landing settings for theme configurations and app name
        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = new LandingPageSetting([
                'app_name' => 'KIU Explorer',
                'primary_color' => '#09a5db',
                'secondary_color' => '#0f172a',
                'theme_mode' => 'dark',
            ]);
        }

        return view('blog.show', compact('post', 'relatedPosts', 'settings'));
    }

    /**
     * Store a newly created blog post.
     */
    public function store(Request $request)
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return redirect()->route('cms.login')->withErrors(['email' => 'Please log in to access the CMS.']);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:10240', // Max 10MB
            'video' => 'nullable|file|mimes:mp4,mov,ogg,qt,webm|max:51200', // Max 50MB
            'author_name' => 'nullable|string|max:100',
            'status' => 'required|in:draft,published',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput()->with('active_tab', 'blog');
        }

        $imagePath = null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $imageFile = $request->file('image');
            $imagePath = $imageFile->store('blog', 'public');
        }

        $videoPath = null;
        if ($request->hasFile('video') && $request->file('video')->isValid()) {
            $videoFile = $request->file('video');
            $videoPath = $videoFile->store('blog/videos', 'public');
        }

        BlogPost::create([
            'title' => $request->title,
            'slug' => $request->slug ? Str::slug($request->slug) : null, // Handled by boot method if null
            'summary' => $request->summary,
            'content' => $request->content,
            'image_path' => $imagePath,
            'video_path' => $videoPath,
            'author_name' => $request->author_name ?: 'Admin',
            'status' => $request->status,
            'published_at' => $request->status === 'published' ? now() : null,
        ]);

        return back()->with('success', 'Blog post created successfully!')->with('active_tab', 'blog');
    }

    /**
     * Update the specified blog post.
     */
    public function update(Request $request, $id)
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return redirect()->route('cms.login')->withErrors(['email' => 'Please log in to access the CMS.']);
        }

        $post = BlogPost::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:10240', // Max 10MB
            'video' => 'nullable|file|mimes:mp4,mov,ogg,qt,webm|max:51200', // Max 50MB
            'author_name' => 'nullable|string|max:100',
            'status' => 'required|in:draft,published',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug,' . $post->id,
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput()->with('active_tab', 'blog');
        }

        $data = [
            'title' => $request->title,
            'summary' => $request->summary,
            'content' => $request->content,
            'author_name' => $request->author_name ?: 'Admin',
            'status' => $request->status,
        ];

        // Explicitly set/update slug if requested or reset it
        if ($request->filled('slug')) {
            $data['slug'] = Str::slug($request->slug);
        } else {
            $data['slug'] = Str::slug($request->title);
        }

        // Manage Image uploads
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            // Delete old image if it exists
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }

            $imageFile = $request->file('image');
            $data['image_path'] = $imageFile->store('blog', 'public');
        }

        // Manage Video uploads
        if ($request->hasFile('video') && $request->file('video')->isValid()) {
            // Delete old video if it exists
            if ($post->video_path) {
                Storage::disk('public')->delete($post->video_path);
            }

            $videoFile = $request->file('video');
            $data['video_path'] = $videoFile->store('blog/videos', 'public');
        }

        // Handle clear image option
        if ($request->has('clear_image') && $request->boolean('clear_image')) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $data['image_path'] = null;
        }

        // Handle clear video option
        if ($request->has('clear_video') && $request->boolean('clear_video')) {
            if ($post->video_path) {
                Storage::disk('public')->delete($post->video_path);
            }
            $data['video_path'] = null;
        }

        // Handle status update change for published_at
        if ($request->status === 'published' && !$post->published_at) {
            $data['published_at'] = now();
        } elseif ($request->status === 'draft') {
            $data['published_at'] = null;
        }

        $post->update($data);

        return back()->with('success', 'Blog post updated successfully!')->with('active_tab', 'blog');
    }

    /**
     * Remove the specified blog post from storage.
     */
    public function destroy($id)
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return redirect()->route('cms.login')->withErrors(['email' => 'Please log in to access the CMS.']);
        }

        $post = BlogPost::findOrFail($id);

        // Delete associated image
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        // Delete associated video
        if ($post->video_path) {
            Storage::disk('public')->delete($post->video_path);
        }

        $post->delete();

        return back()->with('success', 'Blog post deleted successfully!')->with('active_tab', 'blog');
    }
}
