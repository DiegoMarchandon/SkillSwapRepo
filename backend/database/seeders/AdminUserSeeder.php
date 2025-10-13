<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'admin123',
            'email' => 'admin123@example.com',
            'password' => Hash::make('12345678'),
            'rol' => 'admin',
            'creditos' => 0,
            'condicion' => 'activo',
            'email_verified_at' => now(),
        ]);

        $this->command->info('Usuario administrador creado exitosamente!');
    }
}
