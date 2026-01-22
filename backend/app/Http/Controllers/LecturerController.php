<?php

namespace App\Http\Controllers;

use App\Models\LecturerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LecturerController extends Controller
{
    /**
     * Create or Update the authenticated user's lecturer profile.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->isLecturer()) {
            return response()->json(['message' => 'Unauthorized. Only lecturers can have profiles.'], 403);
        }

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'staff_id' => 'required|string|unique:lecturer_profiles,staff_id,' . ($user->lecturerProfile->id ?? 'NULL'),
            'qualification' => 'nullable|string',
            'rank' => 'nullable|string',
            'bio' => 'nullable|string',
            'specialization' => 'nullable|string',
        ]);

        $profile = LecturerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'message' => 'Lecturer profile updated successfully.',
            'profile' => $profile
        ]);
    }

    /**
     * Display the specified lecturer profile.
     */
    public function show($id)
    {
        $profile = LecturerProfile::with(['user', 'department'])->find($id);

        if (!$profile) {
            return response()->json(['message' => 'Lecturer not found.'], 404);
        }

        return response()->json($profile);
    }

    /**
     * Get performance statistics for courses taught by the lecturer
     */
    public function getClassPerformance(Request $request)
    {
        $user = Auth::user();
        
        // Find courses allocated to this lecturer
        $allocations = \App\Models\CourseAllocation::where('lecturer_id', $user->id)
            ->with('course')
            ->get();

        $performance = [];

        foreach ($allocations as $allocation) {
            $courseId = $allocation->course_id;

            // Average exam score
            $avgExam = \App\Models\ExamAttempt::whereHas('exam', function($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })->avg('score');

            // Average assignment score
            $avgAssignment = \App\Models\AssignmentSubmission::whereHas('assignment', function($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })->avg('score');

            // Attendance rate
            $attendance = \App\Models\Attendance::whereHas('virtualClass', function($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present')
            ->first();

            $performance[] = [
                'course_id' => $courseId,
                'course_code' => $allocation->course->course_code,
                'course_title' => $allocation->course->course_title,
                'average_exam_score' => round($avgExam ?? 0, 2),
                'average_assignment_score' => round($avgAssignment ?? 0, 2),
                'attendance_rate' => $attendance->total > 0 ? round(($attendance->present / $attendance->total) * 100, 2) : 0,
            ];
        }

        return response()->json($performance);
    }

    /**
     * Get detailed progress for a specific student in a course
     */
    public function getStudentProgress(Request $request, $courseId, $studentId)
    {
        $lecturerId = Auth::id();

        // Verify lecturer is allocated to this course
        $isAllocated = \App\Models\CourseAllocation::where('course_id', $courseId)
            ->where('lecturer_id', $lecturerId)
            ->exists();

        if (!$isAllocated) {
            return response()->json(['message' => 'Unauthorized. You are not allocated to this course.'], 403);
        }

        $student = \App\Models\User::with('studentProfile')->findOrFail($studentId);

        // Exam attempts
        $exams = \App\Models\ExamAttempt::whereHas('exam', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })->where('student_id', $studentId)->get();

        // Assignment submissions
        $assignments = \App\Models\AssignmentSubmission::whereHas('assignment', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })->where('student_id', $studentId)->get();

        // Attendance
        $attendance = \App\Models\Attendance::whereHas('virtualClass', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })->where('student_id', $studentId)->get();

        return response()->json([
            'student' => $student,
            'exams' => $exams,
            'assignments' => $assignments,
            'attendance' => $attendance,
        ]);
    }

    /**
     * Get attendance report for a specific course
     */
    public function getAttendanceReport(Request $request, $courseId)
    {
        $lecturerId = Auth::id();

        $isAllocated = \App\Models\CourseAllocation::where('course_id', $courseId)
            ->where('lecturer_id', $lecturerId)
            ->exists();

        if (!$isAllocated) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $report = \App\Models\Attendance::whereHas('virtualClass', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->with(['student:id,surname,first_name,matric_number', 'virtualClass:id,title,scheduled_at'])
        ->orderByDesc('created_at')
        ->paginate(50);

        return response()->json($report);
    }

    /**
     * Get overall exam statistics for lecturer's courses
     */
    public function getExamStatistics(Request $request)
    {
        $user = Auth::user();

        $stats = \App\Models\Exam::where('lecturer_id', $user->id)
            ->withCount('attempts')
            ->with(['course'])
            ->get()
            ->map(function($exam) {
                $avg = \App\Models\ExamAttempt::where('exam_id', $exam->id)->avg('score');
                $passCount = \App\Models\ExamAttempt::where('exam_id', $exam->id)->where('score', '>=', 40)->count();
                
                return [
                    'exam_id' => $exam->id,
                    'title' => $exam->title,
                    'course' => $exam->course->course_code,
                    'total_attempts' => $exam->attempts_count,
                    'average_score' => round($avg ?? 0, 2),
                    'pass_rate' => $exam->attempts_count > 0 ? round(($passCount / $exam->attempts_count) * 100, 2) : 0,
                ];
            });

        return response()->json($stats);
    }

}
