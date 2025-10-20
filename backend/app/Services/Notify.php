<?php

namespace App\Services;

use App\Models\Notificacion;

class Notify
{
    public static function send(int $userId, string $tipo, array $data = []): Notificacion
    {
        $n = Notificacion::create(['user_id' => $userId, 'tipo' => $tipo, 'data' => $data]);

        return $n;
    }
}
