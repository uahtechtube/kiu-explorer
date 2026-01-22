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
        Schema::create('tutorials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade'); // Lecturer ID
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_type'); // 'video', 'pdf', 'audio'
            $table->string('mime_type')->nullable();
            $table->bigInteger('file_size')->nullable(); // In bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutorials');
    }
};
