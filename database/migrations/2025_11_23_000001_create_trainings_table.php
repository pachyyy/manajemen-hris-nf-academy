<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('trainer_name')->nullable();
            $table->enum('type', ['online', 'offline'])->default('online');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('location')->nullable(); // alamat / link zoom
            $table->unsignedInteger('quota')->nullable();
            $table->enum('status', ['draft', 'open', 'ongoing', 'completed', 'cancelled'])->default('draft');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainings');
    }
};
