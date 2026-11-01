<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

echo "=== Gemini AI Assistant Configuration Check ===\n\n";

// Check environment variables through services config
$apiKey = config('services.gemini.key');
$version = config('services.gemini.version', 'v1');
$model = config('services.gemini.model', 'gemini-1.5-flash');

echo "1. Configuration Status:\n";
echo "   API Key: " . ($apiKey ? "✅ Set (length: " . strlen($apiKey) . ")" : "❌ Missing") . "\n";
echo "   API Version: $version\n";
echo "   Model: $model\n\n";

if (!$apiKey) {
    echo "❌ ERROR: GEMINI_API_KEY is not set in .env file\n";
    echo "\nTo fix this:\n";
    echo "1. Add to .env: GEMINI_API_KEY=your_key_here\n";
    echo "2. Optionally set model: GEMINI_MODEL=gemini-2.5-flash\n";
    echo "3. Optionally set version: GEMINI_API_VERSION=v1beta\n";
    exit(1);
}

echo "2. Testing Gemini API Connection...\n";

try {
    $apiUrl = "https://generativelanguage.googleapis.com/{$version}/models/{$model}:generateContent?key={$apiKey}";
    
    $response = Http::timeout(30)
        ->post($apiUrl, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => 'Say "Hello from KIU Explorer!" in one sentence.']
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 100,
            ]
        ]);

    if ($response->successful()) {
        $data = $response->json();
        $aiResponse = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        echo "   ✅ API Connection Successful!\n";
        echo "   Response: " . trim($aiResponse) . "\n\n";
        
        echo "✅ Gemini AI Assistant is fully configured and working!\n";
        
    } else {
        $status = $response->status();
        $body = $response->body();
        
        echo "   ❌ API Request Failed\n";
        echo "   Status Code: $status\n";
        echo "   Response: $body\n\n";
        
        if ($status === 429) {
            echo "⚠️  Quota exceeded - You've reached the API usage limit.\n";
        } elseif ($status === 400) {
            echo "❌ Authentication failed or Invalid Request - Please check your GEMINI_API_KEY in .env\n";
        } elseif ($status === 404) {
            echo "❌ Model or version not found - Please check GEMINI_MODEL and GEMINI_API_VERSION in .env\n";
        } else {
            echo "❌ Unknown error occurred.\n";
        }
    }
    
} catch (\Exception $e) {
    echo "   ❌ Connection Error: " . $e->getMessage() . "\n\n";
    echo "Possible issues:\n";
    echo "- No internet connection\n";
    echo "- Firewall blocking the request\n";
    echo "- Gemini API is down\n";
}

echo "\n=== Test Complete ===\n";
