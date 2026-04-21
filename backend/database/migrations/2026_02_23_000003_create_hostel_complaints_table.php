<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hostel_complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('hostel_room_id')->constrained('hostel_rooms')->onDelete('cascade');
            $table->enum('category', ['plumbing', 'electrical', 'carpentry', 'cleaning', 'security', 'other']);
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'closed'])->default('pending');
            $table->text('admin_comment')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index('hostel_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hostel_complaints');
    }
};
