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
        // For SQLite and other databases
        if (config('database.default') === 'sqlite') {
            // SQLite doesn't support MODIFY, so we'll use a workaround
            // The change will be reflected in the model validation instead
        } else {
            DB::statement("ALTER TABLE evaluation_criteria MODIFY COLUMN type ENUM('rating', 'number', 'text') DEFAULT 'rating'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE evaluation_criteria MODIFY COLUMN type ENUM('rating', 'text') DEFAULT 'rating'");
        }
    }
};
