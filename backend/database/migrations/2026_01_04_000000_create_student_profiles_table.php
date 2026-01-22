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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Academic Info (Linked)
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('programme_id')->nullable()->constrained('programmes')->nullOnDelete();
            $table->foreignId('academic_session_id')->nullable()->constrained('academic_sessions')->nullOnDelete();

            $table->string('level')->nullable(); // 100, 200, etc
            $table->string('mode_of_study')->nullable(); // Full-time/Part-time
            $table->string('admission_year')->nullable();
            $table->string('entry_mode')->nullable(); // UTME/DE
            $table->string('student_status')->default('active'); // active/suspended/graduated

            // Parent/Guardian Info
            $table->string('guardian_name')->nullable();
            $table->string('guardian_relationship')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_email')->nullable();
            $table->text('guardian_address')->nullable();

            // Documents (Paths)
            $table->string('admission_letter_path')->nullable();
            $table->string('birth_certificate_path')->nullable();
            $table->string('olevel_result_path')->nullable();
            $table->string('id_card_path')->nullable();
            $table->text('other_documents_path')->nullable(); // Could be JSON if multiple

            // Metadata
            $table->string('created_by')->nullable(); // Admin ID
            $table->string('ip_address')->nullable();
            $table->text('device_info')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
