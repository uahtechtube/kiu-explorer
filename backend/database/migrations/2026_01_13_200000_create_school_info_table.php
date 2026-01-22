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
        Schema::create('school_info', function (Blueprint $table) {
            $table->id();
            $table->string('school_name')->default('Kashim Ibrahim University');
            $table->text('background')->nullable();
            $table->text('history')->nullable();
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->text('core_values')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('motto')->nullable();
            $table->year('established_year')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_info');
    }
};
