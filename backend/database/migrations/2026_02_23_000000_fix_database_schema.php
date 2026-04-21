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
        // Fix events table
        if (Schema::hasTable('events')) {
            Schema::table('events', function (Blueprint $table) {
                // Add column by column, check existence for each
                if (!Schema::hasColumn('events', 'category')) {
                    $table->string('category')->nullable();
                }
                
                if (!Schema::hasColumn('events', 'event_date')) {
                    $table->date('event_date')->nullable();
                }
                
                if (!Schema::hasColumn('events', 'type')) {
                    $table->string('type')->nullable();
                }
            });
        }

        // Fix library_resources table
        if (Schema::hasTable('library_resources')) {
            Schema::table('library_resources', function (Blueprint $table) {
                if (Schema::hasColumn('library_resources', 'file_size')) {
                    $table->integer('file_size')->default(0)->change();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('events')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn(['event_date', 'type', 'category']);
            });
        }
    }
};
