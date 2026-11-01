<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('virtual_class_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('virtual_class_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->boolean('is_lecturer')->default(false);
            $table->timestamps();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->string('status')->nullable()->default('present');
            $table->boolean('is_hand_raised')->default(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('virtual_class_messages');
        
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('attendances', 'is_hand_raised')) {
                $table->dropColumn('is_hand_raised');
            }
        });
    }
};
