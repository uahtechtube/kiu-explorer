<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Duplicate migration neutralized.
        // The real table creation happens in 2026_01_03_000000_create_academic_structure_tables.php
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
