<?php
// Quick script to check and remove duplicate matric number

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$matricNumber = '22/02/05/390';

echo "Searching for users with matric number: {$matricNumber}\n\n";

$users = User::where('matric_number', $matricNumber)->get();

if ($users->isEmpty()) {
    echo "✅ No users found with this matric number. Safe to register!\n";
} else {
    echo "Found {$users->count()} user(s) with this matric number:\n\n";
    
    foreach ($users as $user) {
        echo "ID: {$user->id}\n";
        echo "Name: {$user->surname} {$user->first_name}\n";
        echo "Email: {$user->email}\n";
        echo "Matric: {$user->matric_number}\n";
        echo "Created: {$user->created_at}\n";
        echo "---\n";
    }
    
    echo "\nTo delete these users, uncomment the lines below and run again:\n";
    echo "// User::where('matric_number', '{$matricNumber}')->delete();\n";
    echo "// echo \"Deleted all users with matric number {$matricNumber}\";\n";
    
    // Uncomment these lines to actually delete:
    // User::where('matric_number', $matricNumber)->delete();
    // echo "\n✅ Deleted all users with matric number {$matricNumber}\n";
}
