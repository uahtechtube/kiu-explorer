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
        Schema::create('landing_page_settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->default('KIU Explorer');
            $table->string('hero_title');
            $table->text('hero_subtitle');
            $table->string('apk_version')->default('1.0.0');
            $table->string('apk_size')->default('18.5 MB');
            $table->string('apk_file_path')->nullable(); // Saved under storage/apks
            $table->unsignedInteger('download_count')->default(0);
            $table->string('primary_color')->default('#09a5db'); // Electric Blue
            $table->string('secondary_color')->default('#0f172a'); // Slate 900
            $table->json('features')->nullable(); // [{"title", "description", "icon"}]
            $table->json('faqs')->nullable(); // [{"question", "answer"}]
            $table->json('screenshots')->nullable(); // ["url1", "url2"]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_page_settings');
    }
};
