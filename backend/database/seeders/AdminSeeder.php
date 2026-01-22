<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists to avoid duplicates
        if (!User::where('email', 'admin@kiu.edu.ng')->exists()) {
            User::create([
                'user_id' => 'ADMIN-001',
                'surname' => 'Administrator',
                'first_name' => 'Super',
                'other_names' => 'User',
                'email' => 'admin@kiu.edu.ng',
                'password' => Hash::make('password'), // Change this in production!
                'role' => 'admin',
                'gender' => 'Male', // Default
                'nationality' => 'Nigeria', // Default
                'state_of_origin' => 'Kano', // Default
                'lga' => 'Kano Municipal', // Default
                'phone_number' => '08000000000',
                'username' => 'admin',
                'account_status' => 'active',
            ]);
            $this->command->info('Admin user created successfully.');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
