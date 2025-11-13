<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'description' => 'Bertugas mengontrol sistem secara penuh.'
            ],
            [
                'name' => 'Human Resource',
                'description' => 'Bertugas sebagai HR untuk mengontrol para pegawai NF Academy.'
            ],
            [
                'name' => 'Staff',
                'description' => 'Staff biasa'
            ]
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
