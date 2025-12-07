<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            DB::statement("ALTER TABLE attendances MODIFY COLUMN status ENUM('hadir', 'izin', 'sakit', 'cuti', 'alpha', 'terlambat') NOT NULL DEFAULT 'hadir'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            DB::statement("ALTER TABLE attendances MODIFY COLUMN status ENUM('hadir', 'izin', 'sakit', 'cuti', 'alpha') NOT NULL DEFAULT 'hadir'");
        });
    }
};