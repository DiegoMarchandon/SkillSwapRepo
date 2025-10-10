<?php

namespace App\Http\Controllers;

use App\Models\Disponibilidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DisponibilidadController extends Controller
{
    public function store($id, Request $r)
    {
        if ((int)$r->user()->id !== (int)$id) abort(403, 'No autorizado');

        // Estructura general
        $data = $r->validate([
            'habilidad_id'          => ['nullable', 'integer'],
            'usuario_habilidad_id'  => ['nullable', 'integer'],
            'slots'                 => ['required', 'array', 'min:1'],
        ]);

        // Resolver la habilidad real
        $habilidadId = null;

        // 1) Si viene usuario_habilidad_id, priorizarlo
        if (!empty($data['usuario_habilidad_id'])) {
            $pivot = \DB::table('usuario_habilidad')
                ->where('id', $data['usuario_habilidad_id'])
                ->where('user_id', $id) // seguridad: pivote del mismo usuario
                ->first();

            if (!$pivot) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'usuario_habilidad_id' => 'usuario_habilidad inválido.'
                ]);
            }
            $habilidadId = (int) $pivot->habilidad_id;
        }

        // 2) Si no se resolvió aún y viene habilidad_id…
        if (!$habilidadId && !empty($data['habilidad_id'])) {
            // ¿Existe como id de la tabla habilidad?
            $exists = \DB::table('habilidad')->where('id', $data['habilidad_id'])->exists();
            if ($exists) {
                $habilidadId = (int) $data['habilidad_id'];
            } else {
                // …si no existe, intentar tomarlo como id de pivote (backward-compat)
                $pivot = \DB::table('usuario_habilidad')
                    ->where('id', $data['habilidad_id'])
                    ->where('user_id', $id)
                    ->first();
                if ($pivot) {
                    $habilidadId = (int) $pivot->habilidad_id;
                }
            }
        }

        // 3) Validación final
        if (!$habilidadId || !\DB::table('habilidad')->where('id', $habilidadId)->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'habilidad_id' => 'Habilidad inexistente.'
            ]);
        }

        // 4) Validar y crear slots
        $creados = [];
        foreach ($r->input('slots') as $slot) {
            \Validator::make($slot, [
                'inicio_utc' => ['required', 'date'],
                'fin_utc'    => ['required', 'date', 'after:inicio_utc'],
                'nota'       => ['nullable', 'string', 'max:120'],
            ])->validate();

            $creados[] = \App\Models\Disponibilidad::firstOrCreate([
                'instructor_id' => $id,
                'inicio_utc'    => $slot['inicio_utc'],
                'fin_utc'       => $slot['fin_utc'],
            ], [
                'estado'       => 'libre',
                'nota'         => $slot['nota'] ?? null,
                'habilidad_id' => $habilidadId,  // <- se guarda la habilidad real
            ]);
        }

        return response()->json(['data' => $creados], 201);
    }
}
