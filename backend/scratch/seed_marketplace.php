<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Shop;
use App\Models\Product;

echo "Starting marketplace seeding...\n";

// Get some student users
$students = User::where('role', 'student')->limit(3)->get();

if ($students->isEmpty()) {
    echo "No student users found! Please seed users first.\n";
    exit(1);
}

$categories = ['Books', 'Electronics', 'Fashion', 'Food', 'Services', 'Other'];

$shopNames = [
    "Kashim Book Haven",
    "KIU Tech Solutions",
    "Campus Bites & Grill"
];

$shopDescriptions = [
    "Your one-stop shop for course materials, textbooks, past questions, and stationery at Kashim Ibrahim University.",
    "Premium quality student gadgets, chargers, power banks, and laptop repair services right on campus.",
    "Hot meals, pastries, drinks, and snacks delivered to your hostel room. Order your lunch and dinner here!"
];

$productTemplates = [
    [
        ['name' => 'General Physics Textbook', 'price' => 3500.00, 'category' => 'Books', 'description' => 'Slightly used general physics textbook for 100 level students. Perfect condition.'],
        ['name' => 'Scientific Calculator (Casio)', 'price' => 7500.00, 'category' => 'Electronics', 'description' => 'Original Casio scientific calculator. Essential for engineering and math students.'],
        ['name' => 'Past Questions Pack (GST 111)', 'price' => 500.00, 'category' => 'Books', 'description' => 'Comprehensive collection of GST 111 past questions from 2019 to 2024 with answers.']
    ],
    [
        ['name' => '10000mAh Power Bank (Fast Charge)', 'price' => 12000.00, 'category' => 'Electronics', 'description' => 'Brand new fast-charging power bank. Keep your phone alive during lectures.'],
        ['name' => 'Wireless Bluetooth Earbuds', 'price' => 9500.00, 'category' => 'Electronics', 'description' => 'High quality sound, long-lasting battery, perfect for virtual classes and music.'],
        ['name' => 'USB-C Charging Cable (2 Meters)', 'price' => 1500.00, 'category' => 'Electronics', 'description' => 'Braided nylon USB-C fast charging cable, extremely durable.']
    ],
    [
        ['name' => 'Spiced Jollof Rice & Chicken', 'price' => 2500.00, 'category' => 'Food', 'description' => 'Delicious smoked jollof rice served with a large piece of grilled chicken and plantain.'],
        ['name' => 'Cold Brew Iced Coffee', 'price' => 1200.00, 'category' => 'Food', 'description' => 'Freshly brewed cold coffee. Stay alert during your morning lectures.'],
        ['name' => 'Chocolate Glazed Donuts (Box of 4)', 'price' => 1800.00, 'category' => 'Food', 'description' => 'Freshly baked chocolate glazed donuts. Perfect snack for study groups.']
    ]
];

foreach ($students as $index => $student) {
    if (!isset($shopNames[$index])) break;

    // Check if shop already exists
    $shop = Shop::where('user_id', $student->id)->first();
    if (!$shop) {
        $shop = Shop::create([
            'user_id' => $student->id,
            'name' => $shopNames[$index],
            'description' => $shopDescriptions[$index],
            'contact_phone' => $student->phone_number ?: '+234803000000' . $index,
            'whatsapp_number' => $student->phone_number ?: '+234803000000' . $index,
            'contact_email' => $student->email,
            'status' => 'active',
            // Default placeholders for assets
            'logo' => null,
            'banner' => null
        ]);
        echo "Created shop: '{$shop->name}' for student: {$student->first_name} {$student->surname}\n";
    } else {
        echo "Shop '{$shop->name}' already exists for student: {$student->first_name} {$student->surname}\n";
    }

    // Add products
    foreach ($productTemplates[$index] as $prodData) {
        $existingProduct = Product::where('shop_id', $shop->id)->where('name', $prodData['name'])->first();
        if (!$existingProduct) {
            Product::create([
                'shop_id' => $shop->id,
                'name' => $prodData['name'],
                'description' => $prodData['description'],
                'price' => $prodData['price'],
                'category' => $prodData['category'],
                'status' => 'active',
                'image_url' => null // will use placeholder images in frontend
            ]);
            echo "  - Added product: {$prodData['name']}\n";
        }
    }
}

echo "Marketplace seeding finished successfully!\n";
