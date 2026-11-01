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
        Schema::table('messages', function (Blueprint $table) {
            // Update type column to support more media types
            $table->string('type')->default('text')->change(); // Will manually update enum
            
            // Add media-related columns
            $table->string('media_url')->nullable()->after('content');
            $table->integer('media_size')->nullable()->after('media_url'); // bytes
            $table->string('media_mime_type')->nullable()->after('media_size');
            $table->integer('media_duration')->nullable()->after('media_mime_type'); // seconds for audio/video
            $table->string('thumbnail_url')->nullable()->after('media_duration');
            $table->string('file_name')->nullable()->after('thumbnail_url'); // original filename
        });
        
        // Update type values via raw SQL to support new types
        if (\DB::getDriverName() !== 'sqlite') {
            \DB::statement("ALTER TABLE messages MODIFY COLUMN type ENUM('text', 'image', 'document', 'voice', 'video', 'file') DEFAULT 'text'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn([
                'media_url',
                'media_size',
                'media_mime_type',
                'media_duration',
                'thumbnail_url',
                'file_name'
            ]);
        });
        
        // Revert type column
        if (\DB::getDriverName() !== 'sqlite') {
            \DB::statement("ALTER TABLE messages MODIFY COLUMN type ENUM('text', 'image', 'file') DEFAULT 'text'");
        }
    }
};
