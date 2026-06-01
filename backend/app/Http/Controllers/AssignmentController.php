<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AssignmentController extends Controller
{
    /**
     * List assignments
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Assignment::with(['course', 'lecturer:id,surname,first_name'])->withCount('submissions');

        if ($user->isStudent()) {
            // Students see assignments for their registered courses (with a global fallback if no explicit registrations exist)
            $courseIds = \App\Models\CourseRegistration::where('user_id', $user->id)->pluck('course_id');
            if ($courseIds->isEmpty()) {
                $courseIds = \App\Models\Course::pluck('id');
            }
            $query->whereIn('course_id', $courseIds)->where('is_published', true);
        } elseif ($user->isLecturer()) {
            // Lecturers see their own assignments
            $query->where('lecturer_id', $user->id);
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($user->isStudent()) {
            // Eager load submissions for the current student only
            $query->with(['submissions' => function($q) use ($user) {
                $q->where('student_id', $user->id);
            }]);
        }

        $assignments = $query->orderByDesc('created_at')->paginate(20);

        if ($user->isStudent()) {
            $assignments->getCollection()->transform(function($assignment) {
                $submission = $assignment->submissions->first(); // No extra query, already loaded
                $assignment->status = $submission ? $submission->status : 'pending';
                unset($assignment->submissions); // Clean up response
                return $assignment;
            });
        }

        return response()->json($assignments);
    }

    /**
     * Get assignment details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $assignment = Assignment::with(['course', 'lecturer:id,surname,first_name'])->findOrFail($id);

        if ($user->isStudent()) {
            // Check if student has access to this course
            $courseIds = \App\Models\CourseRegistration::where('user_id', $user->id)->pluck('course_id');
            if ($courseIds->isNotEmpty() && !$courseIds->contains($assignment->course_id)) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            
            // Get student submission
            $submission = AssignmentSubmission::where('assignment_id', $id)
                ->where('student_id', $user->id)
                ->first();
            
            $assignment->status = $submission ? $submission->status : 'pending';
            $assignment->setRelation('submission', $submission); // Attach as relation
        } elseif ($user->isLecturer()) {
            // Verify lecturer owns the assignment
            if ($assignment->lecturer_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json($assignment);
    }

    /**
     * Create assignment (Lecturer)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'due_date' => 'required|date|after:now',
            'max_score' => 'sometimes|integer|min:1',
            'allow_late_submission' => 'sometimes|boolean',
            'late_penalty_percent' => 'sometimes|integer|min:0|max:100',
            'attachment' => 'nullable|file|max:10240', // 10MB
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('attachment');
        $data['lecturer_id'] = $request->user()->id;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('assignments', $filename, 'public');
            $data['attachment_path'] = $path;
        }

        $assignment = Assignment::create($data);

        return response()->json([
            'message' => 'Assignment created successfully.',
            'data' => $assignment
        ], 201);
    }

    /**
     * Submit assignment (Student)
     */
    public function submit(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'submission_text' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if already submitted
        $existing = AssignmentSubmission::where('assignment_id', $id)
            ->where('student_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already submitted this assignment.'], 400);
        }

        $data = [
            'assignment_id' => $id,
            'student_id' => $user->id,
            'submission_text' => $request->submission_text,
            'submitted_at' => now(),
            'is_late' => now()->greaterThan($assignment->due_date),
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('submissions', $filename, 'public');
            $data['file_path'] = $path;
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
        }

        $submission = AssignmentSubmission::create($data);

        return response()->json([
            'message' => 'Assignment submitted successfully.',
            'data' => $submission
        ], 201);
    }

    /**
     * Grade submission (Lecturer)
     */
    public function grade(Request $request, $submissionId)
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer|min:0',
            'feedback' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $submission = AssignmentSubmission::findOrFail($submissionId);

        // Verify lecturer owns the assignment
        if ($submission->assignment->lecturer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $submission->update([
            'score' => $request->score,
            'feedback' => $request->feedback,
            'graded_by' => $request->user()->id,
            'graded_at' => now(),
            'status' => 'graded',
        ]);

        return response()->json([
            'message' => 'Assignment graded successfully.',
            'data' => $submission->load(['student:id,surname,first_name', 'grader:id,surname,first_name'])
        ]);
    }

    /**
     * Get submissions for an assignment (Lecturer)
     */
    public function getSubmissions($id)
    {
        $assignment = Assignment::findOrFail($id);

        // Verify lecturer owns the assignment
        if ($assignment->lecturer_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $submissions = AssignmentSubmission::where('assignment_id', $id)
            ->with(['student:id,surname,first_name,matric_number'])
            ->get();

        return response()->json($submissions);
    }

    /**
     * Get details of a single submission
     */
    public function getSubmission(Request $request, $id)
    {
        $submission = AssignmentSubmission::with([
            'student:id,surname,first_name,matric_number',
            'assignment:id,title,max_score,due_date,lecturer_id'
        ])->findOrFail($id);

        // Verify user is the lecturer of this assignment OR the student who submitted it
        $user = $request->user();
        if ($user->isLecturer()) {
            if ($submission->assignment->lecturer_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        } elseif ($user->isStudent()) {
            if ($submission->student_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json($submission);
    }
}
