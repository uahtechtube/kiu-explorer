<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associations', function (Blueprint $table) {
            if (!Schema::hasColumn('associations', 'acronym')) {
                $table->string('acronym')->nullable()->after('name');
            }
            if (!Schema::hasColumn('associations', 'category')) {
                $table->string('category')->nullable()->after('acronym');
            }
            if (!Schema::hasColumn('associations', 'president_id')) {
                $table->unsignedBigInteger('president_id')->nullable()->after('category');
                $table->foreign('president_id')->references('id')->on('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('associations', 'meeting_schedule')) {
                $table->string('meeting_schedule')->nullable()->after('description');
            }
            if (!Schema::hasColumn('associations', 'logo_url')) {
                $table->string('logo_url')->nullable()->after('logo');
            }
            if (!Schema::hasColumn('associations', 'cover_image_url')) {
                $table->string('cover_image_url')->nullable()->after('banner');
            }
        });
    }

    public function down(): void
    {
        Schema::table('associations', function (Blueprint $table) {
            $table->dropForeign(['president_id']);
            $table->dropColumn([
                'acronym',
                'category',
                'president_id',
                'meeting_schedule',
                'logo_url',
                'cover_image_url'
            ]);
        });
    }
};
