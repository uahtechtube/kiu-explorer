<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Event;
use App\Models\Association;
use App\Models\LibraryResource;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Global search across multiple entities
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $results = [];

        // Search Courses
        $courses = Course::where('title', 'LIKE', "%{$query}%")
            ->orWhere('code', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($courses as $course) {
            $results[] = [
                'id' => $course->id,
                'type' => 'Course',
                'title' => $course->title,
                'subtitle' => $course->code . ' • ' . ($course->lecturer->name ?? 'No Lecturer'),
                'link' => '/classes'
            ];
        }

        // Search Events
        $events = Event::where('title', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->where('start_time', '>=', now())
            ->limit(5)
            ->get();

        foreach ($events as $event) {
            $results[] = [
                'id' => $event->id,
                'type' => 'Event',
                'title' => $event->title,
                'subtitle' => $event->start_time->format('M d') . ' • ' . $event->venue . ' • ' . $event->start_time->format('g:i A'),
                'link' => '/events/' . $event->id
            ];
        }

        // Search Associations
        $associations = Association::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($associations as $assoc) {
            $memberCount = $assoc->members()->count();
            $results[] = [
                'id' => $assoc->id,
                'type' => 'Association',
                'title' => $assoc->name,
                'subtitle' => $assoc->description . ' • ' . $memberCount . ' members',
                'link' => '/associations/' . $assoc->id
            ];
        }

        // Search Library Materials
        if (DB::getSchemaBuilder()->hasTable('library_resources')) {
            $materials = LibraryResource::where('title', 'LIKE', "%{$query}%")
                ->orWhere('description', 'LIKE', "%{$query}%")
                ->where('is_approved', true)
                ->limit(5)
                ->get();

            foreach ($materials as $material) {
                $fileSize = $this->formatBytes($material->file_size ?? 0);
                $results[] = [
                    'id' => $material->id,
                    'type' => 'Material',
                    'title' => $material->title,
                    'subtitle' => strtoupper($material->file_type ?? 'PDF') . ' • ' . $fileSize . ' • Updated ' . $material->updated_at->format('Y'),
                    'link' => '/library'
                ];
            }
        }

        // Search Staff (Lecturers)
        $staff = User::where('role', 'lecturer')
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get();

        foreach ($staff as $lecturer) {
            $results[] = [
                'id' => $lecturer->id,
                'type' => 'Staff',
                'title' => $lecturer->name,
                'subtitle' => 'Lecturer • ' . $lecturer->email,
                'link' => '/school/staff'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $results,
            'total' => count($results)
        ]);
    }

    /**
     * Format bytes to human readable
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
