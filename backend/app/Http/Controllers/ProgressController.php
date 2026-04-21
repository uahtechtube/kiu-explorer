<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Assignment;
use App\Models\Attendance;

class ProgressController extends Controller
{
    /**
     * Get academic progress statistics for the authenticated student
     */
    public function academic(Request $request)
    {
        $student = Auth::user();
        
        if (!$student || !$student->student_profile) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Get enrolled courses
        $enrolledCourses = $student->enrolledCourses()->with('lecturer')->get();

        // Calculate attendance rate
        $totalClasses = Attendance::whereIn('course_id', $enrolledCourses->pluck('id'))->count();
        $attendedClasses = Attendance::whereIn('course_id', $enrolledCourses->pluck('id'))
            ->where('student_id', $student->id)
            ->where('status', 'present')
            ->count();
        $attendanceRate = $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100, 1) : 0;

        // Calculate assignment performance
        $assignments = Assignment::whereIn('course_id', $enrolledCourses->pluck('id'))->get();
        $submittedAssignments = $assignments->filter(function ($assignment) use ($student) {
            return $assignment->submissions()->where('student_id', $student->id)->exists();
        });
        
        $totalScore = 0;
        $gradedCount = 0;
        foreach ($submittedAssignments as $assignment) {
            $submission = $assignment->submissions()->where('student_id', $student->id)->first();
            if ($submission && $submission->score !== null) {
                $totalScore += ($submission->score / $assignment->total_marks) * 100;
                $gradedCount++;
            }
        }
        $averageAssignmentScore = $gradedCount > 0 ? round($totalScore / $gradedCount, 1) : 0;

        // Calculate exam performance
        $exams = Exam::whereIn('course_id', $enrolledCourses->pluck('id'))->get();
        $takenExams = $exams->filter(function ($exam) use ($student) {
            return $exam->submissions()->where('student_id', $student->id)->exists();
        });
        
        $totalExamScore = 0;
        $examCount = 0;
        foreach ($takenExams as $exam) {
            $submission = $exam->submissions()->where('student_id', $student->id)->first();
            if ($submission && $submission->score !== null) {
                $totalExamScore += ($submission->score / $exam->total_marks) * 100;
                $examCount++;
            }
        }
        $averageExamScore = $examCount > 0 ? round($totalExamScore / $examCount, 1) : 0;

        // Build course progress array
        $courses = $enrolledCourses->map(function ($course) use ($student) {
            // Get course-specific attendance
            $courseClasses = Attendance::where('course_id', $course->id)->count();
            $courseAttended = Attendance::where('course_id', $course->id)
                ->where('student_id', $student->id)
                ->where('status', 'present')
                ->count();
            $courseAttendance = $courseClasses > 0 ? round(($courseAttended / $courseClasses) * 100) : 0;

            // Get course-specific score (assignments + exams average)
            $courseAssignments = Assignment::where('course_id', $course->id)->get();
            $courseExams = Exam::where('course_id', $course->id)->get();
            
            $assignmentScores = [];
            foreach ($courseAssignments as $assignment) {
                $submission = $assignment->submissions()->where('student_id', $student->id)->first();
                if ($submission && $submission->score !== null) {
                    $assignmentScores[] = ($submission->score / $assignment->total_marks) * 100;
                }
            }
            
            $examScores = [];
            foreach ($courseExams as $exam) {
                $submission = $exam->submissions()->where('student_id', $student->id)->first();
                if ($submission && $submission->score !== null) {
                    $examScores[] = ($submission->score / $exam->total_marks) * 100;
                }
            }
            
            $allScores = array_merge($assignmentScores, $examScores);
            $courseScore = count($allScores) > 0 ? round(array_sum($allScores) / count($allScores)) : 0;

            return [
                'name' => $course->title,
                'code' => $course->code,
                'score' => $courseScore,
                'attendance' => $courseAttendance,
            ];
        });

        return response()->json([
            'attendance' => [
                'rate' => $attendanceRate,
                'attended' => $attendedClasses,
                'total' => $totalClasses,
            ],
            'assignment_performance' => [
                'average_score' => $averageAssignmentScore,
                'total_assignments' => $assignments->count(),
                'submitted' => $submittedAssignments->count(),
            ],
            'exam_performance' => [
                'average_score' => $averageExamScore,
                'total_exams' => $exams->count(),
                'taken' => $takenExams->count(),
            ],
            'courses' => $courses,
        ]);
    }
}
