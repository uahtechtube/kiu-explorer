<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hostel_heads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->string('name');
            $table->string('title')->default('Head of Hostel'); // e.g. Warden, Provost, Hall Master
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('room_number')->nullable();
            $table->string('office_hours')->nullable();
            $table->text('bio')->nullable();
            $table->string('image')->nullable(); // base64-decoded path stored here
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hostel_heads');
    }
};
