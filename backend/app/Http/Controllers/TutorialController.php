<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class TutorialController extends Controller
{
    /**
     * List tutorials (optionally filtered by course_id or source_type).
     */
    public function index(Request $request)
    {
        $query = Tutorial::with(['uploader:id,surname,first_name', 'course:id,code,title']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('source_type')) {
            $query->where('source_type', $request->source_type);
        }

        $tutorials = $query->orderBy('created_at', 'desc')->get();

        $tutorials->transform(fn($t) => $this->transformTutorial($t));

        return response()->json([
            'message' => 'Tutorials retrieved successfully',
            'data' => $tutorials
        ]);
    }

    /**
     * Get a specific tutorial by ID.
     */
    public function show($id)
    {
        $tutorial = Tutorial::with(['uploader:id,surname,first_name', 'course:id,code,title'])->find($id);

        if (!$tutorial) {
            return response()->json(['message' => 'Tutorial not found'], 404);
        }

        // Increment views
        $tutorial->increment('views');

        return response()->json([
            'message' => 'Tutorial retrieved successfully',
            'data' => $this->transformTutorial($tutorial)
        ]);
    }

    /**
     * Upload a new file-based tutorial (Lecturer/Admin).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id'   => 'nullable|exists:courses,id',
            'course_code' => 'nullable|string|exists:courses,code',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'file'        => 'nullable|file|max:51200',
            'video_url'   => 'nullable|url',
            'file_type'   => 'nullable|in:video,pdf,audio',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        if (!in_array($user->role, ['admin', 'lecturer'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $courseId = $request->course_id;
        if (!$courseId && $request->course_code) {
            $course = Course::where('code', $request->course_code)->first();
            if ($course) $courseId = $course->id;
        }

        $data = [
            'course_id'   => $courseId,
            'uploaded_by' => $user->id,
            'title'       => $request->title,
            'description' => $request->description,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $file->store('tutorials', 'public');
            $data['file_type'] = $request->file_type ?? 'video';
            $data['mime_type'] = $file->getClientMimeType();
            $data['file_size'] = $file->getSize();
            $data['source_type'] = 'file';
        } elseif ($request->video_url) {
            $data['file_path'] = $request->video_url;
            $data['file_type'] = 'video';
            $data['source_type'] = 'link';
        } else {
            return response()->json(['message' => 'No file or video URL provided.'], 422);
        }

        $tutorial = Tutorial::create($data);

        return response()->json([
            'message'  => 'Tutorial uploaded successfully',
            'tutorial' => $this->transformTutorial($tutorial),
        ], 201);
    }

    /**
     * Save a YouTube video as a tutorial (Student or Lecturer).
     */
    public function saveYoutube(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'youtube_video_id' => 'required|string|max:20',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'course_id'        => 'nullable|exists:courses,id',
            'course_code'      => 'nullable|string|exists:courses,code',
            'channel_title'    => 'nullable|string|max:255',
            'thumbnail_url'    => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();

        $courseId = $request->course_id;
        if (!$courseId && $request->course_code) {
            $course = Course::where('code', $request->course_code)->first();
            if ($course) $courseId = $course->id;
        }

        // Check if this video already saved by the same user for the same course
        $existing = Tutorial::where('youtube_video_id', $request->youtube_video_id)
            ->where('uploaded_by', $user->id)
            ->when($courseId, fn($q) => $q->where('course_id', $courseId))
            ->first();

        if ($existing) {
            return response()->json([
                'message'  => 'Video already saved',
                'tutorial' => $this->transformTutorial($existing),
            ]);
        }

        $tutorial = Tutorial::create([
            'course_id'        => $courseId,
            'uploaded_by'      => $user->id,
            'title'            => $request->title,
            'description'      => $request->description ?? $request->channel_title,
            'youtube_video_id' => $request->youtube_video_id,
            'source_type'      => 'youtube',
            'file_type'        => 'youtube',
        ]);

        return response()->json([
            'message'  => 'YouTube tutorial saved successfully',
            'tutorial' => $this->transformTutorial($tutorial->load(['uploader:id,surname,first_name', 'course:id,code,title'])),
        ], 201);
    }

    /**
     * Proxy search to YouTube Data API v3.
     */
    public function youtubeSearch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q'          => 'required|string|min:2|max:100',
            'max_results'=> 'nullable|integer|min:1|max:25',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $apiKey = config('services.youtube.key');

        if (!$apiKey) {
            return response()->json(['message' => 'YouTube API not configured.'], 500);
        }

        $maxResults = $request->input('max_results', 10);

        try {
            // Step 1: Search for videos
            $searchResponse = Http::get('https://www.googleapis.com/youtube/v3/search', [
                'key'        => $apiKey,
                'q'          => $request->q,
                'part'       => 'snippet',
                'type'       => 'video',
                'maxResults' => $maxResults,
                'safeSearch' => 'moderate',
                'relevanceLanguage' => 'en',
            ]);

            if (!$searchResponse->successful()) {
                $error = $searchResponse->json()['error']['message'] ?? 'YouTube API error';
                return response()->json(['message' => $error], $searchResponse->status());
            }

            $items = $searchResponse->json()['items'] ?? [];

            if (empty($items)) {
                return response()->json(['data' => [], 'message' => 'No results found']);
            }

            // Step 2: Get video durations via videos.list
            $videoIds = collect($items)->pluck('id.videoId')->filter()->implode(',');

            $detailsResponse = Http::get('https://www.googleapis.com/youtube/v3/videos', [
                'key'  => $apiKey,
                'id'   => $videoIds,
                'part' => 'contentDetails,statistics',
            ]);

            $durations = [];
            $viewCounts = [];
            if ($detailsResponse->successful()) {
                foreach ($detailsResponse->json()['items'] ?? [] as $det) {
                    $durations[$det['id']]   = $this->parseDuration($det['contentDetails']['duration'] ?? 'PT0S');
                    $viewCounts[$det['id']]  = number_format($det['statistics']['viewCount'] ?? 0);
                }
            }

            // Format response
            $results = collect($items)->map(function ($item) use ($durations, $viewCounts) {
                $videoId = $item['id']['videoId'] ?? null;
                $snippet = $item['snippet'] ?? [];

                return [
                    'videoId'      => $videoId,
                    'title'        => $snippet['title'] ?? 'Unknown',
                    'channelTitle' => $snippet['channelTitle'] ?? '',
                    'description'  => substr($snippet['description'] ?? '', 0, 200),
                    'publishedAt'  => $snippet['publishedAt'] ?? null,
                    'thumbnail'    => $snippet['thumbnails']['high']['url']
                        ?? $snippet['thumbnails']['medium']['url']
                        ?? $snippet['thumbnails']['default']['url']
                        ?? "https://img.youtube.com/vi/{$videoId}/mqdefault.jpg",
                    'duration'     => $durations[$videoId] ?? '0:00',
                    'views'        => $viewCounts[$videoId] ?? '0',
                ];
            })->filter(fn($i) => $i['videoId'] !== null)->values();

            return response()->json([
                'message' => 'Search results retrieved',
                'data'    => $results,
                'query'   => $request->q,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to search YouTube: ' . $e->getMessage()], 500);
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private function transformTutorial($tutorial)
    {
        $isYoutube = $tutorial->source_type === 'youtube';

        $tutorial->url = $isYoutube
            ? "https://www.youtube.com/watch?v={$tutorial->youtube_video_id}"
            : asset('storage/' . $tutorial->file_path);

        $tutorial->thumbnail = $isYoutube
            ? "https://img.youtube.com/vi/{$tutorial->youtube_video_id}/mqdefault.jpg"
            : null;

        $tutorial->category = $tutorial->course ? $tutorial->course->code : 'General';
        $tutorial->duration  = $isYoutube ? ($tutorial->duration ?? '—') : $this->calculateDuration($tutorial);
        $tutorial->views     = $tutorial->views ?? '0';
        $tutorial->lecturer  = [
            'name' => $tutorial->uploader
                ? $tutorial->uploader->first_name . ' ' . $tutorial->uploader->surname
                : 'Academic Coach',
        ];

        return $tutorial;
    }

    private function calculateDuration($tutorial)
    {
        if ($tutorial->file_type === 'video') return '15:30';
        if ($tutorial->file_type === 'audio') return '12:45';
        return '10:00';
    }

    /**
     * Convert ISO 8601 duration (PT4M30S) to human-readable (4:30).
     */
    private function parseDuration(string $iso): string
    {
        preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $iso, $m);
        $h = (int)($m[1] ?? 0);
        $m2 = (int)($m[2] ?? 0);
        $s = (int)($m[3] ?? 0);

        if ($h > 0) {
            return sprintf('%d:%02d:%02d', $h, $m2, $s);
        }
        return sprintf('%d:%02d', $m2, $s);
    }
}
