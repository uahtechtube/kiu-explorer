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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->string('code')->unique(); // e.g., 'CSC101'
            $table->string('title');
            $table->integer('unit'); // Credit unit
            $table->string('level'); // 100, 200...
            $table->string('semester'); // First, Second
            $table->text('description')->nullable();
            $table->boolean('is_elective')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
