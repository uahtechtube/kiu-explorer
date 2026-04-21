<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ExamAttempt;
use App\Models\AssignmentSubmission;
use App\Models\GeneralAttendance;
use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Generate overall academic report for a student
     */
    public function generateAcademicReport(Request $request, $studentId = null)
    {
        $studentId = $studentId ?? Auth::id();
        $user = User::with('studentProfile')->findOrFail($studentId);

        if (Auth::user()->isStudent() && Auth::id() != $studentId) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $examAvg = ExamAttempt::where('student_id', $studentId)->avg('score');
        $assignmentAvg = AssignmentSubmission::where('student_id', $studentId)->avg('score');

        $coursePerformance = DB::table('exam_attempts')
            ->join('exams', 'exam_attempts.exam_id', '=', 'exams.id')
            ->join('courses', 'exams.course_id', '=', 'courses.id')
            ->where('exam_attempts.student_id', $studentId)
            ->select('courses.code', 'courses.title', DB::raw('AVG(score) as average_score'))
            ->groupBy('courses.code', 'courses.title')
            ->get();

        return response()->json([
            'full_name' => $user->full_name,
            'matric_number' => $user->studentProfile->matric_number ?? 'N/A',
            'overall_exam_average' => round($examAvg ?? 0, 2),
            'overall_assignment_average' => round($assignmentAvg ?? 0, 2),
            'course_performance' => $coursePerformance,
            'report_generated_at' => now()->toDateTimeString(),
        ]);
    }

    /**
     * Generate attendance report
     */
    public function generateAttendanceReport(Request $request, $studentId = null)
    {
        $studentId = $studentId ?? Auth::id();
        
        $stats = GeneralAttendance::where('student_id', $studentId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $total = $stats->sum();
        $present = $stats->get('present', 0);
        $attendanceRate = $total > 0 ? ($present / $total) * 100 : 0;

        $history = GeneralAttendance::where('student_id', $studentId)
            ->orderByDesc('attendance_date')
            ->limit(30)
            ->get();

        return response()->json([
            'total_days_tracked' => $total,
            'attendance_breakdown' => $stats,
            'attendance_rate' => round($attendanceRate, 2),
            'recent_history' => $history,
        ]);
    }

    /**
     * Generate system usage and social activity report (Admin)
     */
    public function generateSystemUsageReport(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $totalUsers = User::count();
        $usersByRole = User::select('role', DB::raw('count(*) as count'))->groupBy('role')->get();
        $totalPosts = Post::count();
        $activeUsersToday = DB::table('sessions')->count(); // Assuming using database session driver

        $popularCourses = DB::table('course_registrations')
            ->join('courses', 'course_registrations.course_id', '=', 'courses.id')
            ->select('courses.code', DB::raw('count(*) as student_count'))
            ->groupBy('courses.code')
            ->orderByDesc('student_count')
            ->limit(5)
            ->get();

        return response()->json([
            'total_users' => $totalUsers,
            'users_by_role' => $usersByRole,
            'total_social_posts' => $totalPosts,
            'active_sessions' => $activeUsersToday,
            'most_popular_courses' => $popularCourses,
            'generated_at' => now()->toDateTimeString(),
        ]);
    }
}
