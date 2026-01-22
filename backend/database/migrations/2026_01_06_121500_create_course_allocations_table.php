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
        Schema::create('course_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Lecturer
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->onDelete('cascade');
            
            $table->boolean('is_coordinator')->default(false);
            
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'academic_session_id'], 'unique_allocation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_allocations');
    }
};
