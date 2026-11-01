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
        Schema::table('popup_announcements', function (Blueprint $table) {
            $table->dropColumn(['registration_updates', 'documentation_deadlines', 'student_dues', 'events']);
            $table->text('body')->nullable()->after('title');
            $table->string('image')->nullable()->after('body');
            $table->string('video')->nullable()->after('image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('popup_announcements', function (Blueprint $table) {
            $table->dropColumn(['body', 'image', 'video']);
            $table->text('registration_updates')->nullable();
            $table->text('documentation_deadlines')->nullable();
            $table->text('student_dues')->nullable();
            $table->text('events')->nullable();
        });
    }
};
