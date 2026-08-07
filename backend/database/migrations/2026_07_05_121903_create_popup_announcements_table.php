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
        Schema::create('popup_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('registration_updates')->nullable();
            $table->text('documentation_deadlines')->nullable();
            $table->text('student_dues')->nullable();
            $table->text('events')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('popup_announcements');
    }
};
