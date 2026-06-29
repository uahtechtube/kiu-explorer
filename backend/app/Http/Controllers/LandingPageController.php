<?php

namespace App\Http\Controllers;

use App\Models\LandingPageSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LandingPageController extends Controller
{
    /**
     * Display the public landing page.
     */
    public function index()
    {
        // Self-healing: Get settings or create dynamic default settings if none exists
        $settings = LandingPageSetting::first();
        
        if (!$settings) {
            $settings = $this->createDefaultSettings();
        }

        // Fetch latest published blog posts for landing page
        $blogPosts = \App\Models\BlogPost::where('status', 'published')
            ->latest()
            ->limit(3)
            ->get();

        // Fetch latest gallery items for landing page highlights
        $galleryItems = \App\Models\GalleryItem::latest()
            ->limit(3)
            ->get();

        return view('landing', compact('settings', 'blogPosts', 'galleryItems'));
    }

    /**
     * Track APK downloads, increment click count and redirect to file download.
     */
    public function trackDownload()
    {
        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = $this->createDefaultSettings();
        }

        // Increment download count using atomic DB increment
        LandingPageSetting::where('id', $settings->id)->increment('download_count');

        // Log click to database for chart analytics
        try {
            DB::table('download_logs')->insert([
                'ip_address' => request()->ip(),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {}

        // Check if there is an uploaded APK file, otherwise serve the mock APK
        if ($settings->apk_file_path && Storage::disk('public')->exists($settings->apk_file_path)) {
            return redirect(asset('storage/' . $settings->apk_file_path));
        }

        // Fallback: serve the public mock file
        return redirect()->route('download.mock');
    }

    /**
     * Serve a dummy APK file for testing.
     */
    public function downloadMockApk()
    {
        $apkPath = public_path('apks/kiu-explorer-mock.apk');
        
        // Ensure folder exists
        if (!file_exists(public_path('apks'))) {
            mkdir(public_path('apks'), 0775, true);
        }

        // Create a dummy APK if it does not exist (approx 50KB of null bytes to simulate a fast download)
        if (!file_exists($apkPath)) {
            file_put_contents($apkPath, str_repeat("\0", 50 * 1024));
        }

        return response()->download($apkPath, 'kiu-explorer-latest.apk');
    }

    /**
     * Show CMS login page.
     */
    public function cmsLoginView()
    {
        // If already logged in as admin, redirect to dashboard
        if (Auth::check() && Auth::user()->role === 'admin') {
            return redirect()->route('cms.dashboard');
        }

        return view('cms.login');
    }

    /**
     * Handle CMS Login.
     */
    public function cmsLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            if ($user->role === 'admin') {
                $request->session()->regenerate();
                return redirect()->route('cms.dashboard')->with('success', 'Welcome to the CMS Dashboard, Admin!');
            }

            // Not an admin
            Auth::logout();
            return back()->withErrors(['email' => 'Access Denied: Only administrators can access the CMS.'])->withInput();
        }

        return back()->withErrors(['email' => 'Invalid email or password.'])->withInput();
    }

    /**
     * Show CMS Dashboard.
     */
    public function cmsDashboard()
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return redirect()->route('cms.login')->withErrors(['email' => 'Please log in to access the CMS.']);
        }

        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = $this->createDefaultSettings();
        }

        // Gather database connection status
        $dbConnected = true;
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbConnected = false;
        }

        // Calculate User Statistics
        $totalUsers = User::count();
        $activeUsers = User::where('account_status', 'active')->count();
        
        $monthlyUsers = User::where(function($q) {
            $q->where('last_login_date', '>=', now()->subDays(30))
              ->orWhere('updated_at', '>=', now()->subDays(30));
        })->count();

        $newUsers = User::where('created_at', '>=', now()->subDays(7))->count();

        // Fetch recent users for User Management tab
        $recentUsers = User::latest()->limit(10)->get();

        // Fetch audit logs and reports (if models exist) for auxiliary tabs
        $recentLogs = collect();
        if (class_exists(\App\Models\AuditLog::class)) {
            try {
                $recentLogs = \App\Models\AuditLog::latest()->limit(10)->get();
            } catch (\Exception $e) {}
        }

        $recentReports = collect();
        if (class_exists(\App\Models\Report::class)) {
            try {
                $recentReports = \App\Models\Report::latest()->limit(10)->get();
            } catch (\Exception $e) {}
        }

        // Fetch 7 days history for database-driven analytics chart
        $chartLabels = [];
        $chartDownloads = [];
        $chartUsers = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $chartLabels[] = now()->subDays($i)->format('D, M d');
            
            // Real User Registration Count from database on this day
            $userCount = User::whereDate('created_at', $date)->count();
            $chartUsers[] = $userCount;

            // Real Download Count from database on this day
            $downloadCount = DB::table('download_logs')->whereDate('created_at', $date)->count();
            $chartDownloads[] = $downloadCount;
        }

        // Fetch blog posts and metrics for CMS Blog Management
        $blogPosts = \App\Models\BlogPost::latest()->get();
        $totalBlogViews = \App\Models\BlogPost::sum('views');
        $publishedBlogCount = \App\Models\BlogPost::where('status', 'published')->count();
        $draftBlogCount = \App\Models\BlogPost::where('status', 'draft')->count();

        // Fetch gallery items and metrics for CMS Gallery Management
        $galleryItems = \App\Models\GalleryItem::latest()->get();
        $totalGalleryCount = $galleryItems->count();
        $photoGalleryCount = \App\Models\GalleryItem::where('type', 'image')->count();
        $videoGalleryCount = \App\Models\GalleryItem::where('type', 'video')->count();

        return view('cms.dashboard', compact(
            'settings', 
            'dbConnected', 
            'totalUsers', 
            'activeUsers', 
            'monthlyUsers', 
            'newUsers',
            'recentUsers',
            'recentLogs',
            'recentReports',
            'chartLabels',
            'chartDownloads',
            'chartUsers',
            'blogPosts',
            'totalBlogViews',
            'publishedBlogCount',
            'draftBlogCount',
            'galleryItems',
            'totalGalleryCount',
            'photoGalleryCount',
            'videoGalleryCount'
        ));
    }

    /**
     * Update CMS Settings.
     */
    public function cmsUpdate(Request $request)
    {
        // Enforce Admin Role
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = $this->createDefaultSettings();
        }

        // Validate basic inputs (all optional)
        $validator = Validator::make($request->all(), [
            'app_name' => 'nullable|string|max:100',
            'hero_title' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string',
            'apk_version' => 'nullable|string|max:20',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'theme_mode' => 'nullable|in:dark,light',
            'apk_file' => 'nullable|file|max:51200', // Max 50MB
            'hero_image' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:10240', // Max 10MB
            'hero_video' => 'nullable|file|mimes:mp4,mov,ogg,qt,webm|max:51200', // Max 50MB
            'team.*.photo' => 'nullable|image|mimes:jpeg,png,jpg,svg,webp|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = [];
        $fields = ['app_name', 'hero_title', 'hero_subtitle', 'apk_version', 'primary_color', 'secondary_color', 'theme_mode'];
        foreach ($fields as $field) {
            if ($request->has($field) && $request->input($field) !== null) {
                $data[$field] = $request->input($field);
            }
        }

        // Process visibility toggles
        if ($request->has('visibility_submitted')) {
            $data['show_features'] = $request->has('show_features');
            $data['show_faqs'] = $request->has('show_faqs');
            $data['show_stats'] = $request->has('show_stats');
            $data['show_team'] = $request->has('show_team');
        }

        // Process Hero Photo upload
        if ($request->hasFile('hero_image') && $request->file('hero_image')->isValid()) {
            $imageFile = $request->file('hero_image');

            // Delete old hero image if exists
            if ($settings->hero_image_path) {
                Storage::disk('public')->delete($settings->hero_image_path);
            }

            // Save new image file
            $imagePath = $imageFile->storeAs('images', 'hero-mockup-' . time() . '.' . $imageFile->getClientOriginalExtension(), 'public');
            $data['hero_image_path'] = $imagePath;
        }

        // Process Hero Video upload
        if ($request->hasFile('hero_video') && $request->file('hero_video')->isValid()) {
            $videoFile = $request->file('hero_video');

            // Delete old hero video if exists
            if ($settings->hero_video_path) {
                Storage::disk('public')->delete($settings->hero_video_path);
            }

            // Save new video file
            $videoPath = $videoFile->storeAs('videos', 'hero-mockup-video-' . time() . '.' . $videoFile->getClientOriginalExtension(), 'public');
            $data['hero_video_path'] = $videoPath;
        }

        // Process clear check options
        if ($request->has('hero_image_clear') && $request->boolean('hero_image_clear')) {
            if ($settings->hero_image_path) {
                Storage::disk('public')->delete($settings->hero_image_path);
            }
            $data['hero_image_path'] = null;
        }

        if ($request->has('hero_video_clear') && $request->boolean('hero_video_clear')) {
            if ($settings->hero_video_path) {
                Storage::disk('public')->delete($settings->hero_video_path);
            }
            $data['hero_video_path'] = null;
        }

        // Process APK upload
        if ($request->hasFile('apk_file') && $request->file('apk_file')->isValid()) {
            $file = $request->file('apk_file');
            
            // Delete old file if exists
            if ($settings->apk_file_path) {
                Storage::disk('public')->delete($settings->apk_file_path);
            }

            // Save new file
            $path = $file->storeAs('apks', 'kiu-explorer-' . time() . '.apk', 'public');
            $data['apk_file_path'] = $path;

            // Recalculate file size
            $bytes = $file->getSize();
            $data['apk_size'] = $this->formatBytes($bytes);
        }

        // Process features (JSON array)
        if ($request->has('features')) {
            $features = [];
            foreach ($request->input('features') as $f) {
                if (!empty($f['title'])) {
                    $features[] = [
                        'title' => sanitize_string($f['title']),
                        'description' => sanitize_string($f['description'] ?? ''),
                        'icon' => sanitize_string($f['icon'] ?? 'map-pin'),
                    ];
                }
            }
            $data['features'] = $features;
        }

        // Process FAQs (JSON array)
        if ($request->has('faqs')) {
            $faqs = [];
            foreach ($request->input('faqs') as $q) {
                if (!empty($q['question'])) {
                    $faqs[] = [
                        'question' => sanitize_string($q['question']),
                        'answer' => sanitize_string($q['answer'] ?? ''),
                    ];
                }
            }
            $data['faqs'] = $faqs;
        }

        // Process Custom Sections (JSON array)
        if ($request->has('custom_sections')) {
            $customSections = [];
            foreach ($request->input('custom_sections') as $section) {
                if (!empty($section['title'])) {
                    $customSections[] = [
                        'title' => sanitize_string($section['title']),
                        // Allow some basic HTML tags for rich layouts (like links or bold text)
                        'content' => htmlspecialchars_decode(sanitize_string($section['content'] ?? '')),
                    ];
                }
            }
            $data['custom_sections'] = $customSections;
        } else {
            $data['custom_sections'] = [];
        }

        // Process Team members (JSON array with dynamic image uploads)
        if ($request->has('team')) {
            $team = [];
            foreach ($request->input('team') as $idx => $t) {
                if (!empty($t['name'])) {
                    $member = [
                        'name' => sanitize_string($t['name']),
                        'role' => sanitize_string($t['role'] ?? ''),
                        'description' => sanitize_string($t['description'] ?? ''),
                        'phone' => sanitize_string($t['phone'] ?? ''),
                        'email' => sanitize_string($t['email'] ?? ''),
                        'photo_path' => $t['photo_path'] ?? null,
                        'socials' => [
                            'facebook' => sanitize_string($t['socials']['facebook'] ?? ''),
                            'linkedin' => sanitize_string($t['socials']['linkedin'] ?? ''),
                            'x' => sanitize_string($t['socials']['x'] ?? ''),
                            'github' => sanitize_string($t['socials']['github'] ?? ''),
                            'instagram' => sanitize_string($t['socials']['instagram'] ?? ''),
                            'portfolio' => sanitize_string($t['socials']['portfolio'] ?? ''),
                        ],
                        'custom_links' => [],
                    ];

                    if (!empty($t['custom_links'])) {
                        foreach ($t['custom_links'] as $link) {
                            if (!empty($link['label']) && !empty($link['url'])) {
                                $member['custom_links'][] = [
                                    'label' => sanitize_string($link['label']),
                                    'url' => sanitize_string($link['url']),
                                ];
                            }
                        }
                    }

                    // Check if new photo file uploaded for this member
                    if ($request->hasFile("team.{$idx}.photo") && $request->file("team.{$idx}.photo")->isValid()) {
                        // Delete old photo if it exists
                        if (!empty($member['photo_path'])) {
                            Storage::disk('public')->delete($member['photo_path']);
                        }

                        $photoFile = $request->file("team.{$idx}.photo");
                        $photoPath = $photoFile->store('team', 'public');
                        $member['photo_path'] = $photoPath;
                    }

                    $team[] = $member;
                }
            }
            $data['team'] = $team;
        } else if ($request->has('visibility_submitted')) {
            $data['team'] = [];
        }

        $settings->update($data);

        return back()->with('success', 'Landing page settings updated successfully!');
    }

    /**
     * Handle CMS Logout.
     */
    public function cmsLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('cms.login')->with('success', 'Logged out successfully.');
    }

    /**
     * Create default settings if database is empty.
     */
    private function createDefaultSettings()
    {
        return LandingPageSetting::create([
            'app_name' => 'KIU Explorer',
            'hero_title' => 'Navigate, Plan, and Connect at KIU',
            'hero_subtitle' => 'The ultimate digital campus companion for Kashim Ibrahim University. Find classrooms, book hostels, calculate GPA, chat with peers, and stay updated with campus announcements—all in one place.',
            'apk_version' => '1.0.4',
            'apk_size' => '22.4 MB',
            'apk_file_path' => null,
            'download_count' => 142,
            'primary_color' => '#09a5db',
            'secondary_color' => '#0f172a',
            'hero_image_path' => null,
            'hero_video_path' => null,
            'theme_mode' => 'dark',
            'show_features' => true,
            'show_faqs' => true,
            'show_stats' => true,
            'custom_sections' => [],
            'features' => [
                [
                    'title' => 'Interactive Map & Navigation',
                    'description' => 'Find classrooms, lecture halls, administrative offices, and hostels with step-by-step campus guidance.',
                    'icon' => 'map'
                ],
                [
                    'title' => 'Academic Planner & GPA',
                    'description' => 'Track your assignments, calculate your GPA automatically, and view class timetables in a gorgeous scheduler.',
                    'icon' => 'book'
                ],
                [
                    'title' => 'Hostel Accommodation Hub',
                    'description' => 'Browse available hostels, secure bed allocations, pay fees via Paystack, and find roommates.',
                    'icon' => 'home'
                ],
                [
                    'title' => 'Campus Forums & Socials',
                    'description' => 'Join student associations, chat in real-time, buy/sell on the marketplace, and search for lost items.',
                    'icon' => 'chat'
                ]
            ],
            'faqs' => [
                [
                    'question' => 'How do I install the KIU Explorer APK?',
                    'answer' => 'Download the APK file by clicking the download button on this page. Locate the downloaded file in your file manager and tap it. If prompted, enable "Install from Unknown Sources" in your device settings to complete installation.'
                ],
                [
                    'question' => 'What are the system requirements?',
                    'answer' => 'KIU Explorer is optimized for Android devices running Android 8.0 (Oreo) and above. An active internet connection is recommended for real-time synchronization.'
                ],
                [
                    'question' => 'How do I log into the app?',
                    'answer' => 'Use your registered university student or lecturer credentials. If you do not have an account, you can easily register directly within the app.'
                ]
            ],
            'screenshots' => []
        ]);
    }

    /**
     * Format bytes to readable string (KB, MB, GB).
     */
    private function formatBytes($bytes, $precision = 1)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Update administrator password.
     */
    public function cmsUpdatePassword(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'The provided current password does not match our records.'])->withInput();
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return back()->with('success', 'Your account password has been updated successfully!');
    }

    /**
     * Create new Administrator account.
     */
    public function cmsCreateAdmin(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'surname' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'phone_number' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        User::create([
            'user_id' => 'ADMIN-' . strtoupper(uniqid()),
            'surname' => $request->surname,
            'first_name' => $request->first_name,
            'email' => $request->email,
            'username' => $request->username,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'account_status' => 'active',
            'gender' => 'Male',
            'nationality' => 'Nigeria',
        ]);

        return back()->with('success', 'New Administrator account created successfully!');
    }

}

/**
 * Helper to sanitize user string values.
 */
function sanitize_string($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}
