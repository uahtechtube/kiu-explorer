<?php

namespace App\Http\Controllers;

use App\Models\GeneralAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Mark attendance
     */
    public function mark(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'attendance_date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();
        $data['marked_by'] = $request->user()->id;

        $attendance = GeneralAttendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'attendance_date' => $request->attendance_date,
            ],
            $data
        );

        return response()->json([
            'message' => 'Attendance marked successfully.',
            'data' => $attendance
        ]);
    }

    /**
     * Get student attendance records
     */
    public function getStudentAttendance(Request $request)
    {
        $user = $request->user();
        $studentId = $user->isStudent() ? $user->id : $request->student_id;

        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        $query = GeneralAttendance::where('student_id', $studentId);

        if ($request->has('from_date')) {
            $query->where('attendance_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('attendance_date', '<=', $request->to_date);
        }

        $records = $query->orderByDesc('attendance_date')->get()->map(function($record) {
            return [
                'id' => $record->id,
                'course_code' => 'GEN-101', // This should ideally come from a relationship, mocking for now as GeneralAttendance doesn't have course_id in current view
                'course_title' => 'General Attendance',
                'date' => $record->attendance_date->format('Y-m-d'),
                'status' => ucfirst($record->status),
                'time' => $record->check_in_time ?? '-',
            ];
        });

        // Mock summary for now as the model structure is simple
        $summary = [
            [
                'course_code' => 'OVERALL',
                'total_classes' => $records->count(),
                'attended' => $records->where('status', 'Present')->count(),
                'percentage' => $records->count() > 0 ? round(($records->where('status', 'Present')->count() / $records->count()) * 100) : 0
            ]
        ];

        return response()->json([
            'records' => $records,
            'summary' => $summary
        ]);
    }

    /**
     * Get attendance statistics
     */
    public function getStatistics(Request $request)
    {
        $user = $request->user();
        $studentId = $user->isStudent() ? $user->id : $request->student_id;

        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        $stats = GeneralAttendance::where('student_id', $studentId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $total = $stats->sum();
        $present = $stats->get('present', 0);
        $attendanceRate = $total > 0 ? ($present / $total) * 100 : 0;

        return response()->json([
            'total_days' => $total,
            'present' => $present,
            'absent' => $stats->get('absent', 0),
            'late' => $stats->get('late', 0),
            'excused' => $stats->get('excused', 0),
            'attendance_rate' => round($attendanceRate, 2),
        ]);
    }

    /**
     * Get attendance report (Admin/Lecturer)
     */
    public function getReport(Request $request)
    {
        $query = GeneralAttendance::with(['student:id,surname,first_name,matric_number']);

        if ($request->has('attendance_date')) {
            $query->where('attendance_date', $request->attendance_date);
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('attendance_date', [$request->from_date, $request->to_date]);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $attendance = $query->orderByDesc('attendance_date')->paginate(50);

        return response()->json($attendance);
    }
}
