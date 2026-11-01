<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                $table->dropForeign(['hostel_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                $table->dropForeign(['hostel_room_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('hostel_complaints', function (Blueprint $table) {
            // Make hostel_id and hostel_room_id nullable
            $table->unsignedBigInteger('hostel_id')->nullable()->change();
            $table->unsignedBigInteger('hostel_room_id')->nullable()->change();
            
            // Add room_number text field for manual input
            $table->string('room_number')->nullable()->after('hostel_room_id');
        });

        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                // Re-add foreign keys with nullable support
                $table->foreign('hostel_id')->references('id')->on('hostels')->onDelete('cascade');
                $table->foreign('hostel_room_id')->references('id')->on('hostel_rooms')->onDelete('cascade');
            });
        } catch (\Exception $e) {}
    }

    public function down(): void
    {
        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                $table->dropForeign(['hostel_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                $table->dropForeign(['hostel_room_id']);
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                $table->dropColumn('room_number');
            });
        } catch (\Exception $e) {}

        Schema::table('hostel_complaints', function (Blueprint $table) {
            $table->unsignedBigInteger('hostel_id')->nullable(false)->change();
            $table->unsignedBigInteger('hostel_room_id')->nullable(false)->change();
        });

        try {
            Schema::table('hostel_complaints', function (Blueprint $table) {
                $table->foreign('hostel_id')->references('id')->on('hostels')->onDelete('cascade');
                $table->foreign('hostel_room_id')->references('id')->on('hostel_rooms')->onDelete('cascade');
            });
        } catch (\Exception $e) {}
    }
};
