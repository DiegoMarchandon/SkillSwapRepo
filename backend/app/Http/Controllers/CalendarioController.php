<?php

namespace App\Http\Controllers;

use App\Models\Disponibilidad;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function show($id, \Illuminate\Http\Request $r)
    {
        $r->validate([
            'from' => ['required', 'date'],
            'to'   => ['required', 'date', 'after:from'],

            'skill_id'              => ['nullable', 'integer'],
            'usuario_habilidad_id'  => ['nullable', 'integer'],
        ]);

        // Resolver habilidad efectiva
        $habilidadId = null;

        if ($r->filled('skill_id')) {
            $habilidadId = (int) $r->input('skill_id'); // se asume viene de tabla habilidad
        } elseif ($r->filled('usuario_habilidad_id')) {
            $pivot = \DB::table('usuario_habilidad')
                ->select('habilidad_id')
                ->where('id', (int) $r->input('usuario_habilidad_id'))
                ->first();
            if ($pivot) $habilidadId = (int) $pivot->habilidad_id;
        }

        $q = \App\Models\Disponibilidad::with(['reserva' => function ($q) {
            $q->select('id', 'disponibilidad_id', 'alumno_id', 'estado');
        }])
            ->where('instructor_id', $id)
            ->whereBetween('inicio_utc', [$r->from, $r->to]);

        if ($habilidadId) {
            $q->where('habilidad_id', $habilidadId);
        }

        $slots = $q->orderBy('inicio_utc')->get()->map(function ($s) use ($r, $id) {
            $u = $r->user();
            return [
                'id'         => $s->id,
                'inicio_utc' => $s->inicio_utc->toISOString(),
                'fin_utc'    => $s->fin_utc->toISOString(),
                'estado'     => $s->estado,
                'reserva'    => $s->reserva ? [
                    'id'        => $s->reserva->id,
                    'estado'    => $s->reserva->estado,
                    'alumno_id' => ($u && (int)$u->id === (int)$id) ? $s->reserva->alumno_id : null,
                ] : null,
            ];
        });

        return response()->json(['data' => $slots]);
    }
}
