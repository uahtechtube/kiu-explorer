<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Quiz::with('course')->where('is_published', true);

        if ($user->isStudent()) {
            $courseIds = $user->studentProfile->registrations()->pluck('course_id');
            $query->whereIn('course_id', $courseIds);
        } elseif ($user->isLecturer()) {
            $query->where('created_by', $user->id);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'max_attempts' => 'sometimes|integer|min:0',
            'show_answers' => 'sometimes|boolean',
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $quiz = Quiz::create(array_merge(
            $request->except('question_ids'),
            ['created_by' => $request->user()->id]
        ));

        // Attach questions to quiz
        $quiz->questions()->attach($request->question_ids);

        return response()->json(['message' => 'Quiz created successfully.', 'data' => $quiz], 201);
    }

    public function start(Request $request, $id)
    {
        $quiz = Quiz::with('questions.options')->findOrFail($id);
        $user = $request->user();

        // Check attempt limit
        if ($quiz->max_attempts > 0) {
            $attempts = QuizAttempt::where('quiz_id', $id)->where('student_id', $user->id)->count();
            if ($attempts >= $quiz->max_attempts) {
                return response()->json(['message' => 'Maximum attempts reached.'], 403);
            }
        }

        $attempt = QuizAttempt::create([
            'quiz_id' => $id,
            'student_id' => $user->id,
            'started_at' => now(),
            'total_questions' => $quiz->questions->count(),
            'answers' => [],
        ]);

        return response()->json([
            'attempt_id' => $attempt->id,
            'quiz' => $quiz,
            'time_limit' => $quiz->time_limit,
        ]);
    }

    public function submit(Request $request, $attemptId)
    {
        $validator = Validator::make($request->all(), [
            'answers' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $attempt = QuizAttempt::with('quiz.questions.options')->findOrFail($attemptId);

        if ($attempt->completed_at) {
            return response()->json(['message' => 'Quiz already submitted.'], 400);
        }

        $answers = $request->answers;
        $correctCount = 0;

        foreach ($attempt->quiz->questions as $question) {
            $studentAnswer = $answers[$question->id] ?? null;
            $correctOption = $question->options->where('is_correct', true)->first();

            if ($correctOption && $studentAnswer == $correctOption->id) {
                $correctCount++;
            }
        }

        $score = ($correctCount / $attempt->total_questions) * 100;
        $timeTaken = now()->diffInSeconds($attempt->started_at);

        $attempt->update([
            'answers' => $answers,
            'score' => round($score, 2),
            'correct_answers' => $correctCount,
            'completed_at' => now(),
            'time_taken' => $timeTaken,
        ]);

        return response()->json([
            'message' => 'Quiz submitted successfully.',
            'score' => $attempt->score,
            'correct_answers' => $correctCount,
            'total_questions' => $attempt->total_questions,
        ]);
    }

    public function results($attemptId)
    {
        $attempt = QuizAttempt::with('quiz.questions.options')->findOrFail($attemptId);

        if ($attempt->student_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($attempt);
    }

    public function getPracticeData(Request $request)
    {
        try {
            $user = $request->user();
            
            // Check if tables exist to avoid 500 errors if migrations weren't run
            if (!\Schema::hasTable('quizzes')) {
                return response()->json([
                    'categories' => [],
                    'popular' => [],
                    'message' => 'Practice quizzes system is currently being set up.'
                ]);
            }

            // Categories are basically courses that have at least one published quiz
            $categoriesQuery = \App\Models\Course::whereHas('quizzes', function($q) {
                $q->where('is_published', true);
            })->withCount(['quizzes' => function($q) {
                $q->where('is_published', true);
            }]);

            $categories = $categoriesQuery->get()->map(function($course) {
                // Add some UI metadata for the frontend
                $colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
                $icons = ['code', 'database', 'brain', 'calculator', 'globe'];
                
                $questionsCount = 0;
                if (\Schema::hasTable('quiz_questions')) {
                    $questionsCount = $course->quizzes()->withCount('questions')->get()->sum('questions_count');
                }

                return [
                    'id' => $course->id,
                    'name' => $course->title,
                    'description' => $course->code . ' Practice Quizzes',
                    'icon' => $icons[$course->id % count($icons)],
                    'quiz_count' => $course->quizzes_count,
                    'total_questions' => $questionsCount,
                    'color' => $colors[$course->id % count($colors)],
                ];
            });

            $popularQuery = Quiz::where('is_published', true)
                ->with('course');

            if (\Schema::hasTable('quiz_questions')) {
                $popularQuery->withCount('questions');
            }

            $popular = $popularQuery->limit(5)
                ->get()
                ->map(function($quiz) {
                    return [
                        'id' => $quiz->id,
                        'title' => $quiz->title,
                        'category' => $quiz->course->title ?? 'General',
                        'questions_count' => $quiz->questions_count ?? 0,
                        'difficulty' => ['easy', 'medium', 'hard'][rand(0, 2)],
                        'estimated_time' => $quiz->time_limit ?? 15,
                    ];
                });

            return response()->json([
                'categories' => $categories,
                'popular' => $popular
            ]);
        } catch (\Exception $e) {
            \Log::error('Practice Data Error: ' . $e->getMessage());
            return response()->json([
                'categories' => [],
                'popular' => [],
                'error' => 'Database update required. Please run migrations.'
            ], 500);
        }
    }
}
