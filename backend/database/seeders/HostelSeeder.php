<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hostel;
use App\Models\HostelRoom;
use App\Models\CampusLocation;

class HostelSeeder extends Seeder
{
    public function run(): void
    {
        $locations = CampusLocation::where('type', 'hostel')->get();

        if ($locations->isEmpty()) {
            // Create a default hostel location if none exists
            $location = CampusLocation::create([
                'name' => 'Main Campus Hostel Area',
                'type' => 'hostel',
                'description' => 'Primary residential area for students.',
                'is_active' => true,
            ]);
        } else {
            $location = $locations->first();
        }

        $hostels = [
            [
                'name' => 'Nelson Mandela Hall',
                'campus_location_id' => $location->id,
                'gender_type' => 'male',
                'description' => 'A prime male hostel with modern facilities and proximity to the library.',
                'image_url' => 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
            ],
            [
                'name' => 'Queen Amina Hall',
                'campus_location_id' => $location->id,
                'gender_type' => 'female',
                'description' => 'Secure and comfortable female hostel with spacious common rooms.',
                'image_url' => 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop',
            ],
        ];

        foreach ($hostels as $hData) {
            $hostel = Hostel::create($hData);

            // Create 10 rooms for each hostel
            for ($i = 1; $i <= 10; $i++) {
                HostelRoom::create([
                    'hostel_id' => $hostel->id,
                    'room_number' => 'A' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'capacity' => 4,
                    'available_slots' => 4,
                    'price_per_semester' => 25000.00,
                    'status' => 'available',
                    'amenities' => ['WiFi', 'Ceiling Fan', 'Study Desk', 'Bed Frame'],
                ]);
            }
        }
    }
}
