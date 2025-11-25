<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_id')->constrained('trainings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('score')->nullable();
            $table->enum('status', ['pass', 'fail'])->nullable();
            $table->string('certificate_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['training_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_results');
    }
};
