<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Str;

class MigrateUserAvatars extends Command
{
    protected $signature = 'avatars:migrate';
    protected $description = 'Cambia avatar_path roto por avatar_seed basado en DiceBear';

    public function handle()
    {
        $users = User::all();

        foreach ($users as $user) {
            // Si ya tiene seed, saltamos
            if (!empty($user->avatar_seed)) continue;

            // Generar un seed único
            $user->avatar_seed = uniqid('user_');
            $user->avatar_path = null; // Limpiamos path viejo
            $user->save();

            $this->info("✔ Usuario {$user->id} actualizado");
        }

        $this->info("🎉 Migración completada con éxito.");
    }
}
