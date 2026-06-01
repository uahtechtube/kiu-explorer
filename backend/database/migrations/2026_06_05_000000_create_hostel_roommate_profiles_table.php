<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hostel_roommate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('sleep_habit')->nullable(); // early_bird, night_owl, flexible
            $table->string('study_habit')->nullable(); // quiet, light_music, group
            $table->string('cleanliness')->nullable(); // neat_freak, moderate, relaxed
            $table->string('social_habit')->nullable(); // introvert, extrovert, balanced
            $table->text('bio')->nullable();
            $table->string('interests')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hostel_roommate_profiles');
    }
};
