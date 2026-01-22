<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('polls')->onDelete('cascade');
            $table->foreignId('option_id')->constrained('poll_options')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('voted_at');
            $table->timestamps();
            
            // Unique constraint for single vote per poll (unless multiple votes allowed)
            $table->unique(['poll_id', 'user_id', 'option_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('poll_votes');
    }
};
