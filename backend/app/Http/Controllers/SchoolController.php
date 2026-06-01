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
        // 1. Fetch active locations from database
        $dbLocations = \App\Models\CampusLocation::where('is_active', true)->get();

        if ($dbLocations->isNotEmpty()) {
            $locations = $dbLocations->map(function($loc) {
                // Map database types to student map UI categories:
                // 'All', 'Faculties', 'Lecture Halls', 'Library', 'Labs', 'Hostels', 'Sports'
                $type = 'Faculties';
                $t = strtolower($loc->type);
                if ($t === 'library') {
                    $type = 'Library';
                } elseif ($t === 'hostel') {
                    $type = 'Hostels';
                } elseif ($t === 'sports') {
                    $type = 'Sports';
                } elseif ($t === 'emergency_point') {
                    $type = 'Labs';
                } elseif ($t === 'building') {
                    if (stripos($loc->name, 'Faculty') !== false || stripos($loc->name, 'School') !== false) {
                        $type = 'Faculties';
                    } elseif (stripos($loc->name, 'Hall') !== false || stripos($loc->name, 'Auditorium') !== false || stripos($loc->name, 'Theatre') !== false) {
                        $type = 'Lecture Halls';
                    } else {
                        $type = 'Faculties';
                    }
                } elseif ($t === 'office') {
                    $type = 'Faculties';
                } elseif ($t === 'facility') {
                    $type = 'Labs';
                } elseif ($t === 'cafeteria') {
                    $type = 'Sports'; // or custom fallback category
                }

                return [
                    'id' => $loc->id,
                    'name' => $loc->name,
                    'type' => $type,
                    'coords' => $loc->building_code ? "{$loc->building_code} (Floor {$loc->floor_number})" : 'Campus Ground',
                    'description' => $loc->description ?: '',
                    'latitude' => $loc->latitude ? floatval($loc->latitude) : null,
                    'longitude' => $loc->longitude ? floatval($loc->longitude) : null,
                    'contact_phone' => $loc->contact_phone,
                    'contact_email' => $loc->contact_email,
                    'operating_hours' => $loc->operating_hours,
                    'building_code' => $loc->building_code,
                ];
            })->toArray();
        } else {
            // Static campus locations data as robust fallback
            $locations = [
                [
                    'id' => 1,
                    'name' => 'Faculty of Science',
                    'type' => 'Faculties',
                    'coords' => 'Block A, East Wing',
                    'description' => 'Home to the departments of Computer Science, Biotech, and Physics. Contains state-of-the-art computer labs and classrooms.',
                    'latitude' => 0.3019,
                    'longitude' => 32.5968,
                    'operating_hours' => '08:00 AM - 06:00 PM',
                    'contact_email' => 'science@kiu.ac.ug',
                    'building_code' => 'FOS-BLK'
                ],
                [
                    'id' => 2,
                    'name' => 'Main Auditorium',
                    'type' => 'Lecture Halls',
                    'coords' => 'Central Campus',
                    'description' => 'A 2,500 capacity hall for major events, conferences, and large joint lecture halls.',
                    'latitude' => 0.3011,
                    'longitude' => 32.5959,
                    'operating_hours' => '07:00 AM - 09:00 PM',
                    'building_code' => 'AUD-CTR'
                ],
                [
                    'id' => 3,
                    'name' => 'E-Library Complex',
                    'type' => 'Library',
                    'coords' => 'Academic Center',
                    'description' => 'State-of-the-art digital library featuring 500+ computer systems, high-speed Wi-Fi, and 24/7 online resource portals.',
                    'latitude' => 0.3023,
                    'longitude' => 32.5960,
                    'operating_hours' => '08:00 AM - 10:00 PM',
                    'contact_phone' => '+256 414 500 100',
                    'contact_email' => 'library@kiu.ac.ug',
                    'building_code' => 'LIB-BLK'
                ],
                [
                    'id' => 4,
                    'name' => 'Kashim Ibrahim Hall',
                    'type' => 'Hostels',
                    'coords' => 'South Campus',
                    'description' => 'Premier university male student residence hall featuring standard study rooms, recreation facilities, and 24/7 security wardens.',
                    'latitude' => 0.2998,
                    'longitude' => 32.5966,
                    'operating_hours' => '24 Hours Open',
                    'building_code' => 'KIH-HST'
                ],
                [
                    'id' => 5,
                    'name' => 'ICT Innovation Lab',
                    'type' => 'Labs',
                    'coords' => 'Block C, Ground Floor',
                    'description' => 'Incubation hub for AI modeling, mobile application development, IoT engineering, and software startup prototyping.',
                    'latitude' => 0.3025,
                    'longitude' => 32.5971,
                    'operating_hours' => '08:30 AM - 05:30 PM',
                    'contact_email' => 'innovations@kiu.ac.ug',
                    'building_code' => 'ICT-LAB'
                ],
                [
                    'id' => 6,
                    'name' => 'Faculty of Arts',
                    'type' => 'Faculties',
                    'coords' => 'Block B, West Wing',
                    'description' => 'Houses the school of Humanities, languages, economics, and mass communication studio labs.',
                    'latitude' => 0.3010,
                    'longitude' => 32.5975,
                    'operating_hours' => '08:00 AM - 05:00 PM',
                    'building_code' => 'ART-BLK'
                ],
                [
                    'id' => 7,
                    'name' => 'Sports Complex',
                    'type' => 'Sports',
                    'coords' => 'North Campus',
                    'description' => 'Standard athletics running tracks, soccer pitches, basketball arenas, and fitness center gymnasium.',
                    'latitude' => 0.3032,
                    'longitude' => 32.5955,
                    'operating_hours' => '06:00 AM - 07:00 PM',
                    'building_code' => 'SPT-CTR'
                ],
            ];
        }

        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'All') {
            $category = $request->category;
            $locations = array_filter($locations, function($loc) use ($category) {
                return strcasecmp($loc['type'], $category) === 0;
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
