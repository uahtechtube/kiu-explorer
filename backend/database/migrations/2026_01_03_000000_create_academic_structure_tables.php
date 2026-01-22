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
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->nullable()->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained('faculties')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['faculty_id', 'name']);
        });

        Schema::create('programmes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->string('name'); // e.g., B.Sc. Computer Science
            $table->string('degree_type')->nullable(); // e.g., B.Sc.
            $table->string('duration')->nullable(); // e.g., 4 years
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('academic_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 2025/2026
            $table->boolean('is_current')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programmes');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('faculties');
        Schema::dropIfExists('academic_sessions');
    }
};
