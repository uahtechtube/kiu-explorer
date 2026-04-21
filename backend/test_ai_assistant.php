<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

echo "=== AI Assistant Configuration Check ===\n\n";

// Check environment variables
$apiKey = env('OPENROUTER_API_KEY');
$model = env('OPENROUTER_MODEL', 'google/gemma-3n-e2b-it:free');
$appUrl = env('APP_URL', 'http://localhost');

echo "1. Configuration Status:\n";
echo "   API Key: " . ($apiKey ? "✅ Set (length: " . strlen($apiKey) . ")" : "❌ Missing") . "\n";
echo "   Model: $model\n";
echo "   App URL: $appUrl\n\n";

if (!$apiKey) {
    echo "❌ ERROR: OPENROUTER_API_KEY is not set in .env file\n";
    echo "\nTo fix this:\n";
    echo "1. Get an API key from https://openrouter.ai/\n";
    echo "2. Add to .env: OPENROUTER_API_KEY=your_key_here\n";
    echo "3. Optionally set model: OPENROUTER_MODEL=google/gemma-3n-e2b-it:free\n";
    exit(1);
}

echo "2. Testing API Connection...\n";

try {
    $response = Http::timeout(30)
        ->withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'HTTP-Referer' => $appUrl,
            'X-Title' => 'KIU Explorer AI Assistant Test',
        ])
        ->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful AI assistant.'
                ],
                [
                    'role' => 'user',
                    'content' => 'Say "Hello from KIU Explorer!" in one sentence.'
                ]
            ],
        ]);

    if ($response->successful()) {
        $data = $response->json();
        $aiResponse = $data['choices'][0]['message']['content'] ?? '';
        
        echo "   ✅ API Connection Successful!\n";
        echo "   Response: $aiResponse\n\n";
        
        echo "3. API Details:\n";
        echo "   Model Used: " . ($data['model'] ?? 'N/A') . "\n";
        echo "   Tokens Used: " . ($data['usage']['total_tokens'] ?? 'N/A') . "\n\n";
        
        echo "✅ AI Assistant is fully configured and working!\n";
        echo "\nYou can now use the AI Assistant in the app.\n";
        
    } else {
        $status = $response->status();
        $body = $response->body();
        
        echo "   ❌ API Request Failed\n";
        echo "   Status Code: $status\n";
        echo "   Response: $body\n\n";
        
        if ($status === 429) {
            echo "⚠️  Quota exceeded - You've reached the API usage limit.\n";
            echo "   Check your OpenRouter dashboard for usage details.\n";
        } elseif ($status === 401) {
            echo "❌ Authentication failed - Invalid API key.\n";
            echo "   Please check your OPENROUTER_API_KEY in .env\n";
        } else {
            echo "❌ Unknown error occurred.\n";
        }
    }
    
} catch (\Exception $e) {
    echo "   ❌ Connection Error: " . $e->getMessage() . "\n\n";
    echo "Possible issues:\n";
    echo "- No internet connection\n";
    echo "- Firewall blocking the request\n";
    echo "- OpenRouter API is down\n";
}

echo "\n=== Test Complete ===\n";
