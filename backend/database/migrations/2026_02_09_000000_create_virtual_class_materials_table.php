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
        Schema::create('virtual_class_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('virtual_class_id')->constrained('virtual_classes')->onDelete('cascade');
            $table->string('name');
            $table->string('type')->default('other');
            $table->string('file_path');
            $table->string('file_size')->nullable();
            $table->integer('downloads')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virtual_class_materials');
    }
};