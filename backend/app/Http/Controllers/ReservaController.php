<?php

namespace App\Http\Controllers;

use App\Models\Disponibilidad;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReservaController extends Controller
{
    public function store(Request $r)
    {
        $data = $r->validate([
            'disponibilidad_id' => ['required', 'integer', 'exists:disponibilidades,id'],
        ]);
        $userId = $r->user()->id;

        $reserva = DB::transaction(function () use ($data, $userId) {
            $slot = Disponibilidad::where('id', $data['disponibilidad_id'])
                ->lockForUpdate()->firstOrFail();

            if ($slot->estado !== 'libre') {
                throw ValidationException::withMessages(['disponibilidad_id' => 'El horario ya no está disponible.']);
            }
            if ($slot->inicio_utc->isPast()) {
                throw ValidationException::withMessages(['disponibilidad_id' => 'No se puede reservar un horario pasado.']);
            }
            if ((int)$slot->instructor_id === (int)$userId) {
                throw ValidationException::withMessages(['disponibilidad_id' => 'No podés reservar tu propio horario.']);
            }

            $slot->update(['estado' => 'tomada']);

            return Reserva::create([
                'disponibilidad_id' => $slot->id,
                'instructor_id'     => $slot->instructor_id,
                'alumno_id'         => $userId,
                'estado'            => 'confirmada',
                'enlace_reunion'    => (string) Str::uuid(),
            ]);
        });

        return response()->json(['data' => $reserva], 201);
    }

    public function cancelar($id, Request $r)
    {
        $reserva = Reserva::with('disponibilidad')->findOrFail($id);

        $user = $r->user();
        $esAlumno = (int)$reserva->alumno_id === (int)$user->id;
        $esInstructor = (int)$reserva->instructor_id === (int)$user->id;
        if (!$esAlumno && !$esInstructor) abort(403, 'No autorizado');

        if (!in_array($reserva->estado, ['confirmada', 'pendiente'])) {
            throw ValidationException::withMessages(['id' => 'La reserva no se puede cancelar en este estado.']);
        }

        if (now()->lt($reserva->disponibilidad->inicio_utc)) {
            DB::transaction(function () use ($reserva) {
                $reserva->update(['estado' => 'cancelada']);
                $reserva->disponibilidad->update(['estado' => 'libre']);
            });
        } else {
            $reserva->update(['estado' => 'interrumpida']);
        }

        return response()->json(['ok' => true]);
    }
}
