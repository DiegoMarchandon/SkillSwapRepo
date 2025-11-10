<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Str;

class GenerateUserAvatars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'avatars:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera y asigna avatares aleatorios a los usuarios sin avatar_path usando DiceBear';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::whereNull('avatar_path')->get();

        if ($users->isEmpty()) {
            $this->info('✅ No hay usuarios pendientes.');
            return;
        }

        $this->info('🧩 Generando avatares para ' . $users->count() . ' usuarios...');

        foreach ($users as $user) {
            try {
                // Generar un seed único (puede ser nombre, id, o algo aleatorio)
                $seed = urlencode($user->name ?? Str::random(8));

                // URL del avatar desde la API de DiceBear (puede ser SVG o PNG)
                $url = "https://api.dicebear.com/9.x/bottts-neutral/png?seed={$seed}&size=128";

                // Descargar el avatar
                $image = file_get_contents($url);

                if ($image === false) {
                    $this->error("⚠️ No se pudo generar avatar para {$user->id}");
                    continue;
                }

                // Guardar en storage
                $fileName = "avatars/user_{$user->id}.png";
                Storage::disk('public')->put($fileName, $image);

                // Guardar en la base de datos
                $user->avatar_path = "/storage/{$fileName}";
                $user->save();

                $this->info("✅ Avatar generado para {$user->id}");
            } catch (\Exception $e) {
                $this->error("❌ Error con el usuario {$user->id}: " . $e->getMessage());
            }
        }

        $this->info('🎉 Proceso completado.');
    }
}
