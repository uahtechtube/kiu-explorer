<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hostel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->string('room_number');
            $table->integer('capacity');
            $table->integer('available_slots');
            $table->decimal('price_per_semester', 10, 2);
            $table->enum('status', ['available', 'full', 'maintenance'])->default('available');
            $table->text('amenities')->nullable(); // JSON or text list
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hostel_rooms');
    }
};
