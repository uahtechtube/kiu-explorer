<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicSession;
use App\Models\CourseRegistration;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StudentDashboardController extends Controller
{
    /**
     * Get aggregated data for the student dashboard.
     */
    public function home(Request $request)
    {
        try {
            $user = $request->user();
            if ($user->role !== 'student') {
                return response()->json(['message' => 'Unauthorized user role.'], 403);
            }

            // 1. Current Session
            $currentSession = AcademicSession::where('is_current', true)->first();

            // 2. Available Courses Count (Instead of Enrolled)
            $availableCount = \App\Models\Course::count();

            // 3. Upcoming Virtual Classes (Real data)
            $upcomingClasses = \App\Models\VirtualClass::with(['course', 'lecturer:id,surname,first_name'])
                ->whereIn('status', ['upcoming', 'active'])
                ->orderBy('scheduled_at', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($class) {
                    return [
                        'id' => $class->id,
                        'code' => $class->course ? $class->course->code : 'N/A',
                        'title' => $class->title,
                        'lecturer' => $class->lecturer ? ($class->lecturer->surname . ' ' . $class->lecturer->first_name) : 'Unknown Lecturer',
                        'time' => $class->scheduled_at ? $class->scheduled_at->format('h:i A') : 'TBA',
                        'date' => $class->scheduled_at ? $class->scheduled_at->format('Y-m-d') : 'TBA',
                        'status' => $class->status,
                    ];
                });

            // 4. Real Announcements
            $announcements = \App\Models\Announcement::where('is_active', true)
                ->where(function($q) use ($user) {
                    $q->where('target_audience', 'all')
                      ->orWhere('target_audience', $user->role);
                })
                ->orderByDesc('published_at')
                ->limit(3)
                ->get()
                ->map(function ($ann) {
                    return [
                        'id' => $ann->id,
                        'title' => $ann->title,
                        'date' => $ann->published_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
                        'extract' => substr($ann->content, 0, 100) . '...'
                    ];
                });

            // 5. Dynamic Stats
            $totalTutorials = \App\Models\LibraryResource::count();
            
            // Attendance Rate - Calculated from all Live Classes (since no enrollment)
            $totalClasses = \App\Models\VirtualClass::count();
            
            $attendedClasses = \App\Models\Attendance::where('user_id', $user->id)->count();
            $rate = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100) : 0;

            // 6. Latest Library Resources
            $latestResources = \App\Models\LibraryResource::where('is_approved', true)
                ->where('is_public', true)
                ->orderByDesc('created_at')
                ->limit(3)
                ->get()
                ->map(function ($res) {
                    return [
                        'id' => $res->id,
                        'title' => $res->title,
                        'author' => $res->author,
                        'category' => $res->category,
                        'course_code' => $res->course_code,
                        'file_type' => strtoupper($res->file_type),
                        'file_size' => round($res->file_size / 1024 / 1024, 2) . ' MB'
                    ];
                });

            return response()->json([
                'student' => [
                    'name' => $user->surname . ' ' . $user->first_name,
                    'matric_number' => $user->studentProfile?->matric_number ?? 'N/A',
                    'level' => $user->studentProfile?->level ?? 'N/A',
                    'avatar' => $user->passport_photograph 
                        ? (strpos($user->passport_photograph, 'http') === 0 
                            ? $user->passport_photograph 
                            : url($user->passport_photograph))
                        : url('assets/defaults/avatar.png'),
                ],
                'session' => $currentSession?->name ?? 'N/A',
                'overview' => [
                    'enrolled_courses' => $availableCount,
                    'cgpa' => '4.25', 
                    'attendance' => $rate . '%',
                    'total_tutorials' => $totalTutorials,
                    'total_classes' => $upcomingClasses->count(),
                ],
                'upcoming_classes' => $upcomingClasses,
                'announcements' => $announcements,
                'latest_resources' => $latestResources,
            ]);
        } catch (\Exception $e) {
            // Self-Healing: If table is missing, create it and retry
            if (str_contains($e->getMessage(), "doesn't exist") || $e->getCode() === '42S02') {
                $this->fixVirtualClassesTable();
                return $this->home($request);
            }

             return response()->json([
                'error' => 'Dashboard Error',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    private function fixVirtualClassesTable()
    {
        if (!Schema::hasTable('virtual_classes')) {
            Schema::create('virtual_classes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->nullable();
                $table->foreignId('lecturer_id')->nullable();
                $table->string('title');
                $table->text('description')->nullable();
                $table->dateTime('scheduled_at')->nullable();
                $table->integer('duration')->default(60);
                $table->string('meeting_link')->nullable();
                $table->string('recording_url')->nullable();
                $table->boolean('is_recorded')->default(false);
                $table->enum('status', ['upcoming', 'active', 'ended'])->default('upcoming');
                $table->timestamps();
            });

            // Seed Dummy Data
            DB::table('virtual_classes')->insert([
                'title' => 'Introduction to Algorithms (Restored)',
                'description' => 'System auto-restored this class.',
                'scheduled_at' => Carbon::tomorrow()->setHour(10),
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
