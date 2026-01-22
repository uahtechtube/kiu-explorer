<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ExamAttempt;
use App\Models\AssignmentSubmission;
use App\Models\Attendance;
use App\Models\GeneralAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentProgressController extends Controller
{
    /**
     * Get overall academic progress
     */
    public function getAcademicProgress(Request $request)
    {
        $user = $request->user();
        $studentId = $user->isStudent() ? $user->id : $request->student_id;

        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        $student = User::with('studentProfile')->findOrFail($studentId);

        // Get exam performance
        $examStats = ExamAttempt::where('user_id', $studentId)
            ->selectRaw('AVG(score) as average_score, COUNT(*) as total_exams')
            ->first();

        // Get assignment performance
        $assignmentStats = AssignmentSubmission::where('student_id', $studentId)
            ->whereNotNull('score')
            ->selectRaw('AVG(score) as average_score, COUNT(*) as total_assignments')
            ->first();

        // Get attendance rate
        $attendanceStats = GeneralAttendance::where('student_id', $studentId)
            ->selectRaw('
                COUNT(*) as total_days,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_days
            ')
            ->first();

        $attendanceRate = ($attendanceStats && $attendanceStats->total_days > 0)
            ? ($attendanceStats->present_days / $attendanceStats->total_days) * 100
            : 0;

        return response()->json([
            'student' => $student,
            'exam_performance' => [
                'average_score' => round(optional($examStats)->average_score ?? 0, 2),
                'total_exams' => optional($examStats)->total_exams ?? 0,
            ],
            'assignment_performance' => [
                'average_score' => round(optional($assignmentStats)->average_score ?? 0, 2),
                'total_assignments' => optional($assignmentStats)->total_assignments ?? 0,
            ],
            'attendance' => [
                'rate' => round($attendanceRate, 2),
                'present_days' => optional($attendanceStats)->present_days ?? 0,
                'total_days' => optional($attendanceStats)->total_days ?? 0,
            ],
        ]);
    }

    /**
     * Get course-specific progress
     */
    public function getCourseProgress(Request $request, $courseId)
    {
        $user = $request->user();
        $studentId = $user->isStudent() ? $user->id : $request->student_id;

        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        // Exam performance for this course
        $examPerformance = ExamAttempt::whereHas('exam', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->where('user_id', $studentId)
        ->selectRaw('AVG(score) as average_score, COUNT(*) as total_attempts')
        ->first();

        // Assignment performance for this course
        $assignmentPerformance = AssignmentSubmission::whereHas('assignment', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->where('student_id', $studentId)
        ->whereNotNull('score')
        ->selectRaw('AVG(score) as average_score, COUNT(*) as total_submissions')
        ->first();

        // Class attendance for this course
        $classAttendance = Attendance::whereHas('virtualClass', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->where('user_id', $studentId)
        ->selectRaw('
            COUNT(*) as total_classes,
            SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as attended_classes
        ')
        ->first();

        $attendanceRate = ($classAttendance && $classAttendance->total_classes > 0)
            ? ($classAttendance->attended_classes / $classAttendance->total_classes) * 100
            : 0;

        return response()->json([
            'course_id' => $courseId,
            'exam_performance' => [
                'average_score' => round(optional($examPerformance)->average_score ?? 0, 2),
                'total_attempts' => optional($examPerformance)->total_attempts ?? 0,
            ],
            'assignment_performance' => [
                'average_score' => round(optional($assignmentPerformance)->average_score ?? 0, 2),
                'total_submissions' => optional($assignmentPerformance)->total_submissions ?? 0,
            ],
            'class_attendance' => [
                'rate' => round($attendanceRate, 2),
                'attended_classes' => optional($classAttendance)->attended_classes ?? 0,
                'total_classes' => optional($classAttendance)->total_classes ?? 0,
            ],
        ]);
    }

    /**
     * Get comparison with class average
     */
    public function getComparisonStats(Request $request, $courseId)
    {
        $user = $request->user();
        $studentId = $user->isStudent() ? $user->id : $request->student_id;

        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        // Student's average
        $studentAvg = ExamAttempt::whereHas('exam', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->where('user_id', $studentId)
        ->avg('score');

        // Class average
        $classAvg = ExamAttempt::whereHas('exam', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->avg('score');

        return response()->json([
            'student_average' => round($studentAvg ?? 0, 2),
            'class_average' => round($classAvg ?? 0, 2),
            'difference' => round(($studentAvg ?? 0) - ($classAvg ?? 0), 2),
        ]);
    }
}
