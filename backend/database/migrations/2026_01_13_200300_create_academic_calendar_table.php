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
        Schema::create('academic_calendar', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['exam', 'registration', 'break', 'resumption', 'event', 'deadline', 'other']);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('academic_session'); // e.g., 2025/2026
            $table->string('semester')->nullable(); // first, second
            $table->string('color')->default('#3B82F6'); // For calendar display
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_calendar');
    }
};
