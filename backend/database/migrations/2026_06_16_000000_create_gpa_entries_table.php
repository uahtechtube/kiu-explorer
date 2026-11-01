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
        Schema::create('gpa_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('semester'); // e.g. "Year 1 Semester 1", "Year 1 Semester 2"
            $table->string('course_code'); // e.g. "MTH101"
            $table->string('course_title')->nullable();
            $table->integer('credit_units'); // e.g. 3, 2
            $table->string('grade'); // A, B, C, D, E, F
            $table->integer('grade_points'); // 5, 4, 3, 2, 1, 0
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gpa_entries');
    }
};
