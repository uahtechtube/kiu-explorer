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
        Schema::create('campus_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['building', 'facility', 'emergency_point', 'office', 'library', 'cafeteria', 'hostel', 'sports', 'other']);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('image_url')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('operating_hours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('floor_number')->nullable();
            $table->string('building_code')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_locations');
    }
};
