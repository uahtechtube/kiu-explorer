<?php

namespace App\Http\Controllers;

use App\Models\AcademicEvent;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    /**
     * Get academic calendar events
     */
    public function calendar(Request $request)
    {
        $query = AcademicEvent::query();

        // Filter by month if provided
        if ($request->has('month')) {
            $month = $request->month;
            $query->whereMonth('start_date', $month)
                  ->orWhereMonth('end_date', $month);
        }

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $events = $query->orderBy('start_date', 'asc')->get();

        return response()->json(['data' => $events]);
    }

    /**
     * Get staff directory
     */
    public function staff(Request $request)
    {
        $query = \App\Models\User::where('role', 'lecturer')
            ->orWhere('role', 'admin')
            ->with('department');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('surname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $staff = $query->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->surname,
                'role' => ucfirst($user->role),
                'department' => $user->department ? $user->department->name : 'Administration',
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'image_url' => $user->profile_picture 
                    ? url('storage/' . $user->profile_picture) 
                    : 'https://i.pravatar.cc/150?u=' . $user->email,
            ];
        });

        return response()->json(['data' => $staff]);
    }

    /**
     * Get campus map locations
     */
    public function mapLocations(Request $request)
    {
        // Static campus locations data
        $locations = [
            [
                'id' => 1,
                'name' => 'Faculty of Science',
                'type' => 'Faculties',
                'coords' => 'Block A, East Wing',
                'description' => 'Home to the departments of Computer Science, Biotech, and Physics.',
                'latitude' => null,
                'longitude' => null,
            ],
            [
                'id' => 2,
                'name' => 'Main Auditorium',
                'type' => 'Lecture Halls',
                'coords' => 'Central Campus',
                'description' => 'A 2,500 capacity hall for major events and joint lectures.',
                'latitude' => null,
                'longitude' => null,
            ],
            [
                'id' => 3,
                'name' => 'E-Library Complex',
                'type' => 'Library',
                'coords' => 'Academic Center',
                'description' => 'State-of-the-art digital library with 24/7 access for students.',
                'latitude' => null,
                'longitude' => null,
            ],
            [
                'id' => 4,
                'name' => 'Kashim Ibrahim Hall',
                'type' => 'Hostels',
                'coords' => 'South Campus',
                'description' => 'Premier male hostel with modern amenities.',
                'latitude' => null,
                'longitude' => null,
            ],
            [
                'id' => 5,
                'name' => 'ICT Innovation Lab',
                'type' => 'Labs',
                'coords' => 'Block C, Ground Floor',
                'description' => 'Cutting edge facility for software development and AI research.',
                'latitude' => null,
                'longitude' => null,
            ],
            [
                'id' => 6,
                'name' => 'Faculty of Arts',
                'type' => 'Faculties',
                'coords' => 'Block B, West Wing',
                'description' => 'Departments of Languages, History, and Philosophy.',
                'latitude' => null,
                'longitude' => null,
            ],
            [
                'id' => 7,
                'name' => 'Sports Complex',
                'type' => 'Sports',
                'coords' => 'North Campus',
                'description' => 'Olympic-standard facilities for athletics, football, and basketball.',
                'latitude' => null,
                'longitude' => null,
            ],
        ];

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'All') {
            $locations = array_filter($locations, function($loc) use ($request) {
                return $loc['type'] === $request->category;
            });
        }

        // Search functionality
        if ($request->has('search')) {
            $search = strtolower($request->search);
            $locations = array_filter($locations, function($loc) use ($search) {
                return str_contains(strtolower($loc['name']), $search) ||
                       str_contains(strtolower($loc['description']), $search);
            });
        }

        return response()->json(['data' => array_values($locations)]);
    }
}
