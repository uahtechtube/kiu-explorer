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
        if (!Schema::hasTable('virtual_classes')) {
            Schema::create('virtual_classes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
                $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->dateTime('scheduled_at');
                $table->integer('duration')->comment('Duration in minutes')->default(60); 
                $table->string('meeting_link')->nullable();
                $table->enum('status', ['upcoming', 'active', 'ended'])->default('upcoming');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virtual_classes');
    }
};
