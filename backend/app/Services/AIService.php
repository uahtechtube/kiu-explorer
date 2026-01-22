<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Tutorial;
use App\Models\Event;
use App\Models\Exam;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AIService
{
    /**
     * Enhanced AI Brain with web search, resource recommendation, and summarization.
     */
    public function getStudyHelp(User $user, string $query)
    {
        $originalQuery = $query;
        $query = strtolower(trim($query));
        $context = $this->getAcademicContext($user);

        // 1. Check if user wants a summary
        if ($this->isQueryAbout($query, ['summarize', 'summary', 'tldr'])) {
            return $this->handleSummaryRequest($user, $originalQuery, $context);
        }

        // 2. Search for relevant resources in our database
        $resources = $this->findRelevantResources($user, $originalQuery);

        // 3. Get web search results for additional context
        $webInfo = $this->searchWeb($originalQuery);

        // 4. Generate comprehensive response
        return $this->generateEnhancedResponse($user, $originalQuery, $context, $resources, $webInfo);
    }

    /**
     * Find relevant tutorials/resources based on query keywords.
     */
    private function findRelevantResources(User $user, string $query)
    {
        $keywords = $this->extractKeywords($query);
        
        $tutorials = Tutorial::whereIn('course_id', $user->registeredCourses->pluck('id'))
            ->where(function($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $q->orWhere('title', 'LIKE', "%{$keyword}%")
                      ->orWhere('description', 'LIKE', "%{$keyword}%");
                }
            })
            ->with('course')
            ->get();

        return [
            'videos' => $tutorials->where('type', 'video'),
            'pdfs' => $tutorials->where('type', 'pdf'),
            'all' => $tutorials
        ];
    }

    /**
     * Extract meaningful keywords from query.
     */
    private function extractKeywords(string $query)
    {
        $stopWords = ['what', 'is', 'the', 'a', 'an', 'how', 'can', 'you', 'me', 'about', 'explain', 'tell', 'summarize'];
        $words = explode(' ', strtolower($query));
        
        return array_filter($words, function($word) use ($stopWords) {
            return strlen($word) > 3 && !in_array($word, $stopWords);
        });
    }

    /**
     * Search the web for information (using DuckDuckGo Instant Answer API).
     */
    private function searchWeb(string $query)
    {
        try {
            // Using DuckDuckGo Instant Answer API (free, no key required)
            $response = Http::timeout(5)->get('https://api.duckduckgo.com/', [
                'q' => $query,
                'format' => 'json',
                'no_html' => 1,
                'skip_disambig' => 1
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'abstract' => $data['Abstract'] ?? '',
                    'definition' => $data['Definition'] ?? '',
                    'answer' => $data['Answer'] ?? '',
                    'url' => $data['AbstractURL'] ?? ''
                ];
            }
        } catch (\Exception $e) {
            // Fallback if web search fails
        }

        return null;
    }

    /**
     * Handle summary requests for specific resources.
     */
    private function handleSummaryRequest(User $user, string $query, $context)
    {
        // Extract what they want summarized
        $resources = $this->findRelevantResources($user, $query);
        
        if ($resources['all']->isEmpty()) {
            return "I couldn't find any materials matching your request. Could you be more specific about which course or topic you'd like summarized?";
        }

        $tutorial = $resources['all']->first();
        $summary = "📚 **Summary of '{$tutorial->title}'**\n\n";
        $summary .= "**Course**: {$tutorial->course->course_code} - {$tutorial->course->title}\n";
        $summary .= "**Type**: " . strtoupper($tutorial->type) . "\n";
        
        if ($tutorial->description) {
            $summary .= "**Overview**: {$tutorial->description}\n\n";
        }
        
        $summary .= "This material covers key concepts for your {$tutorial->course->course_code} course. ";
        $summary .= "I recommend reviewing this thoroughly before your next class or exam.";

        return $summary;
    }

    /**
     * Generate comprehensive response with resources and web info.
     */
    private function generateEnhancedResponse(User $user, string $query, $context, $resources, $webInfo)
    {
        $response = "**KIU AI Assistant Response**\n\n";

        // 1. Web-based answer (if available)
        if ($webInfo && !empty($webInfo['abstract'])) {
            $response .= "📖 **General Information**:\n";
            $response .= substr($webInfo['abstract'], 0, 300) . "...\n\n";
            if ($webInfo['url']) {
                $response .= "🔗 Learn more: {$webInfo['url']}\n\n";
            }
        } elseif ($webInfo && !empty($webInfo['answer'])) {
            $response .= "💡 **Quick Answer**: {$webInfo['answer']}\n\n";
        }

        // 2. Recommend videos from our app
        if ($resources['videos']->isNotEmpty()) {
            $response .= "🎥 **Recommended Videos from Your Courses**:\n";
            foreach ($resources['videos']->take(3) as $video) {
                $response .= "• **{$video->title}** ({$video->course->course_code})\n";
                if ($video->description) {
                    $response .= "  _{$video->description}_\n";
                }
            }
            $response .= "\n";
        }

        // 3. Recommend PDFs and other resources
        if ($resources['pdfs']->isNotEmpty()) {
            $response .= "📄 **Related Study Materials**:\n";
            foreach ($resources['pdfs']->take(3) as $pdf) {
                $response .= "• **{$pdf->title}** ({$pdf->course->course_code})\n";
            }
            $response .= "\n";
        }

        // 4. Fallback if no resources found
        if ($resources['all']->isEmpty() && !$webInfo) {
            $response .= "I searched our database and the web, but couldn't find specific resources matching your query. ";
            $response .= "Try asking about specific topics from your courses: " . $context['courses']->pluck('course_code')->implode(', ');
        }

        $response .= "\n💬 **Need more help?** Ask me to summarize any material or explain a specific concept!";

        return $response;
    }

    private function isQueryAbout(string $query, array $keywords)
    {
        foreach ($keywords as $word) {
            if (str_contains($query, $word)) return true;
        }
        return false;
    }

    private function getAcademicContext(User $user)
    {
        return [
            'courses' => $user->registeredCourses,
            'recent_tutorials' => Tutorial::whereIn('course_id', $user->registeredCourses->pluck('id'))->latest()->limit(5)->get(),
            'upcoming_events' => Event::where('status', 'upcoming')->limit(2)->get(),
            'pending_exams' => Exam::whereIn('course_id', $user->registeredCourses->pluck('id'))->where('published', true)->limit(2)->get(),
        ];
    }
}
