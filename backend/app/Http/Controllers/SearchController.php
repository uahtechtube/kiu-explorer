&lt;?php

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
        $query = $request-&gt;input('q', '');
        
        if (empty($query)) {
            return response()-&gt;json([
                'success' =&gt; true,
                'data' =&gt; []
            ]);
        }

        $results = [];

        // Search Courses
        $courses = Course::where('title', 'LIKE', "%{$query}%")
            -&gt;orWhere('code', 'LIKE', "%{$query}%")
            -&gt;limit(5)
            -&gt;get();

        foreach ($courses as $course) {
            $results[] = [
                'id' =&gt; $course-&gt;id,
                'type' =&gt; 'Course',
                'title' =&gt; $course-&gt;title,
                'subtitle' =&gt; $course-&gt;code . ' • ' . ($course-&gt;lecturer-&gt;name ?? 'No Lecturer'),
                'link' =&gt; '/classes'
            ];
        }

        // Search Events
        $events = Event::where('title', 'LIKE', "%{$query}%")
            -&gt;orWhere('description', 'LIKE', "%{$query}%")
            -&gt;where('start_date', '&gt;=', now())
            -&gt;limit(5)
            -&gt;get();

        foreach ($events as $event) {
            $results[] = [
                'id' =&gt; $event-&gt;id,
                'type' =&gt; 'Event',
                'title' =&gt; $event-&gt;title,
                'subtitle' =&gt; $event-&gt;start_date-&gt;format('M d') . ' • ' . $event-&gt;location . ' • ' . $event-&gt;start_date-&gt;format('g:i A'),
                'link' =&gt; '/events/' . $event-&gt;id
            ];
        }

        // Search Associations
        $associations = Association::where('name', 'LIKE', "%{$query}%")
            -&gt;orWhere('description', 'LIKE', "%{$query}%")
            -&gt;limit(5)
            -&gt;get();

        foreach ($associations as $assoc) {
            $memberCount = $assoc-&gt;members()-&gt;count();
            $results[] = [
                'id' =&gt; $assoc-&gt;id,
                'type' =&gt; 'Association',
                'title' =&gt; $assoc-&gt;name,
                'subtitle' =&gt; $assoc-&gt;description . ' • ' . $memberCount . ' members',
                'link' =&gt; '/associations/' . $assoc-&gt;id
            ];
        }

        // Search Library Materials
        if (DB::getSchemaBuilder()-&gt;hasTable('library_resources')) {
            $materials = LibraryResource::where('title', 'LIKE', "%{$query}%")
                -&gt;orWhere('description', 'LIKE', "%{$query}%")
                -&gt;where('is_approved', true)
                -&gt;limit(5)
                -&gt;get();

            foreach ($materials as $material) {
                $fileSize = $this-&gt;formatBytes($material-&gt;file_size ?? 0);
                $results[] = [
                    'id' =&gt; $material-&gt;id,
                    'type' =&gt; 'Material',
                    'title' =&gt; $material-&gt;title,
                    'subtitle' =&gt; strtoupper($material-&gt;file_type ?? 'PDF') . ' • ' . $fileSize . ' • Updated ' . $material-&gt;updated_at-&gt;format('Y'),
                    'link' =&gt; '/library'
                ];
            }
        }

        // Search Staff (Lecturers)
        $staff = User::where('role', 'lecturer')
            -&gt;where(function($q) use ($query) {
                $q-&gt;where('name', 'LIKE', "%{$query}%")
                  -&gt;orWhere('email', 'LIKE', "%{$query}%");
            })
            -&gt;limit(5)
            -&gt;get();

        foreach ($staff as $lecturer) {
            $results[] = [
                'id' =&gt; $lecturer-&gt;id,
                'type' =&gt; 'Staff',
                'title' =&gt; $lecturer-&gt;name,
                'subtitle' =&gt; 'Lecturer • ' . $lecturer-&gt;email,
                'link' =&gt; '/school/staff'
            ];
        }

        return response()-&gt;json([
            'success' =&gt; true,
            'data' =&gt; $results,
            'total' =&gt; count($results)
        ]);
    }

    /**
     * Format bytes to human readable
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes &gt; 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
