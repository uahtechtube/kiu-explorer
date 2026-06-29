<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LostItem;
use App\Models\LostItemComment;
use App\Models\User;

class LostItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@kiu.edu.ng')->first();
        $admin = User::where('email', 'admin@kiu.edu.ng')->first();

        if (!$student || !$admin) {
            return;
        }

        // 1. Lost Item 1: Laptop
        $item1 = LostItem::create([
            'user_id' => $student->id,
            'title' => 'Lost HP EliteBook 840 G5',
            'description' => 'Left my silver HP EliteBook laptop in the Computer Science Lab 1. It has a NACOSS sticker on the back and a black keyboard cover. Very critical for my exams!',
            'image_url' => null,
            'location' => 'Computer Science Lab 1',
            'founder' => null,
            'contact_details' => '08012345678 (Abubakar) or abubakar@kiu.edu.ng',
            'type' => 'lost',
            'status' => 'open',
        ]);

        // Comments on Laptop
        LostItemComment::create([
            'lost_item_id' => $item1->id,
            'user_id' => $admin->id,
            'content' => 'Hello Abubakar, I have informed the lab technician to check the cabinets. Please check back later today.',
        ]);

        LostItemComment::create([
            'lost_item_id' => $item1->id,
            'user_id' => $student->id,
            'content' => 'Thank you very much, Admin! I appreciate the quick response. I will check by 2:00 PM.',
        ]);

        // 2. Found Item 2: Keys
        $item2 = LostItem::create([
            'user_id' => $student->id,
            'title' => 'Found: Set of Keys with Toyota Fob',
            'description' => 'Found a set of keys with a Toyota remote key fob on the pathway leading to the Faculty of Law. Has a blue lanyard.',
            'image_url' => null,
            'location' => 'Pathway to Faculty of Law',
            'founder' => 'Abubakar Musa',
            'contact_details' => '08012345678 or pick it up at Room 14, Male Hostel A',
            'type' => 'found',
            'status' => 'open',
        ]);

        // Comments on Keys
        LostItemComment::create([
            'lost_item_id' => $item2->id,
            'user_id' => $admin->id,
            'content' => 'If anyone claims this key, please verify by demonstrating that it unlocks their vehicle.',
        ]);

        // 3. Lost Item 3: Resolved
        $item3 = LostItem::create([
            'user_id' => $student->id,
            'title' => 'Lost Brown Leather Wallet',
            'description' => 'Lost my brown leather wallet containing my student ID card and library card around the Main Convocation Square during the cultural week.',
            'image_url' => null,
            'location' => 'Main Convocation Square',
            'founder' => null,
            'contact_details' => 'Please message me here or call 08012345678',
            'type' => 'lost',
            'status' => 'resolved',
        ]);
    }
}
