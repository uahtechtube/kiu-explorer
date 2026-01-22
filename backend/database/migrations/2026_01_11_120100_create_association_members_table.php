<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('association_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('association_id')->constrained('associations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role')->default('member'); // member, president, secretary, etc.
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();

            $table->unique(['association_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('association_members');
    }
};
