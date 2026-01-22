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
        Schema::create('staff_directory', function (Blueprint $table) {
            $table->id();
            $table->string('staff_id')->unique();
            $table->string('title')->nullable(); // Prof, Dr, Mr, Mrs, etc.
            $table->string('surname');
            $table->string('first_name');
            $table->string('other_names')->nullable();
            $table->string('position'); // Dean, HOD, Lecturer, etc.
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->string('office_location')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('photo_url')->nullable();
            $table->text('specialization')->nullable();
            $table->text('qualifications')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_directory');
    }
};
