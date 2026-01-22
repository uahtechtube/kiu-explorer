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
        Schema::table('virtual_classes', function (Blueprint $table) {
            $table->string('recording_url')->nullable()->after('meeting_link');
            $table->boolean('is_recorded')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('virtual_classes', function (Blueprint $table) {
            $table->dropColumn(['recording_url', 'is_recorded']);
        });
    }
};
