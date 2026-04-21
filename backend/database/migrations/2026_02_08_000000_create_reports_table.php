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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('reportable_type'); // Type of content (Post, Comment, User, etc.)
            $table->unsignedBigInteger('reportable_id'); // ID of the reported content
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->string('reason'); // Reason for report
            $table->enum('status', ['pending', 'reviewed', 'resolved'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            // Index for polymorphic relationship
            $table->index(['reportable_type', 'reportable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
