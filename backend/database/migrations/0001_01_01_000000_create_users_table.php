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
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('user_id')->unique()->nullable(); // Auto-generated
                $table->string('matric_number')->unique()->nullable();
                
                // Core Identity
                $table->string('surname');
                $table->string('first_name');
                $table->string('other_names')->nullable();
                $table->string('gender')->nullable();
                $table->date('dob')->nullable();
                $table->string('nationality')->nullable();
                $table->string('state_of_origin')->nullable();
                $table->string('lga')->nullable();
                $table->string('passport_photograph')->nullable();
                
                // Contact
                $table->string('email')->unique();
                $table->string('phone_number')->nullable();
                $table->string('alternative_phone_number')->nullable();
                $table->text('residential_address')->nullable();
                $table->string('city')->nullable();
                $table->string('state_of_residence')->nullable();

                // Auth & Status
                $table->string('username')->unique()->nullable();
                $table->string('role')->default('student'); // student, lecturer, admin
                $table->string('account_status')->default('active'); // active, blocked, pending
                $table->timestamp('last_login_date')->nullable();
                
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
