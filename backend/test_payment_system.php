<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Payment;
use App\Models\User;

echo "Testing Payment System...\n\n";

// Check if payments table exists
try {
    $count = Payment::count();
    echo "✅ Payments table exists. Current count: $count\n";
} catch (\Exception $e) {
    echo "❌ Payments table does not exist or error: " . $e->getMessage() . "\n";
    echo "Please run: php artisan migrate\n";
    exit(1);
}

// Get a student
$student = User::where('role', 'student')->first();

if (!$student) {
    echo "❌ No student found in database\n";
    exit(1);
}

echo "✅ Found student: {$student->first_name} {$student->surname} (ID: {$student->id})\n\n";

// Check if sample payments exist
$existingPayments = Payment::where('student_id', $student->id)->count();

if ($existingPayments > 0) {
    echo "✅ Sample payments already exist: $existingPayments transactions\n";
} else {
    echo "Creating sample payment data...\n";
    
    $payments = [
        [
            'student_id' => $student->id,
            'amount' => 155000,
            'type' => 'tuition',
            'description' => 'Tuition Fee - Semester 1',
            'reference' => 'TXN-K2301',
            'status' => 'paid',
            'payment_method' => 'card',
            'transaction_date' => now()->subMonths(4),
        ],
        [
            'student_id' => $student->id,
            'amount' => 12500,
            'type' => 'other',
            'description' => 'Departmental Development Levy',
            'reference' => 'TXN-K2302',
            'status' => 'pending',
            'payment_method' => null,
            'transaction_date' => null,
        ],
        [
            'student_id' => $student->id,
            'amount' => 15000,
            'type' => 'other',
            'description' => 'ICT Resource Fee',
            'reference' => 'TXN-K2303',
            'status' => 'paid',
            'payment_method' => 'bank_transfer',
            'transaction_date' => now()->subMonths(2),
        ],
        [
            'student_id' => $student->id,
            'amount' => 45000,
            'type' => 'hostel',
            'description' => 'Hostel Maintenance',
            'reference' => 'TXN-K2304',
            'status' => 'failed',
            'payment_method' => 'card',
            'transaction_date' => now()->subMonths(4),
        ],
        [
            'student_id' => $student->id,
            'amount' => 5000,
            'type' => 'library',
            'description' => 'Library Access Fee',
            'reference' => 'TXN-K2305',
            'status' => 'paid',
            'payment_method' => 'card',
            'transaction_date' => now()->subMonths(3),
        ],
    ];

    foreach ($payments as $payment) {
        Payment::create($payment);
        echo "  ✅ Created: {$payment['description']} - ₦{$payment['amount']}\n";
    }
    
    echo "\n✅ Sample payment data created successfully!\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Payment System Status\n";
echo str_repeat("=", 50) . "\n";

$totalPaid = Payment::where('student_id', $student->id)->where('status', 'paid')->sum('amount');
$totalPending = Payment::where('student_id', $student->id)->where('status', 'pending')->sum('amount');
$totalFailed = Payment::where('student_id', $student->id)->where('status', 'failed')->sum('amount');

echo "Total Paid: ₦" . number_format($totalPaid, 2) . "\n";
echo "Total Pending: ₦" . number_format($totalPending, 2) . "\n";
echo "Total Failed: ₦" . number_format($totalFailed, 2) . "\n";
echo "\n✅ Payment system is ready for testing!\n";
