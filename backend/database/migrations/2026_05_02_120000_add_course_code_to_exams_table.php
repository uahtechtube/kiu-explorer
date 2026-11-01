<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $blueprint) {
            $blueprint->string('course_code')->nullable()->after('course_id');
            $blueprint->unsignedBigInteger('course_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $blueprint) {
            $blueprint->dropColumn('course_code');
            $blueprint->unsignedBigInteger('course_id')->nullable(false)->change();
        });
    }
};
