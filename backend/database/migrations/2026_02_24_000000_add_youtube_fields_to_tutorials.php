<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutorials', function (Blueprint $table) {
            // Allow file_path and file_type to be nullable (YouTube tutorials have no local file)
            $table->string('file_path')->nullable()->change();
            $table->string('file_type')->nullable()->change();

            // New YouTube fields
            $table->string('youtube_video_id')->nullable()->after('file_size');
            $table->string('source_type')->default('file')->after('youtube_video_id'); // 'file' | 'youtube'
            $table->unsignedInteger('views')->default(0)->after('source_type');
        });
    }

    public function down(): void
    {
        Schema::table('tutorials', function (Blueprint $table) {
            $table->dropColumn(['youtube_video_id', 'source_type', 'views']);
            $table->string('file_path')->nullable(false)->change();
            $table->string('file_type')->nullable(false)->change();
        });
    }
};
