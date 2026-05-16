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
     * List exams for the current lecturer.
     */
    public function lecturerExams(Request $request)
    {
        $exams = Exam::where('uploaded_by', $request->user()->id)
            ->with(['course'])
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($exam) {
                $exam->course_code = $exam->course_code ?: ($exam->course->code ?? 'N/A');
                return $exam;
            });

        return response()->json($exams);
    }

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
        }
        // Removed CourseRegistration filtering - anyone can see all published exams

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
                $exam->attempt_id = $attempt->id;
                $exam->percentage = ($exam->total_marks > 0) ? ($attempt->score / $exam->total_marks) * 100 : 0;
            }

            $exam->status = $status;
            $exam->course_code = $exam->course_code ?: ($exam->course->code ?? 'N/A');
            return $exam;
        });
            
        return response()->json(['data' => $exams]);
    }

    /**
     * Get details for a single exam.
     */
    public function show(Request $request, $id)
    {
        $exam = Exam::with(['course'])->withCount('questions')->findOrFail($id);
        
        // Add status and course code
        $now = now();
        $status = 'upcoming';
        $canStart = false;
        
        if ($now->between($exam->start_time, $exam->end_time)) {
            $status = 'active';
            $canStart = true;
        } elseif ($now->gt($exam->end_time)) {
            $status = 'missed';
        }

        // Check for completion
        $attempt = $exam->attempts()->where('user_id', $request->user()->id)->first();
        if ($attempt && $attempt->status === 'submitted') {
            $status = 'completed';
            $exam->score = $attempt->score;
            $exam->percentage = ($exam->total_marks > 0) ? ($attempt->score / $exam->total_marks) * 100 : 0;
            $canStart = false; // Already submitted
        }

        $exam->status = $status;
        $exam->can_start = $canStart;
        $exam->total_questions = $exam->questions_count;
        $exam->course_code = $exam->course_code ?: ($exam->course->code ?? 'N/A');
        $exam->scheduled_at = $exam->start_time->toDateTimeString();

        // Ensure instructions is an array
        if (is_string($exam->instructions)) {
            $exam->instructions = array_filter(explode("\n", $exam->instructions));
        } else {
            $exam->instructions = $exam->instructions ?? [];
        }

        return response()->json($exam);
    }

    /**
     * Get questions for an exam.
     */
    public function getQuestions(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        
        $questions = $exam->questions()->with(['options' => function($q) {
            $q->select('id', 'question_id', 'option_text'); // Hide is_correct for students
        }])->get();

        return response()->json($questions);
    }

    /**
     * Create an exam (Lecturer/Admin).
     */
    public function store(Request $request)
    {
        // If academic_session_id is not provided, try to find the active one
        if (!$request->has('academic_session_id')) {
            $activeSession = \App\Models\AcademicSession::where('is_current', true)->first() 
                ?? \App\Models\AcademicSession::first();
            if ($activeSession) {
                $request->merge(['academic_session_id' => $activeSession->id]);
            }
        }

        // Auto-fill missing fields from frontend payload
        if ($request->has('scheduled_at') && !$request->has('start_time')) {
            $request->merge(['start_time' => $request->scheduled_at]);
        }

        if ($request->has('start_time') && $request->has('duration') && !$request->has('end_time')) {
            try {
                $startTime = \Carbon\Carbon::parse($request->start_time);
                $endTime = $startTime->copy()->addMinutes($request->duration);
                $request->merge(['end_time' => $endTime->toDateTimeString()]);
            } catch (\Exception $e) {
                // Ignore
            }
        }

        // Type calculation if not provided
        if (!$request->has('type') && $request->has('questions')) {
            $hasMcq = false;
            $hasTheory = false;
            foreach ($request->questions as $q) {
                if (($q['type'] ?? '') === 'mcq' || ($q['type'] ?? '') === 'objective') $hasMcq = true;
                if (($q['type'] ?? '') === 'theory') $hasTheory = true;
            }
            if ($hasMcq && $hasTheory) $request->merge(['type' => 'hybrid']);
            else if ($hasTheory) $request->merge(['type' => 'theory']);
            else $request->merge(['type' => 'objective']);
        }

        // Calculate total marks from questions if not provided
        if (!$request->has('total_marks') && $request->has('questions')) {
            $total = 0;
            foreach ($request->questions as $q) {
                $total += intval($q['marks'] ?? 0);
            }
            $request->merge(['total_marks' => $total]);
        }

        if (!$request->has('passing_marks')) {
            $request->merge(['passing_marks' => ceil(($request->total_marks ?? 100) / 2)]);
        }

        $validator = Validator::make($request->all(), [
            'course_id' => 'nullable|exists:courses,id',
            'course_code' => 'required_without:course_id|string|max:50',
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

        DB::beginTransaction();
        try {
            $examData = $request->all();
            $examData['uploaded_by'] = $request->user()->id; // Track who uploaded it
            $examData['is_published'] = true; // Auto-publish for now
            $exam = Exam::create($examData);

            // If questions are provided in the payload, add them now
            if ($request->has('questions') && is_array($request->questions)) {
                foreach ($request->questions as $qData) {
                    $qType = (($qData['type'] ?? '') === 'mcq' || ($qData['type'] ?? '') === 'objective') ? 'objective' : 'theory';
                    $question = $exam->questions()->create([
                        'question_text' => $qData['question'] ?? 'No question text',
                        'type' => $qType,
                        'marks' => $qData['marks'] ?? 1,
                    ]);

                    if ($qType === 'objective' && isset($qData['options']) && is_array($qData['options'])) {
                        foreach ($qData['options'] as $index => $optionData) {
                            // Support both array of strings and array of objects
                            $text = is_array($optionData) ? ($optionData['text'] ?? '') : $optionData;
                            $isCorrect = is_array($optionData) ? ($optionData['is_correct'] ?? false) : ($index === ($qData['correct_index'] ?? 0));
                            
                            if (!empty($text)) {
                                $question->options()->create([
                                    'option_text' => $text,
                                    'is_correct' => $isCorrect
                                ]);
                            }
                        }
                    }
                }
            }
            DB::commit();

            return response()->json([
                'message' => 'Exam created successfully',
                'exam' => $exam
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create exam: ' . $e->getMessage()], 500);
        }
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
            if ($existing->status === 'submitted') {
                return response()->json(['message' => 'Exam already submitted.'], 400);
            }
            
            // Allow resuming ongoing attempt
            $attempt = $existing;
        } else {
            $attempt = ExamAttempt::create([
                'exam_id' => $exam->id,
                'user_id' => $user->id,
                'started_at' => now(),
                'status' => 'ongoing',
            ]);
        }

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
     * Save a single answer during the exam (Auto-save).
     */
    public function saveAnswer(Request $request, $id)
    {
        $attempt = ExamAttempt::where('exam_id', $id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'ongoing')
            ->firstOrFail();

        ExamResponse::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'question_id' => $request->question_id,
            ],
            [
                'selected_option_id' => $request->selected_option_id,
                'answer_text' => $request->answer_text,
                'marks_obtained' => 0, 
            ]
        );

        return response()->json(['message' => 'Answer saved successfully']);
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
            'responses.*.answer_text' => 'nullable|string', // For fill in the blank
        ]);

        $feedback = [];
        $totalScore = 0;

        DB::transaction(function () use ($request, $attempt, &$totalScore, &$feedback) {
            foreach ($request->responses as $resp) {
                $question = Question::with('options')->find($resp['question_id']);
                $marks = 0;
                $isCorrect = false;
                $correctAnswer = null;

                if ($question->type === 'objective' || $question->type === 'true_false') {
                    $correctOption = $question->options->where('is_correct', true)->first();
                    $correctAnswer = $correctOption ? $correctOption->option_text : null;
                    
                    if (isset($resp['selected_option_id'])) {
                        $option = Option::find($resp['selected_option_id']);
                        if ($option && $option->is_correct) {
                            $marks = $question->marks;
                            $isCorrect = true;
                        }
                    }
                } elseif ($question->type === 'fill_in_blank') {
                    // Simple case-insensitive match for fill in the blank
                    $correctOption = $question->options->where('is_correct', true)->first();
                    $correctAnswer = $correctOption ? $correctOption->option_text : null;
                    
                    if (isset($resp['answer_text']) && $correctAnswer) {
                        if (strtolower(trim($resp['answer_text'])) === strtolower(trim($correctAnswer))) {
                            $marks = $question->marks;
                            $isCorrect = true;
                        }
                    }
                }

                ExamResponse::updateOrCreate(
                    [
                        'exam_attempt_id' => $attempt->id,
                        'question_id' => $resp['question_id'],
                    ],
                    [
                        'selected_option_id' => $resp['selected_option_id'] ?? null,
                        'theory_answer' => $resp['answer_text'] ?? null,
                        'marks_obtained' => $marks,
                    ]
                );

                $totalScore += $marks;
                
                $feedback[] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question_text,
                    'is_correct' => $isCorrect,
                    'marks_obtained' => $marks,
                    'total_marks' => $question->marks,
                    'correct_answer' => $correctAnswer,
                    'selected_answer' => $question->type === 'fill_in_blank' ? ($resp['answer_text'] ?? 'N/A') : 
                                        (isset($resp['selected_option_id']) ? Option::find($resp['selected_option_id'])->option_text : 'N/A')
                ];
            }

            $attempt->update([
                'submitted_at' => now(),
                'score' => $totalScore,
                'status' => 'submitted',
            ]);
        });

        return response()->json([
            'message' => 'Exam submitted successfully',
            'score' => $totalScore,
            'total_possible' => $attempt->exam->total_marks,
            'feedback' => $feedback
        ]);
    }

    /**
     * Force submit an exam (for auto-submission when timer ends)
     */
    public function forceSubmit(Request $request, $attemptId)
    {
        return $this->submitAttempt($request, $attemptId);
    }

    /**
     * Get results for a specific attempt.
     */
    public function getAttemptResults(Request $request, $id)
    {
        $attempt = ExamAttempt::with(['exam.course', 'responses.question.options'])
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $questions = $attempt->responses->sortByDesc('id')->unique('question_id')->values()->map(function($resp) {
            $question = $resp->question;
            $correctOption = $question->options->where('is_correct', true)->first();
            
            return [
                'id' => $question->id,
                'question_number' => $question->question_number ?? 0,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'marks' => $question->marks,
                'obtained_marks' => $resp->marks_obtained,
                'user_answer' => $question->type === 'objective' ? 
                                ($question->options->where('id', $resp->selected_option_id)->first()->option_text ?? 'Not answered') : 
                                ($resp->theory_answer ?? 'N/A'),
                'correct_answer' => $correctOption ? $correctOption->option_text : null,
                'is_correct' => $resp->marks_obtained >= $question->marks && $question->marks > 0,
            ];
        });

        return response()->json([
            'id' => $attempt->id,
            'title' => $attempt->exam->title,
            'course_code' => $attempt->exam->course_code ?: ($attempt->exam->course->code ?? 'N/A'),
            'total_marks' => $attempt->exam->total_marks,
            'obtained_marks' => $attempt->score,
            'percentage' => ($attempt->exam->total_marks > 0) ? ($attempt->score / $attempt->exam->total_marks) * 100 : 0,
            'grade' => $this->calculateGrade(($attempt->exam->total_marks > 0) ? ($attempt->score / $attempt->exam->total_marks) * 100 : 0),
            'status' => $attempt->score >= $attempt->exam->passing_marks ? 'pass' : 'fail',
            'submitted_at' => $attempt->submitted_at,
            'time_taken' => $attempt->started_at->diffInMinutes($attempt->submitted_at),
            'questions' => $questions
        ]);
    }

    /**
     * Update an exam.
     */
    public function update(Request $request, $id)
    {
        $exam = Exam::where('id', $id)
            ->where('uploaded_by', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'title' => 'required|string|max:255',
            'course_code' => 'required|string|max:50',
            'duration' => 'required|integer|min:1',
            'start_time' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            $exam->update([
                'title' => $request->title,
                'course_code' => $request->course_code,
                'duration' => $request->duration,
                'start_time' => $request->start_time,
                'end_time' => \Carbon\Carbon::parse($request->start_time)->addMinutes($request->duration),
            ]);

            // Optional: Update questions if provided
            if ($request->has('questions')) {
                // For simplicity in this edit, we might just delete and recreate or skip
                // Usually better to have a separate question management API
            }

            DB::commit();
            return response()->json(['message' => 'Exam updated successfully', 'exam' => $exam]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete an exam.
     */
    public function destroy(Request $request, $id)
    {
        $exam = Exam::where('id', $id)
            ->where('uploaded_by', $request->user()->id)
            ->firstOrFail();

        $exam->delete();

        return response()->json(['message' => 'Exam deleted successfully']);
    }

    private function calculateGrade($percentage)
    {
        if ($percentage >= 70) return 'A';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 45) return 'D';
        if ($percentage >= 40) return 'E';
        return 'F';
    }
}


