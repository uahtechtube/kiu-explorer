<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\BlogPost;

// Truncate existing posts to prevent duplication
BlogPost::truncate();

BlogPost::create([
    'title' => 'Getting Started with KIU Explorer: A Comprehensive Guide',
    'slug' => 'getting-started-with-kiu-explorer-comprehensive-guide',
    'summary' => 'Discover how to install, register, and leverage the ultimate campus companion app for Kashim Ibrahim University.',
    'content' => "## Introduction
Welcome to Kashim Ibrahim University! Navigating campus life can be challenging, but with the new **KIU Explorer** app, everything is now in the palm of your hands.

In this guide, we will walk you through the key features of the app and how you can get started today.

## 1. Downloading and Installing the APK
First, download the APK package directly from this landing page. Since this is an Android application distributed outside of the Google Play Store, you will need to allow installation from *Unknown Sources* in your device security settings.

## 2. Setting Up Your Account
Open the app and select your role (Student or Lecturer). You can register with your university details. Ensure that you use a valid email address as verification may be required.

## 3. Top Features You Should Explore
- **Interactive Campus Navigation:** Search for specific classrooms, lecture halls, or administrative offices and get step-by-step directions.
- **Academic Planner:** Input your course codes, track assignments, and automatically compute your GPA.
- **Hostel Hub:** Search for hostels, pay fees securely via Paystack, and get your bed allocated dynamically.

## Conclusion
KIU Explorer is designed to make your academic journey smooth and connected. Start exploring now, and stay tuned for more feature updates!",
    'author_name' => 'KIU Explorer Team',
    'status' => 'published',
    'published_at' => now()->subDays(2),
    'views' => 124,
]);

BlogPost::create([
    'title' => 'How to Secure Your Hostel Accommodation Using Paystack Sandbox',
    'slug' => 'how-to-secure-hostel-accommodation-paystack',
    'summary' => 'A step-by-step walkthrough on browsing available rooms, paying accommodation fees, and getting instant bed allocation.',
    'content' => "## Secure Your Campus Stay
Securing a safe, comfortable place to stay is one of the most critical parts of your university experience. KIU Explorer features an integrated Hostel accommodation portal that makes bookings effortless.

## Step-by-Step Booking Guide

1. **Browse Available Hostels:** Navigate to the Hostel section inside the app. You can filter by room type, capacity, and price.
2. **Select Room & Bed:** View available slots in real-time. Select a room to reserve a pending slot.
3. **Authorize Payment:** Tap the 'Pay via Paystack' button. You will be redirected to the Paystack Sandbox Simulator page.
4. **Authorize Sandbox Checkout:** Click on 'Authorize Successful Payment' in the simulator. The system will automatically approve your booking, update room status, and allocate a bed dynamically.
5. **Receipt Generation:** Return to the app. You can view or print your digital payment receipt immediately.

## Need Assistance?
If you encounter any issues with room allocation or payment verification, you can submit a Support Ticket directly in the app. Our administrators monitor reports 24/7.",
    'author_name' => 'Hostel Warden Office',
    'status' => 'published',
    'published_at' => now()->subDay(),
    'views' => 98,
]);

BlogPost::create([
    'title' => 'Exciting Features Coming in KIU Explorer v1.1.0',
    'slug' => 'exciting-features-coming-kiu-explorer-v1-1-0',
    'summary' => 'A sneak peek into upcoming capabilities, including real-time bus tracking, automated assignment reminders, and integrated library search.',
    'content' => "## Continuous Innovation
Our development team is constantly working to add more value to the KIU Explorer experience. Thanks to feedback from our students and faculty, we are excited to share a sneak peek of features coming in version 1.1.0!

## What is New in v1.1.0?

- **Live Shuttle Bus Tracker:** Track campus shuttles in real-time and know exactly when the next bus will arrive at your stop.
- **Automated Timetable Notifications:** Receive push reminders 15 minutes before your lectures start so you never miss a class.
- **Library Resource Search:** Browse the KIU main library book catalogs, reserve resources, and check loan return dates inside the app.
- **Enhanced Marketplace:** A security-first campus commerce platform to buy and sell textbooks, electronics, and peer-to-peer services.

## Beta Testing
We will be opening a closed Beta channel next week for interested students. Stay tuned to the announcements board in the app for details on how to join!",
    'author_name' => 'Product Team',
    'status' => 'draft',
    'published_at' => null,
    'views' => 0,
]);

echo "Successfully seeded 3 blog posts!\n";
