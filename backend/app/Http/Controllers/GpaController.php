<?php

namespace App\Http\Controllers;

use App\Models\GpaEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GpaController extends Controller
{
    /**
     * Get all GPA entries for the authenticated user, grouped by semester
     */
    public function index(Request $request)
    {
        $entries = GpaEntry::where('user_id', $request->user()->id)
            ->orderBy('semester', 'asc')
            ->orderBy('course_code', 'asc')
            ->get();

        // Group by semester
        $grouped = $entries->groupBy('semester');

        return response()->json($grouped);
    }

    /**
     * Store a new GPA entry
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'semester' => 'required|string',
            'course_code' => 'required|string',
            'course_title' => 'nullable|string',
            'credit_units' => 'required|integer|min:1|max:6',
            'grade' => 'required|string|in:A,B,C,D,E,F,a,b,c,d,e,f',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $entry = GpaEntry::create([
            'user_id' => $request->user()->id,
            'semester' => $request->semester,
            'course_code' => strtoupper($request->course_code),
            'course_title' => $request->course_title,
            'credit_units' => $request->credit_units,
            'grade' => strtoupper($request->grade),
        ]);

        return response()->json([
            'message' => 'Course result added successfully.',
            'data' => $entry
        ], 201);
    }

    /**
     * Update an existing GPA entry
     */
    public function update(Request $request, $id)
    {
        $entry = GpaEntry::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'semester' => 'sometimes|required|string',
            'course_code' => 'sometimes|required|string',
            'course_title' => 'nullable|string',
            'credit_units' => 'sometimes|required|integer|min:1|max:6',
            'grade' => 'sometimes|required|string|in:A,B,C,D,E,F,a,b,c,d,e,f',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['semester', 'course_code', 'course_title', 'credit_units', 'grade']);
        
        if (isset($data['course_code'])) {
            $data['course_code'] = strtoupper($data['course_code']);
        }
        if (isset($data['grade'])) {
            $data['grade'] = strtoupper($data['grade']);
        }

        $entry->update($data);

        return response()->json([
            'message' => 'Course result updated successfully.',
            'data' => $entry
        ]);
    }

    /**
     * Delete a GPA entry
     */
    public function destroy(Request $request, $id)
    {
        $entry = GpaEntry::where('user_id', $request->user()->id)->findOrFail($id);
        $entry->delete();

        return response()->json([
            'message' => 'Course result deleted successfully.'
        ]);
    }

    /**
     * Get CGPA and semester summaries
     */
    public function summary(Request $request)
    {
        $userId = $request->user()->id;
        $entries = GpaEntry::where('user_id', $userId)->get();

        $totalCredits = 0;
        $totalQualityPoints = 0;
        $semesters = [];

        // Group and compute per semester
        $grouped = $entries->groupBy('semester');

        foreach ($grouped as $semesterName => $semesterEntries) {
            $semCredits = 0;
            $semQualityPoints = 0;

            foreach ($semesterEntries as $entry) {
                $semCredits += $entry->credit_units;
                $semQualityPoints += ($entry->grade_points * $entry->credit_units);
            }

            $semesterGpa = $semCredits > 0 ? round($semQualityPoints / $semCredits, 2) : 0.00;

            $semesters[] = [
                'semester' => $semesterName,
                'gpa' => $semesterGpa,
                'credit_units' => $semCredits,
                'quality_points' => $semQualityPoints,
                'courses_count' => $semesterEntries->count(),
            ];

            $totalCredits += $semCredits;
            $totalQualityPoints += $semQualityPoints;
        }

        $cgpa = $totalCredits > 0 ? round($totalQualityPoints / $totalCredits, 2) : 0.00;

        // Classify Honours (standard Nigerian system)
        $classification = 'Pass';
        if ($cgpa >= 4.50) {
            $classification = 'First Class Honours';
        } elseif ($cgpa >= 3.50) {
            $classification = 'Second Class Honours (Upper Division)';
        } elseif ($cgpa >= 2.40) {
            $classification = 'Second Class Honours (Lower Division)';
        } elseif ($cgpa >= 1.50) {
            $classification = 'Third Class Honours';
        } elseif ($cgpa >= 1.00) {
            $classification = 'Pass';
        } else {
            $classification = 'Fail';
        }

        return response()->json([
            'cgpa' => $cgpa,
            'total_credits' => $totalCredits,
            'total_quality_points' => $totalQualityPoints,
            'classification' => $classification,
            'semesters' => $semesters,
        ]);
    }
}
