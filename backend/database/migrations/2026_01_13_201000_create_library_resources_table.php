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
        Schema::create('library_resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author')->nullable();
            $table->enum('category', ['textbook', 'journal', 'past_question', 'reference', 'research', 'other']);
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_type'); // pdf, doc, etc.
            $table->integer('file_size');
            $table->string('cover_image')->nullable();
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('set null');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->integer('downloads_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_approved')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_resources');
    }
};
