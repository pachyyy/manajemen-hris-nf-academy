<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['schedule', 'event', 'collective_leave', 'policy'])->default('schedule');
            $table->text('content');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('audience')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
