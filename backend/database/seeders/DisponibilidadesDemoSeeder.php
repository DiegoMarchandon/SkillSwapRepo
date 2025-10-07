<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Disponibilidad;
use App\Models\User;
use Carbon\Carbon;

class DisponibilidadesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::query()->first();
        if (!$instructor) return;

        $tz = 'America/Argentina/Buenos_Aires';

        for ($d = 1; $d <= 5; $d++) {
            for ($h = 15; $h <= 18; $h++) {
                $inicioLocal = Carbon::now($tz)->startOfDay()->addDays($d)->setTime($h, 0);
                $finLocal    = (clone $inicioLocal)->addHour();

                $inicioUtc = $inicioLocal->clone()->setTimezone('UTC');
                $finUtc    = $finLocal->clone()->setTimezone('UTC');

                Disponibilidad::firstOrCreate([
                    'instructor_id' => $instructor->id,
                    'inicio_utc'    => $inicioUtc,
                    'fin_utc'       => $finUtc,
                ], [
                    'estado'        => 'libre',
                    'nota'          => 'Demo',
                ]);
            }
        }
    }
}
