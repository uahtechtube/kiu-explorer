<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    /**
     * Handle AI chat queries from students
     */
    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2|max:2000',
            'context' => 'nullable|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Authorization: Only students can access the AI Study Assistant
        if ($user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'AI Study Assistant is currently only available for students.'
            ], 403);
        }

        try {
            $query = $request->input('query');
            $context = $request->input('context');

            $response = $this->getAIResponse($query, $context);

            // Log the interaction for analytics
            Log::info('AI Assistant Query', [
                'user_id' => $user->id,
                'query_length' => strlen($query),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'response' => $response, // Matches frontend's response.data.response
                'user_query' => $query,
                'timestamp' => now()->toIso8601String()
            ]);
        } catch (\Exception $e) {
            Log::error('AI Assistant Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'AI service temporarily unavailable. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get study topics
     */
    public function topics(Request $request)
    {
        // Filter by course if provided
        $course = $request->query('course');
        $difficulty = $request->query('difficulty');
        $search = $request->query('search');

        // Mock topics data - in production, this would come from a database
        $topics = $this->getStudyTopics();

        // Apply filters
        if ($course) {
            $topics = array_filter($topics, function($topic) use ($course) {
                return stripos($topic['course'], $course) !== false;
            });
        }

        if ($difficulty) {
            $topics = array_filter($topics, function($topic) use ($difficulty) {
                return $topic['difficulty'] === $difficulty;
            });
        }

        if ($search) {
            $topics = array_filter($topics, function($topic) use ($search) {
                return stripos($topic['title'], $search) !== false || 
                       stripos($topic['description'], $search) !== false;
            });
        }

        return response()->json([
            'success' => true,
            'data' => array_values($topics)
        ]);
    }

    /**
     * Get AI response using OpenRouter API
     */
    private function getAIResponse($query, $context = null)
    {
        $apiKey = env('OPENROUTER_API_KEY');
        $model = env('OPENROUTER_MODEL', 'google/gemma-3n-e2b-it:free');

        if (!$apiKey) {
            return "⚠️ **AI Configuration Error**: OpenRouter API key is missing in .env";
        }

        try {
            // Build the messages array for OpenRouter
            $systemPrompt = "You are a helpful AI study assistant for university students at Kashim Ibrahim University. Provide clear, educational responses that help students learn. Break down complex topics into understandable explanations. Use examples when helpful. Keep responses concise and focused.";
            
            $messages = [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ]
            ];

            if ($context) {
                $messages[] = [
                    'role' => 'user',
                    'content' => "Context: " . $context
                ];
            }

            $messages[] = [
                'role' => 'user',
                'content' => $query
            ];

            // Call OpenRouter API (OpenAI-compatible endpoint)
        // Note: Some parameters like temperature/max_tokens may not be supported by all models
        $response = Http::timeout(60)->retry(3, 100)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'HTTP-Referer' => env('APP_URL', 'http://localhost'),
                'X-Title' => 'KIU Explorer AI Assistant',
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiResponse = $data['choices'][0]['message']['content'] ?? '';
                
                if (empty($aiResponse)) {
                    throw new \Exception('Empty response from OpenRouter API');
                }

                return trim($aiResponse);
            }

            // Handle quota exceeded error specifically
            if ($response->status() === 429) {
                Log::warning('OpenRouter API quota exceeded');
                return "⚠️ **AI Assistant Temporarily Unavailable**\n\nThe AI service has reached its usage limit for now.\n\nIn the meantime, I can still help with:\n• General study tips\n• Course information\n• Campus resources\n\nPlease try again later or contact your administrator to check the AI service plan.";
            }

            // Log full error for debugging
            Log::error('OpenRouter API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'model' => $model,
            ]);

            throw new \Exception('OpenRouter API request failed: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('OpenRouter AI Error: ' . $e->getMessage());
            return $this->getFallbackResponse($query);
        }
    }

    /**
     * Fallback response when OpenAI is not available
     */
    private function getFallbackResponse($query)
    {
        // Simple keyword-based responses
        $query = strtolower($query);

        if (str_contains($query, 'hello') || str_contains($query, 'hi')) {
            return "Hello! I'm your AI Study Assistant. How can I help you with your studies today?";
        }

        if (str_contains($query, 'exam') || str_contains($query, 'test')) {
            return "For exam preparation, I recommend:\n1. Review your course materials regularly\n2. Practice past questions\n3. Create summary notes\n4. Study in focused sessions\n5. Get adequate rest before the exam\n\nWhat specific topic would you like help with?";
        }

        if (str_contains($query, 'assignment') || str_contains($query, 'homework')) {
            return "I can help you understand concepts for your assignment. Please share:\n1. The specific topic or question\n2. What you've tried so far\n3. Where you're stuck\n\nRemember, I'm here to guide your learning, not do the work for you!";
        }

        if (str_contains($query, 'programming') || str_contains($query, 'code')) {
            return "For programming help:\n1. Break down the problem into smaller steps\n2. Write pseudocode first\n3. Test your code incrementally\n4. Use debugging tools\n5. Read error messages carefully\n\nWhat programming concept do you need help with?";
        }

        // Generic response
        return "I'm here to help you learn! To give you the best assistance, please:\n\n1. Be specific about your question\n2. Mention the subject or topic\n3. Share what you already understand\n4. Ask about concepts you find challenging\n\nNote: The AI service is currently experiencing connection issues or is not fully configured. Please ensure your internet connection is stable and the OPENROUTER_API_KEY is valid.";
    }

    /**
     * Get study topics (mock data - replace with database in production)
     */
    private function getStudyTopics()
    {
        return [
            [
                'id' => 1,
                'title' => 'Object-Oriented Programming Basics',
                'course' => 'CSC 401',
                'description' => 'Learn the fundamentals of OOP including classes, objects, inheritance, and polymorphism.',
                'difficulty' => 'Beginner',
                'estimated_time' => '30 mins'
            ],
            [
                'id' => 2,
                'title' => 'Database Normalization',
                'course' => 'CSC 301',
                'description' => 'Understanding 1NF, 2NF, 3NF, and BCNF with practical examples.',
                'difficulty' => 'Intermediate',
                'estimated_time' => '45 mins'
            ],
            [
                'id' => 3,
                'title' => 'Linear Algebra: Matrices',
                'course' => 'MTH 201',
                'description' => 'Matrix operations, determinants, and solving systems of equations.',
                'difficulty' => 'Intermediate',
                'estimated_time' => '60 mins'
            ],
            [
                'id' => 4,
                'title' => 'Data Structures: Trees',
                'course' => 'CSC 402',
                'description' => 'Binary trees, BST, AVL trees, and tree traversal algorithms.',
                'difficulty' => 'Advanced',
                'estimated_time' => '90 mins'
            ],
            [
                'id' => 5,
                'title' => 'Web Development: REST APIs',
                'course' => 'CSC 401',
                'description' => 'Building RESTful APIs with proper HTTP methods and status codes.',
                'difficulty' => 'Intermediate',
                'estimated_time' => '45 mins'
            ],
        ];
    }
}
