<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\User;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a student user
        $student = User::where('role', 'student')->first();

        if (!$student) {
            $this->command->warn('No student found. Skipping payment seeding.');
            return;
        }

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
                'created_at' => now()->subMonths(4),
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
                'created_at' => now()->subDays(2),
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
                'created_at' => now()->subMonths(2),
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
                'created_at' => now()->subMonths(4),
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
                'created_at' => now()->subMonths(3),
            ],
        ];

        foreach ($payments as $payment) {
            Payment::create($payment);
        }

        $this->command->info('Payment data seeded successfully!');
    }
}
