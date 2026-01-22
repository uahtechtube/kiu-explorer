<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->onDelete('cascade');
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->enum('type', ['objective', 'theory', 'hybrid'])->default('objective');
            $table->integer('duration')->comment('Duration in minutes');
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->integer('total_marks')->default(100);
            $table->integer('passing_marks')->default(40);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
