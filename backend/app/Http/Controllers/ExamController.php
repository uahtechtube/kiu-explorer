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

                ExamResponse::create([
                    'exam_attempt_id' => $attempt->id,
                    'question_id' => $resp['question_id'],
                    'selected_option_id' => $resp['selected_option_id'] ?? null,
                    'theory_answer' => $resp['answer_text'] ?? null,
                    'marks_obtained' => $marks,
                ]);

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

        $questions = $attempt->responses->map(function($resp) {
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
                                ($question->options->find($resp->selected_option_id)->option_text ?? 'N/A') : 
                                ($resp->theory_answer ?? 'N/A'),
                'correct_answer' => $correctOption ? $correctOption->option_text : null,
                'is_correct' => $resp->marks_obtained >= $question->marks && $question->marks > 0,
            ];
        });

        return response()->json([
            'id' => $attempt->id,
            'title' => $attempt->exam->title,
            'course_code' => $attempt->exam->course->code ?? 'N/A',
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


