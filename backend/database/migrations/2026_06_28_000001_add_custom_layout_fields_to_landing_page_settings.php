<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('landing_page_settings', function (Blueprint $table) {
            $table->string('hero_image_path')->nullable(); // Uploaded photo
            $table->string('theme_mode')->default('dark'); // 'dark' or 'light'
            $table->boolean('show_features')->default(true); // Toggle features
            $table->boolean('show_faqs')->default(true); // Toggle FAQs
            $table->boolean('show_stats')->default(true); // Toggle stats proof badge
            $table->json('custom_sections')->nullable(); // Dynamic user-defined sections
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_page_settings', function (Blueprint $table) {
            $table->dropColumn([
                'hero_image_path',
                'theme_mode',
                'show_features',
                'show_faqs',
                'show_stats',
                'custom_sections'
            ]);
        });
    }
};
