<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@mehasvisto.com'],
            [
                'name' => 'Administrador del Sistema',
                'telefono' => '0999999999',
                'password' => 'Admin@123',
                'rol' => 'admin',
                'estado_cuenta' => 'activo',
                'foto_perfil' => null,
                'mascota_favorita_hash' => Hash::make('admin'),
            ]
        );
    }
}
