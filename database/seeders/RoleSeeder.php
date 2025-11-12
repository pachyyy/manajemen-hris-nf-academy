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
            ['name' => 'Marketing', 'description' => 'Bertugas untuk mempromosikan NF Academy guna meningkatkan jumlah murid.'],
            ['name' => 'Operasional', 'description' => 'Bertugas untuk mengurus setiap operasional dalam NF Academy.'],
            ['name' => 'Riset dan Pengembangan', 'description' => 'Bertugas untuk mempelajari data yang ada guna mengembangkan pembelajaran pada NF Academy.'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
