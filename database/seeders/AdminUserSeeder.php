<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the 'Admin HR' role
        $adminRole = Role::where('name', 'Admin')->first();

        if ($adminRole) {
            // Create Admin 1
            User::firstOrCreate(
                ['email' => 'admin1@admin.com'],
                [
                    'name' => 'Admin User One',
                    'password' => Hash::make('admin123'),
                    'email_verified_at' => now(),
                    'role_id' => $adminRole->id,
                    'first_password' => 'admin123',
                ]
            );

            // Create Admin 2
            User::firstOrCreate(
                ['email' => 'admin2@admin.com'],
                [
                    'name' => 'Admin User Two',
                    'password' => Hash::make('admin123'),
                    'email_verified_at' => now(),
                    'role_id' => $adminRole->id,
                    'first_password' => 'admin123',
                ]
            );
        }
    }
}
