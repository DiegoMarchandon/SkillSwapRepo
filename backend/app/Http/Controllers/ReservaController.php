<?php

namespace App\Http\Controllers;

use App\Models\Disponibilidad;
use App\Models\Reserva;
use App\Models\Resena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Services\Notify;


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
                ->lockForUpdate()
                ->firstOrFail();

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

            // 🔹 Generar un meeting_id consistente para todo el flujo
            $meetingId = 'meet-' . time() . '-' . Str::upper(Str::random(6));

            return Reserva::create([
                'disponibilidad_id' => $slot->id,
                'instructor_id'     => $slot->instructor_id,
                'alumno_id'         => $userId,
                'estado'            => 'confirmada',
                'habilidad_id'      => $slot->habilidad_id,
                // mantener compatibilidad si ya usaban este campo:
                'enlace_reunion'    => $meetingId,
                // campo nuevo que usa el flujo de /meeting y /webrtc
                'meeting_id'        => $meetingId,
            ]);
        });

        $joinUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/')
            . "/meeting/{$reserva->meeting_id}";

        Notify::send($reserva->instructor_id, 'reserva.creada', [
            'reserva_id' => $reserva->id,
            'alumno'     => ['id' => $reserva->alumno_id, 'name' => $reserva->alumno->name ?? ''],
            'meeting_id' => $reserva->meeting_id,
            'join_url'   => $joinUrl, // ← ahora apunta a /meeting/:id
        ]);

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

        $nuevoEstado = null;

        if (now()->lt($reserva->disponibilidad->inicio_utc)) {
            DB::transaction(function () use ($reserva, &$nuevoEstado) {
                $reserva->update(['estado' => 'cancelada']);
                $reserva->disponibilidad->update(['estado' => 'libre']);
                $nuevoEstado = 'cancelada';
            });
        } else {
            $reserva->update(['estado' => 'interrumpida']);
            $nuevoEstado = 'interrumpida';
        }

        //  Notificaciones (a ambos)
        $tipo = $nuevoEstado === 'cancelada' ? 'reserva.cancelada' : 'reserva.interrumpida';

        Notify::send($reserva->instructor_id, $tipo, [
            'reserva_id' => $reserva->id,
            'by'         => $user->id,
        ]);

        Notify::send($reserva->alumno_id, $tipo, [
            'reserva_id' => $reserva->id,
            'by'         => $user->id,
        ]);

        return response()->json(['ok' => true]);
    }


    public function misReservas(Request $r)
    {
        $userId = $r->user()->id;

        $reservas = Reserva::with([
            'disponibilidad:id,inicio_utc,fin_utc,instructor_id,habilidad_id',
            'instructor:id,name,email',
        ])
            ->where('alumno_id', $userId)
            ->orderByDesc('id')
            ->get();

        $items = $reservas->map(function ($res) use ($userId) {
            $disp = $res->disponibilidad; // puede ser null en datos viejos

            // ¿ya calificó esta reserva?
            $resenaExistente = Resena::where('reserva_id', $res->id)
                ->where('emisor_id', $userId)
                ->exists();

            return [
                'id'            => $res->id,
                'estado'        => $res->estado,
                'meeting_id'    => $res->meeting_id ?? $res->enlace_reunion, // fallback
                'instructor_id' => $res->instructor_id,
                'alumno_id'     => $res->alumno_id,
                'instructor'    => [
                    'id'    => $res->instructor?->id,
                    'name'  => $res->instructor?->name,
                    'email' => $res->instructor?->email,
                ],
                // null-safe + método estable de Carbon
                'inicio_utc'    => $disp?->inicio_utc?->toIso8601String(),
                'fin_utc'       => $disp?->fin_utc?->toIso8601String(),
                'habilidad_id'  => $disp?->habilidad_id,

                'resena_existente' => $resenaExistente,
            ];
        });

        return response()->json(['data' => $items]);
    }
}
