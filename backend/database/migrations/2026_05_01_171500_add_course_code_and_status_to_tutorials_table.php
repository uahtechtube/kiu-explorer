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
        Schema::table('tutorials', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['course_id']);
            
            // Make course_id nullable
            $table->unsignedBigInteger('course_id')->nullable()->change();
            
            // Add new columns
            $table->string('course_code')->nullable()->after('course_id');
            $table->enum('status', ['active', 'banned'])->default('active')->after('views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutorials', function (Blueprint $table) {
            $table->dropColumn(['course_code', 'status']);
            
            // Note: Cannot easily restore the strict foreign key if we have null course_ids,
            // so we don't force it back here unless we clear data.
            $table->unsignedBigInteger('course_id')->nullable(false)->change();
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }
};
