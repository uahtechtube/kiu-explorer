<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use App\Models\AiMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    /**
     * Handle AI chat queries from students (with history persistence)
     */
    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2|max:5000',
            'ai_conversation_id' => 'nullable|integer|exists:ai_conversations,id',
            'context' => 'nullable|string|max:5000',
            'files' => 'nullable|array',
            'files.*' => 'nullable|string', // Base64 or URL
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
            $files = $request->input('files', []);
            $conversationId = $request->input('ai_conversation_id');

            // 1. Resolve or create conversation thread
            if (!$conversationId) {
                $title = mb_substr($query, 0, 40);
                if (mb_strlen($query) > 40) {
                    $title .= '...';
                }
                $conversation = AiConversation::create([
                    'user_id' => $user->id,
                    'title' => $title ?: 'New AI Chat'
                ]);
                $conversationId = $conversation->id;
            } else {
                $conversation = AiConversation::where('user_id', $user->id)->findOrFail($conversationId);
            }

            // 2. Save user message to database
            $userMessage = AiMessage::create([
                'ai_conversation_id' => $conversationId,
                'sender' => 'user',
                'content' => $query
            ]);

            // 3. Build history context for Gemini (last 10 messages)
            $pastMessages = AiMessage::where('ai_conversation_id', $conversationId)
                ->where('id', '!=', $userMessage->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->reverse();

            $historyContext = "";
            foreach ($pastMessages as $msg) {
                if ($msg->sender === 'user') {
                    $historyContext .= "Student: " . $msg->content . "\n";
                } else {
                    $historyContext .= "AI Assistant: " . $msg->content . "\n";
                }
            }

            if ($context) {
                $historyContext = $context . "\n\nPast conversation:\n" . $historyContext;
            }

            // 4. Request response from Gemini API
            $response = $this->getGeminiResponse($query, $historyContext, $files);

            // 5. Save AI message to database
            AiMessage::create([
                'ai_conversation_id' => $conversationId,
                'sender' => 'ai',
                'content' => $response
            ]);

            // Log the interaction for analytics
            Log::info('AI Assistant Query', [
                'user_id' => $user->id,
                'query_length' => strlen($query),
                'has_files' => count($files) > 0,
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'response' => $response,
                'user_query' => $query,
                'ai_conversation_id' => $conversationId,
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
     * Get all chat conversations of current user
     */
    public function getHistory(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $history = AiConversation::where('user_id', $user->id)
            ->latest()
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    /**
     * Get all messages in a conversation
     */
    public function getConversationMessages(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $conversation = AiConversation::where('user_id', $user->id)->findOrFail($id);
        $messages = $conversation->messages()->oldest()->get();
        
        return response()->json([
            'success' => true,
            'conversation' => $conversation,
            'messages' => $messages
        ]);
    }

    /**
     * Start a new chat conversation session
     */
    public function startConversation(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'title' => 'required|string|max:255'
        ]);
        
        $conversation = AiConversation::create([
            'user_id' => $user->id,
            'title' => $request->title
        ]);
        
        return response()->json([
            'success' => true,
            'conversation' => $conversation
        ], 201);
    }

    /**
     * Delete a conversation thread
     */
    public function destroyConversation(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $conversation = AiConversation::where('user_id', $user->id)->findOrFail($id);
        $conversation->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Chat conversation deleted successfully.'
        ]);
    }

    /**
     * Get study topics
     */
    public function topics(Request $request)
    {
        $topics = [
            [
                'id' => 1,
                'title' => 'Object-Oriented Programming',
                'course' => 'CSC 401',
                'description' => 'Classes, objects, inheritance, and polymorphism.',
                'difficulty' => 'Beginner',
            ],
            [
                'id' => 2,
                'title' => 'Database Normalization',
                'course' => 'CSC 301',
                'description' => '1NF, 2NF, 3NF and BCNF.',
                'difficulty' => 'Intermediate',
            ],
            [
                'id' => 3,
                'title' => 'Tree Data Structures',
                'course' => 'CSC 402',
                'description' => 'Binary trees, BST, and traversal.',
                'difficulty' => 'Advanced',
            ]
        ];

        // Filter by course if provided
        $course = $request->query('course');
        $difficulty = $request->query('difficulty');
        $search = $request->query('search');

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
     * Get Gemini response
     */
    private function getGeminiResponse($query, $context = null, $files = [])
    {
        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            return "⚠️ **AI Configuration Error**: Gemini API key is missing in .env";
        }

        try {
            $parts = [];
            
            // System Prompt
            $systemPrompt = "You are a helpful AI study assistant for university students at Kashim Ibrahim University. Provide clear, educational responses that help students learn. Break down complex topics into understandable explanations. Use examples when helpful. Keep responses concise and focused.";
            
            $prompt = $systemPrompt;
            if ($context) {
                $prompt .= "\n\nContext: " . $context;
            }
            $prompt .= "\n\nUser Question: " . $query;

            $parts[] = ['text' => $prompt];

            // Add files (Multimodal)
            foreach ($files as $fileData) {
                if (empty($fileData)) continue;

                // Handle base64 data URIs
                if (strpos($fileData, 'data:') === 0) {
                    $parts[] = $this->formatBase64ForGemini($fileData);
                }
            }

            $version = config('services.gemini.version', 'v1');
            $model = config('services.gemini.model', 'gemini-1.5-flash');

            $apiUrl = "https://generativelanguage.googleapis.com/{$version}/models/{$model}:generateContent?key={$apiKey}";
            
            $response = Http::timeout(60)->retry(2, 500)
                ->post($apiUrl, [
                    'contents' => [
                        [
                            'parts' => $parts
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 2048,
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiResponse = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                if (empty($aiResponse)) {
                    throw new \Exception('Empty response from Gemini API');
                }

                return trim($aiResponse);
            }

            // Handle errors
            $status = $response->status();
            $body = $response->body();
            
            Log::error('Gemini API Error', [
                'status' => $status,
                'body' => $body,
                'url' => str_replace($apiKey, 'HIDDEN', $apiUrl)
            ]);

            if ($status === 429) {
                return "⚠️ **AI Assistant Quota Exceeded**\n\nThe AI service has reached its usage limit for now. Please try again in a few minutes.";
            }

            if ($status === 404) {
                return "⚠️ **AI Configuration Error**: The selected model or API version was not found. Please check your configuration.";
            }

            throw new \Exception("Gemini API request failed with status {$status}: " . $body);
        } catch (\Exception $e) {
            Log::error('Gemini AI Error: ' . $e->getMessage());
            return $this->getFallbackResponse($query);
        }
    }

    /**
     * Format base64 for Gemini multimodal input
     */
    private function formatBase64ForGemini($dataUri)
    {
        if (preg_match('/^data:([^;]+);base64,(.+)$/', $dataUri, $matches)) {
            return [
                'inlineData' => [
                    'mimeType' => $matches[1],
                    'data' => $matches[2]
                ]
            ];
        }
        return null;
    }

    /**
     * Fallback response
     */
    private function getFallbackResponse($query)
    {
        $query = strtolower($query);
        if (str_contains($query, 'hello') || str_contains($query, 'hi')) {
            return "Hello! I'm your AI Study Assistant. How can I help you today?";
        }
        return "I'm here to help you learn! To give you the best assistance, please be specific about your question. Note: The AI service is currently experiencing connection issues.";
    }
}
