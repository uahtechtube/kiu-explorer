<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LandingPageSetting;

class LandingPageSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (LandingPageSetting::count() === 0) {
            LandingPageSetting::create([
                'app_name' => 'KIU Explorer',
                'hero_title' => 'Navigate, Plan, and Connect at KIU',
                'hero_subtitle' => 'The ultimate digital campus companion for Kashim Ibrahim University. Find classrooms, book hostels, calculate GPA, chat with peers, and stay updated with campus announcements—all in one place.',
                'apk_version' => '1.0.4',
                'apk_size' => '22.4 MB',
                'apk_file_path' => null, // null means it downloads the fallback mock APK
                'download_count' => 142, // Starting mock stat
                'primary_color' => '#09a5db',
                'secondary_color' => '#0f172a',
                'features' => [
                    [
                        'title' => 'Interactive Map & Navigation',
                        'description' => 'Find classrooms, lecture halls, administrative offices, and hostels with step-by-step campus guidance.',
                        'icon' => 'map'
                    ],
                    [
                        'title' => 'Academic Planner & GPA',
                        'description' => 'Track your assignments, calculate your GPA automatically, and view class timetables in a gorgeous scheduler.',
                        'icon' => 'book'
                    ],
                    [
                        'title' => 'Hostel Accommodation Hub',
                        'description' => 'Browse available hostels, secure bed allocations, pay fees via Paystack, and find roommates.',
                        'icon' => 'home'
                    ],
                    [
                        'title' => 'Campus Forums & Socials',
                        'description' => 'Join student associations, chat in real-time, buy/sell on the marketplace, and search for lost items.',
                        'icon' => 'chat'
                    ]
                ],
                'faqs' => [
                    [
                        'question' => 'How do I install the KIU Explorer APK?',
                        'answer' => 'Download the APK file by clicking the download button on this page. Locate the downloaded file in your file manager and tap it. If prompted, enable "Install from Unknown Sources" in your device settings to complete installation.'
                    ],
                    [
                        'question' => 'What are the system requirements?',
                        'answer' => 'KIU Explorer is optimized for Android devices running Android 8.0 (Oreo) and above. An active internet connection is recommended for real-time synchronization.'
                    ],
                    [
                        'question' => 'How do I log into the app?',
                        'answer' => 'Use your registered university student or lecturer credentials. If you do not have an account, you can easily register directly within the app.'
                    ]
                ],
                'screenshots' => [] // Will use default screenshot layout if empty
            ]);
        }
    }
}
