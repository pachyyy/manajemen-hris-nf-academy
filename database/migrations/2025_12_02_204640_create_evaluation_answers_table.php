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
        Schema::create('evaluation_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_evaluation_id')->constrained('employee_evaluations')->onDelete('cascade');
            $table->foreignId('criteria_id')->constrained('evaluation_criteria')->onDelete('cascade');
            $table->integer('self_score')->nullable();
            $table->text('self_note')->nullable();
            $table->integer('hr_score')->nullable();
            $table->text('hr_feedback')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_answers');
    }
};
