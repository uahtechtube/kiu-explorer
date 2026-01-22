<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Option;
use App\Models\ExamAttempt;
use App\Models\ExamResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    /**
     * List exams for a course.
     */
    public function index(Request $request)
    {
        $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'status' => 'nullable|string'
        ]);
        
        $query = Exam::with(['course'])->where('is_published', true);

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        } else {
            // If student, only show exams for courses they are enrolled in
            $user = $request->user();
            if ($user->role === 'student') {
                $enrolledCourseIds = \App\Models\CourseRegistration::where('user_id', $user->id)
                    ->pluck('course_id');
                $query->whereIn('course_id', $enrolledCourseIds);
            }
        }

        $exams = $query->get()->map(function($exam) use ($request) {
            // Add computed status for frontend
            $now = now();
            $status = 'upcoming';
            
            if ($now->between($exam->start_time, $exam->end_time)) {
                $status = 'active';
            } elseif ($now->gt($exam->end_time)) {
                $status = 'missed';
            }

            // Check for completion
            $attempt = $exam->attempts()->where('user_id', $request->user()->id)->first();
            if ($attempt && $attempt->status === 'submitted') {
                $status = 'completed';
                $exam->score = $attempt->score;
                $exam->percentage = ($exam->total_marks > 0) ? ($attempt->score / $exam->total_marks) * 100 : 0;
            }

            $exam->status = $status;
            $exam->course_code = $exam->course->code ?? 'N/A';
            return $exam;
        });
            
        return response()->json(['data' => $exams]);
    }

    /**
     * Create an exam (Lecturer/Admin).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'title' => 'required|string|max:255',
            'instructions' => 'nullable|string',
            'type' => 'required|in:objective,theory,hybrid',
            'duration' => 'required|integer|min:1',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'total_marks' => 'required|integer',
            'passing_marks' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if ($request->user()->role !== 'lecturer' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $exam = Exam::create($request->all());

        return response()->json([
            'message' => 'Exam created successfully',
            'exam' => $exam
        ], 201);
    }

    /**
     * Add multiple questions to an exam.
     */
    public function addQuestions(Request $request, $examId)
    {
        $exam = Exam::findOrFail($examId);
        
        // Authorization check...

        $request->validate([
            'questions' => 'required|array',
            'questions.*.question_text' => 'required|string',
            'questions.*.type' => 'required|in:objective,theory',
            'questions.*.marks' => 'required|integer',
            'questions.*.options' => 'required_if:questions.*.type,objective|array',
            'questions.*.options.*.option_text' => 'required|string',
            'questions.*.options.*.is_correct' => 'required|boolean',
        ]);

        DB::transaction(function () use ($request, $exam) {
            foreach ($request->questions as $qData) {
                $question = $exam->questions()->create([
                    'question_text' => $qData['question_text'],
                    'type' => $qData['type'],
                    'marks' => $qData['marks'],
                ]);

                if ($qData['type'] === 'objective') {
                    foreach ($qData['options'] as $oData) {
                        $question->options()->create($oData);
                    }
                }
            }
        });

        return response()->json(['message' => 'Questions added successfully']);
    }

    /**
     * Student starts an exam.
     */
    public function startAttempt(Request $request, $examId)
    {
        $exam = Exam::findOrFail($examId);
        $user = $request->user();

        // Check if already attempted
        $existing = ExamAttempt::where('exam_id', $exam->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Exam already attempted or in progress.'], 400);
        }

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'started_at' => now(),
            'status' => 'ongoing',
        ]);

        // Load questions (excluding correct answers for objective)
        $questions = Question::where('exam_id', $exam->id)
            ->with(['options' => function($query) {
                $query->select('id', 'question_id', 'option_text'); // Hide is_correct
            }])
            ->get();

        return response()->json([
            'attempt_id' => $attempt->id,
            'exam' => $exam,
            'questions' => $questions,
            'expires_at' => now()->addMinutes($exam->duration),
        ]);
    }

    /**
     * Student submits the exam.
     */
    public function submitAttempt(Request $request, $attemptId)
    {
        $attempt = ExamAttempt::findOrFail($attemptId);
        
        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($attempt->status !== 'ongoing') {
            return response()->json(['message' => 'Attempt already submitted.'], 400);
        }

        $request->validate([
            'responses' => 'required|array',
            'responses.*.question_id' => 'required|exists:questions,id',
            'responses.*.selected_option_id' => 'nullable|exists:options,id',
            'responses.*.theory_answer' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $attempt) {
            $totalScore = 0;

            foreach ($request->responses as $resp) {
                $question = Question::find($resp['question_id']);
                $marks = 0;

                if ($question->type === 'objective' && isset($resp['selected_option_id'])) {
                    $option = Option::find($resp['selected_option_id']);
                    if ($option->is_correct) {
                        $marks = $question->marks;
                    }
                }

                ExamResponse::create([
                    'exam_attempt_id' => $attempt->id,
                    'question_id' => $resp['question_id'],
                    'selected_option_id' => $resp['selected_option_id'] ?? null,
                    'theory_answer' => $resp['theory_answer'] ?? null,
                    'marks_obtained' => ($question->type === 'objective') ? $marks : null,
                ]);

                $totalScore += $marks;
            }

            $attempt->update([
                'submitted_at' => now(),
                'score' => $totalScore,
                'status' => 'submitted',
            ]);
        });

        return response()->json([
            'message' => 'Exam submitted successfully',
            'score' => $attempt->score
        ]);
    }
}
