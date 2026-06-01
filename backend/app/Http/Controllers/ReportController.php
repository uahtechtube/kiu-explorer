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

        $examAvg = ExamAttempt::where('user_id', $studentId)->avg('score');
        $assignmentAvg = AssignmentSubmission::where('student_id', $studentId)->avg('score');

        $coursePerformance = DB::table('exam_attempts')
            ->join('exams', 'exam_attempts.exam_id', '=', 'exams.id')
            ->join('courses', 'exams.course_id', '=', 'courses.id')
            ->where('exam_attempts.user_id', $studentId)
            ->select('courses.code', 'courses.title', DB::raw('AVG(score) as average_score'))
            ->groupBy('courses.code', 'courses.title')
            ->get();

        // CSV Format Handler
        if ($request->has('format') && $request->format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="academic_report_' . $studentId . '.csv"',
            ];

            $callback = function () use ($user, $examAvg, $assignmentAvg, $coursePerformance) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['KASHIM IBRAHIM UNIVERSITY (KIU)']);
                fputcsv($file, ['ACADEMIC PERFORMANCE REPORT']);
                fputcsv($file, []);
                fputcsv($file, ['Student Name:', $user->name]);
                fputcsv($file, ['Matric Number:', $user->studentProfile->matric_number ?? 'N/A']);
                fputcsv($file, ['Overall Exam Average:', round($examAvg ?? 0, 2) . '%']);
                fputcsv($file, ['Overall Assignment Average:', round($assignmentAvg ?? 0, 2) . '%']);
                fputcsv($file, []);
                fputcsv($file, ['COURSE DETAILS & SCORES']);
                fputcsv($file, ['Course Code', 'Course Title', 'Average Grade (%)']);
                foreach ($coursePerformance as $perf) {
                    fputcsv($file, [$perf->code, $perf->title, round($perf->average_score ?? 0, 2)]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json([
            'full_name' => $user->name,
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

        // CSV Format Handler
        if ($request->has('format') && $request->format === 'csv') {
            $user = User::with('studentProfile')->findOrFail($studentId);
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="attendance_report_' . $studentId . '.csv"',
            ];

            $callback = function () use ($user, $total, $stats, $attendanceRate, $history) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['KASHIM IBRAHIM UNIVERSITY (KIU)']);
                fputcsv($file, ['ATTENDANCE AUDIT LOG']);
                fputcsv($file, []);
                fputcsv($file, ['Student Name:', $user->name]);
                fputcsv($file, ['Matric Number:', $user->studentProfile->matric_number ?? 'N/A']);
                fputcsv($file, ['Attendance Rate:', round($attendanceRate, 2) . '%']);
                fputcsv($file, ['Total Tracked Days:', $total]);
                fputcsv($file, ['Present Count:', $stats->get('present', 0)]);
                fputcsv($file, ['Absent Count:', $stats->get('absent', 0)]);
                fputcsv($file, []);
                fputcsv($file, ['ATTENDANCE LOG ENTRIES']);
                fputcsv($file, ['Date', 'Status', 'Recorded At']);
                foreach ($history as $log) {
                    fputcsv($file, [
                        $log->attendance_date,
                        strtoupper($log->status),
                        $log->created_at ? $log->created_at->toDateTimeString() : 'N/A'
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

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

        // CSV Format Handler
        if ($request->has('format') && $request->format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="system_analytics_report.csv"',
            ];

            $callback = function () use ($totalUsers, $usersByRole, $totalPosts, $activeUsersToday, $popularCourses) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['KASHIM IBRAHIM UNIVERSITY (KIU)']);
                fputcsv($file, ['SYSTEM ANALYTICS & LOGISTICS REPORT']);
                fputcsv($file, []);
                fputcsv($file, ['METRIC SUMMARY']);
                fputcsv($file, ['Total Registered Users:', $totalUsers]);
                fputcsv($file, ['Active Sessions Today:', $activeUsersToday]);
                fputcsv($file, ['Total Forum Social Posts:', $totalPosts]);
                fputcsv($file, []);
                fputcsv($file, ['DEMOGRAPHICS BY ROLE']);
                fputcsv($file, ['User Role', 'Count']);
                foreach ($usersByRole as $roleRow) {
                    fputcsv($file, [ucfirst($roleRow->role), $roleRow->count]);
                }
                fputcsv($file, []);
                fputcsv($file, ['POPULAR COURSE ENROLLMENTS']);
                fputcsv($file, ['Course Code', 'Student Count']);
                foreach ($popularCourses as $cRow) {
                    fputcsv($file, [$cRow->code, $cRow->student_count]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

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
