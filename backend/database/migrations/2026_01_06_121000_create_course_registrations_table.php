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
        Schema::create('course_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Student
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->onDelete('cascade');
            
            $table->decimal('ca_score', 5, 2)->nullable();
            $table->decimal('exam_score', 5, 2)->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('grade')->nullable(); // A, B, C...
            $table->string('status')->default('registered'); // registered, approved, dropped
            
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'academic_session_id'], 'unique_registration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_registrations');
    }
};
