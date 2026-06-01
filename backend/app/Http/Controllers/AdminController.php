<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Association;
use App\Models\CourseRegistration;
use App\Models\VirtualClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct()
    {
        // Middleware-based role check should be handled in routes or via HasMiddleware if using Laravel 11 specific patterns
    }

    /**
     * Get global statistics for the admin dashboard.
     */
    public function stats()
    {
        $totalUsers = User::count();
        $activeStudents = User::where('role', 'student')->where('account_status', 'active')->count();
        $totalLecturers = User::where('role', 'lecturer')->count();
        $totalCourses = Course::count();
        
        $pendingReports = 0;
        if (class_exists(\App\Models\SystemAlert::class)) {
            try {
                $pendingReports = \App\Models\SystemAlert::where('is_resolved', false)->count();
            } catch (\Exception $e) {}
        }
        
        $uptime = $this->calculateUptime();
        $dbHealth = $this->checkDatabaseHealth();
        $systemHealth = $dbHealth ? 98 : 50;

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'students' => User::where('role', 'student')->count(),
                'lecturers' => $totalLecturers,
                'admins' => User::where('role', 'admin')->count(),
                'blocked' => User::where('account_status', 'blocked')->count(),
            ],
            'academic' => [
                'courses' => $totalCourses,
                'exams' => Exam::count(),
            ],
            'social' => [
                'associations' => Association::count(),
                'active_classes' => VirtualClass::where('status', 'scheduled')->count(),
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'active_students' => $activeStudents ?: User::where('role', 'student')->count(),
                'total_lecturers' => $totalLecturers,
                'total_courses' => $totalCourses,
                'pending_reports' => $pendingReports,
                'system_health' => $systemHealth,
                'server_uptime' => $uptime,
            ]
        ]);
    }

    /**
     * List all users with pagination and filtering.
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('account_status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('surname', 'LIKE', "%$search%")
                  ->orWhere('first_name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%")
                  ->orWhere('matric_number', 'LIKE', "%$search%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * Toggle user account status.
     */
    public function updateUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:active,blocked,pending'
        ]);

        $user->update(['account_status' => $request->status]);

        return response()->json([
            'message' => "User status updated to {$request->status}",
            'user' => $user
        ]);
    }

    /**
     * List course registrations that require approval.
     */
    public function pendingRegistrations()
    {
        return response()->json([]);
    }

    /**
     * Approve or Drop a specific course registration.
     */
    public function approveRegistration(Request $request, $id)
    {
        return response()->json(['message' => "Registration system disabled."]);
    }

    /**
     * System Overview - Combined data for a detailed admin home view.
     */
    public function systemOverview()
    {
        return response()->json([
            'recent_users' => User::latest()->limit(5)->get(),
            'active_virtual_classes' => VirtualClass::where('status', 'scheduled')->with('lecturer')->get(),
        ]);
    }

    /**
     * Get system health metrics
     */
    public function systemHealth()
    {
        // Calculate uptime (you can store server start time in cache or config)
        $uptime = $this->calculateUptime();
        
        // Database health
        $dbHealth = $this->checkDatabaseHealth();
        
        // Calculate system health percentage
        $systemHealth = $dbHealth ? 98 : 50;

        return response()->json([
            'status' => $dbHealth ? 'healthy' : 'degraded',
            'health_percentage' => $systemHealth,
            'uptime' => $uptime,
            'database' => [
                'status' => $dbHealth ? 'connected' : 'error',
                'response_time' => $this->getDatabaseResponseTime(),
            ],
            'storage' => [
                'total' => disk_total_space(storage_path()),
                'free' => disk_free_space(storage_path()),
                'used_percentage' => $this->getStorageUsagePercentage(),
            ],
            'active_users' => [
                'current' => User::where('account_status', 'active')->count(),
                'online_now' => $this->getOnlineUsersCount(),
            ],
        ]);
    }

    /**
     * Get activity logs
     */
    public function activityLogs(Request $request)
    {
        // This is a simplified version. In production, you'd use a proper logging system
        $logs = DB::table('users')
            ->select('id', 'surname', 'first_name', 'email', 'created_at as time_ref')
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->map(function ($user) {
                return [
                    'user' => $user->surname . ' ' . $user->first_name,
                    'email' => $user->email,
                    'action' => 'Login',
                    'timestamp' => $user->time_ref,
                    'ip_address' => '---', // You'd track this in a real system
                ];
            });

        return response()->json([
            'logs' => $logs,
            'total' => $logs->count(),
        ]);
    }

    /**
     * Get storage statistics
     */
    public function storageStats()
    {
        $storagePath = storage_path('app/public');
        
        return response()->json([
            'total_space' => disk_total_space($storagePath),
            'free_space' => disk_free_space($storagePath),
            'used_space' => disk_total_space($storagePath) - disk_free_space($storagePath),
            'usage_percentage' => $this->getStorageUsagePercentage(),
            'breakdown' => [
                'tutorials' => $this->getDirectorySize(storage_path('app/public/tutorials')),
                'library' => $this->getDirectorySize(storage_path('app/public/library')),
                'recordings' => $this->getDirectorySize(storage_path('app/public/recordings')),
                'media' => $this->getDirectorySize(storage_path('app/public/media')),
                'documents' => $this->getDirectorySize(storage_path('app/public/documents')),
            ],
        ]);
    }

    // Helper methods

    private function calculateUptime()
    {
        // Simple uptime calculation (you can improve this)
        $startTime = cache()->remember('server_start_time', 86400, function () {
            return now();
        });
        
        $diff = now()->diff($startTime);
        return sprintf('%dd %02dh %02dm', $diff->days, $diff->h, $diff->i);
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getDatabaseResponseTime()
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        $end = microtime(true);
        return round(($end - $start) * 1000, 2) . 'ms';
    }

    private function getStorageUsagePercentage()
    {
        $total = disk_total_space(storage_path());
        $free = disk_free_space(storage_path());
        $used = $total - $free;
        return round(($used / $total) * 100, 2);
    }

    private function getOnlineUsersCount()
    {
        // Simple implementation - users active in last 15 minutes
        // You'd use a proper session tracking system in production
        return User::where('updated_at', '>=', now()->subMinutes(15))->count();
    }

    private function getDirectorySize($path)
    {
        if (!is_dir($path)) {
            return 0;
        }

        $size = 0;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path)) as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }
        return $size;
    }

    /**
     * Get comprehensive analytics data
     */
    public function analytics()
    {
        // User growth over last 5 months
        $userGrowth = [];
        for ($i = 4; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = User::whereYear('created_at', '<=', $date->year)
                ->whereMonth('created_at', '<=', $date->month)
                ->count();
            $userGrowth[] = [
                'month' => strtoupper($date->format('M')),
                'count' => $count
            ];
        }

        // Engagement metrics
        $today = now()->startOfDay();
        $engagementMetrics = [
            'daily_active_users' => User::where('updated_at', '>=', $today)->count(),
            'avg_session_duration' => 45, // This would come from session tracking
            'total_logins_today' => User::where('updated_at', '>=', $today)->count(),
        ];

        // Course enrollment rankings (top 5)
        $courseEnrollment = Course::withCount('registrations')
            ->orderBy('registrations_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($course) {
                return [
                    'course' => $course->code . ': ' . $course->title,
                    'students' => $course->registrations_count
                ];
            });

        return response()->json([
            'user_growth' => $userGrowth,
            'engagement_metrics' => $engagementMetrics,
            'course_enrollment' => $courseEnrollment,
            'summary' => [
                'total_users' => User::count(),
                'total_courses' => Course::count(),
                'total_exams' => Exam::count(),
                'active_classes' => VirtualClass::where('status', 'live')->count(),
            ]
        ]);
    }

    /**
     * Get system global settings configuration
     */
    public function getSystemSettings(Request $request)
    {
        return response()->json([
            'maintenance_mode' => (bool) cache()->get('settings.maintenance_mode', false),
            'email_outreach' => (bool) cache()->get('settings.email_outreach', true),
            'two_factor' => (bool) cache()->get('settings.two_factor', true),
            'hostel_service_fee' => (float) cache()->get('settings.hostel_service_fee', 5000.00),
            'academic_sessions' => \App\Models\AcademicSession::orderBy('name', 'desc')->get(),
            'current_session_id' => \App\Models\AcademicSession::where('is_current', true)->value('id') ?? (\App\Models\AcademicSession::value('id') ?? 0),
        ]);
    }

    /**
     * Update a single system configuration toggle
     */
    public function updateSystemToggle(Request $request)
    {
        $request->validate([
            'key' => 'required|string|in:maintenance_mode,email_outreach,two_factor,hostel_service_fee',
            'enabled' => 'sometimes|boolean',
            'value' => 'sometimes|numeric|min:0',
        ]);

        $key = $request->key;
        $oldVal = cache()->get('settings.' . $key, null);

        if ($key === 'hostel_service_fee') {
            $newVal = (float) $request->value;
            cache()->forever('settings.' . $key, $newVal);
        } else {
            $newVal = (bool) $request->enabled;
            cache()->forever('settings.' . $key, $newVal);
        }

        try {
            \App\Models\AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Update System Setting',
                'model_type' => 'SystemSettings',
                'model_id' => 0,
                'old_values' => [$key => $oldVal],
                'new_values' => [$key => $newVal],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'System configuration successfully updated.',
            'key' => $key,
            'enabled' => $key === 'hostel_service_fee' ? true : $newVal,
            'value' => $key === 'hostel_service_fee' ? $newVal : null,
        ]);
    }

    /**
     * Set the current active academic session
     */
    public function setActiveSession(Request $request)
    {
        $request->validate([
            'session_id' => 'required|integer|exists:academic_sessions,id',
        ]);

        $oldSessionId = \App\Models\AcademicSession::where('is_current', true)->value('id');

        \DB::transaction(function () use ($request) {
            \App\Models\AcademicSession::where('is_current', true)->update(['is_current' => false]);
            \App\Models\AcademicSession::where('id', $request->session_id)->update(['is_current' => true]);
        });

        $sessionName = \App\Models\AcademicSession::where('id', $request->session_id)->value('name');

        try {
            \App\Models\AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Change Active Academic Session',
                'model_type' => 'AcademicSession',
                'model_id' => $request->session_id,
                'old_values' => ['current_session_id' => $oldSessionId],
                'new_values' => ['current_session_id' => $request->session_id],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => "Academic session successfully activated: {$sessionName}",
            'session_id' => $request->session_id,
        ]);
    }

    /**
     * Restore system parameters to default configuration
     */
    public function resetSystemSettings(Request $request)
    {
        $oldSettings = [
            'maintenance_mode' => cache()->get('settings.maintenance_mode', false),
            'email_outreach' => cache()->get('settings.email_outreach', true),
            'two_factor' => cache()->get('settings.two_factor', true),
        ];

        cache()->forever('settings.maintenance_mode', false);
        cache()->forever('settings.email_outreach', true);
        cache()->forever('settings.two_factor', true);

        $firstSession = \App\Models\AcademicSession::first();
        if ($firstSession) {
            \DB::transaction(function () use ($firstSession) {
                \App\Models\AcademicSession::where('is_current', true)->update(['is_current' => false]);
                $firstSession->update(['is_current' => true]);
            });
        }

        try {
            \App\Models\AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Restore Default Settings',
                'model_type' => 'SystemSettings',
                'model_id' => 0,
                'old_values' => $oldSettings,
                'new_values' => [
                    'maintenance_mode' => false,
                    'email_outreach' => true,
                    'two_factor' => true,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message' => 'All configuration overrides restored to system defaults.',
            'maintenance_mode' => false,
            'email_outreach' => true,
            'two_factor' => true,
            'current_session_id' => $firstSession ? $firstSession->id : 0
        ]);
    }

    /**
     * Create a new lecturer account (Admin only)
     */
    public function createLecturer(Request $request)
    {
        $request->validate([
            'surname' => 'required|string',
            'first_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = User::create([
            'surname' => $request->surname,
            'first_name' => $request->first_name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'lecturer',
            'account_status' => 'active',
        ]);

        // Create lecturer profile
        $user->lecturerProfile()->create([
            'department_id' => $request->department_id,
            'office_location' => $request->office_location,
            'phone_number' => $request->phone_number,
        ]);

        return response()->json([
            'message' => 'Lecturer created successfully',
            'user' => $user->load('lecturerProfile')
        ], 201);
    }

    /**
     * Create a new user (Admin use only)
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'surname' => 'required|string',
            'first_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:student,lecturer,admin',
        ]);

        $user = User::create([
            'surname' => $request->surname,
            'first_name' => $request->first_name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'account_status' => 'active',
        ]);

        if ($request->role === 'student') {
            // Give them a mock matric number or let it be null initially
            $user->update(['matric_number' => 'KIU/'.date('Y').'/STU/'.rand(1000, 9999)]);
        } elseif ($request->role === 'lecturer') {
            $user->lecturerProfile()->create([
                'department_id' => $request->department_id ?? 1, // Fallback
            ]);
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Update an existing user
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'first_name' => 'sometimes|string',
            'surname' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'password' => 'nullable|min:6',
            'role' => 'sometimes|in:student,lecturer,admin',
        ]);

        if ($request->has('first_name')) $user->first_name = $request->first_name;
        if ($request->has('surname')) $user->surname = $request->surname;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->filled('password')) $user->password = bcrypt($request->password);
        if ($request->has('role')) $user->role = $request->role;

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Export analytics data
     */
    public function exportAnalytics(Request $request)
    {
        $format = $request->query('format', 'csv');
        $type = $request->query('type', 'all');

        if ($format !== 'csv') {
            return response()->json(['message' => 'Only CSV format is currently supported'], 400);
        }

        $filename = "analytics_{$type}_" . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($type) {
            $file = fopen('php://output', 'w');

            if ($type === 'users' || $type === 'all') {
                $this->exportUsersData($file);
            }

            if ($type === 'engagement' || $type === 'all') {
                $this->exportEngagementData($file);
            }

            fclose($file);
        };

        return \Illuminate\Support\Facades\Response::stream($callback, 200, $headers);
    }

    private function exportUsersData($file)
    {
        fputcsv($file, ['USER STATISTICS']);
        fputcsv($file, ['Role', 'Count', 'Percentage']);
        
        $total = User::count();
        $roles = ['student', 'lecturer', 'admin'];
        
        foreach ($roles as $role) {
            $count = User::where('role', $role)->count();
            $percentage = $total > 0 ? round(($count / $total) * 100, 2) : 0;
            fputcsv($file, [ucfirst($role), $count, $percentage . '%']);
        }
        
        fputcsv($file, []); // Empty line
    }

    private function exportEngagementData($file)
    {
        fputcsv($file, ['ENGAGEMENT METRICS']);
        fputcsv($file, ['Metric', 'Value']);
        
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();
        
        fputcsv($file, ['Daily Active Users', User::where('updated_at', '>=', $today)->count()]);
        fputcsv($file, ['Weekly Active Users', User::where('updated_at', '>=', $thisWeek)->count()]);
        fputcsv($file, ['Monthly Active Users', User::where('updated_at', '>=', $thisMonth)->count()]);
        fputcsv($file, ['Total Users', User::count()]);
        fputcsv($file, ['Total Courses', Course::count()]);
        fputcsv($file, ['Total Exams', Exam::count()]);
        
        fputcsv($file, []); // Empty line
    }
}

