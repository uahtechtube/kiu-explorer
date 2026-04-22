<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE hostel_complaints MODIFY COLUMN category ENUM('plumbing', 'electrical', 'carpentry', 'cleaning', 'security', 'water_supply', 'other')");
        DB::statement("ALTER TABLE hostel_complaints MODIFY COLUMN status ENUM('pending', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE hostel_complaints MODIFY COLUMN category ENUM('plumbing', 'electrical', 'carpentry', 'cleaning', 'security', 'other')");
        DB::statement("ALTER TABLE hostel_complaints MODIFY COLUMN status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending'");
    }
};
