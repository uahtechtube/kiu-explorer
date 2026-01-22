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
        Schema::create('parent_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('full_name');
            $table->string('relationship'); // Father, Mother, Guardian, etc.
            $table->string('phone_number');
            $table->string('alternative_phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('occupation')->nullable();
            $table->boolean('is_primary')->default(true); // Primary contact
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parent_guardians');
    }
};
