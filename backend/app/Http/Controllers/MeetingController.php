<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Services\Notify;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MeetingController extends Controller
{
    /**
     * Registrar presencia del usuario en la sala de espera (TTL 5 min).
     */
    public function joinWaitingRoom(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        $user = $request->user();

        // Check acceso
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        $cacheKey = "meeting:{$meetingId}:user:{$user->id}";

        // Log::info('JOIN WAITING ROOM', [
        //     'meeting_id' => $meetingId,
        //     'user_id'    => $user->id,
        //     'cache_key'  => $cacheKey,
        //     'driver'     => config('cache.default'),
        // ]);

        Cache::put($cacheKey, true, 300); // 300s = 5 minutos

        return response()->json(['success' => true]);
    }

    /**
     * Estado de la sala de espera (presencia en cache).
     */
    public function getWaitingRoomStatus(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        $user = $request->user();

        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        $instructorConnected = Cache::get("meeting:{$meetingId}:user:{$reserva->instructor_id}") ? true : false;
        $alumnoConnected     = Cache::get("meeting:{$meetingId}:user:{$reserva->alumno_id}") ? true : false;
        $isInstructor        = $user->id === $reserva->instructor_id;

        // Log::info('WAITING ROOM STATUS', [
        //     'meeting_id'            => $meetingId,
        //     'instructor_id'         => $reserva->instructor_id,
        //     'alumno_id'             => $reserva->alumno_id,
        //     'instructor_connected'  => $instructorConnected,
        //     'alumno_connected'      => $alumnoConnected,
        // ]);

        return response()->json([
            'instructor_connected' => $instructorConnected,
            'alumno_connected'     => $alumnoConnected,
            'both_connected'       => $instructorConnected && $alumnoConnected,
            'current_user_role'    => $isInstructor ? 'instructor' : 'alumno',
        ]);
    }

    /**
     * Inicia la reunión (solo instructor) y notifica al alumno.
     */
    public function start(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        $user    = $request->user();

        if ($user->id !== $reserva->instructor_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (is_null($reserva->meeting_started_at)) {
            // Log::info('MEETING START', [
            //     'reserva_id' => $reserva->id,
            //     'meeting_id' => $meetingId,
            // ]);

            $reserva->update([
                'meeting_started_at' => now(),
                'estado'             => 'en_curso',
            ]);

            $joinUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/')
                . "/webrtc?meeting_id={$reserva->meeting_id}"
                . "&current_user_id={$reserva->alumno_id}"
                . "&other_user_id={$reserva->instructor_id}";

            Notify::send($reserva->alumno_id, 'meeting.iniciada', [
                'reserva_id' => $reserva->id,
                'meeting_id' => $reserva->meeting_id,
                'join_url'   => $joinUrl,
            ]);
        }

        return response()->json(['started' => true]);
    }

    /**
     * Devuelve datos de la reunión para la sala de espera.
     */
    public function show(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)
            ->with(['instructor', 'alumno'])
            ->firstOrFail();

        $user        = $request->user();
        $isInstructor = $user->id === $reserva->instructor_id;

        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        return response()->json([
            'reserva' => [
                'id'                 => $reserva->id,
                'meeting_id'         => $reserva->meeting_id,
                'estado'             => $reserva->estado,
                'meeting_started_at' => $reserva->meeting_started_at,
                'instructor_id'      => $reserva->instructor_id,
                'alumno_id'          => $reserva->alumno_id,

                // current_user = quien hace la request
                'current_user' => [
                    'user_id' => $user->id,
                    'name'    => $user->name,
                    'email'   => $user->email,
                ],
                // other_user = la contraparte
                'other_user' => [
                    'user_id' => $isInstructor ? $reserva->alumno->id : $reserva->instructor->id,
                    'name'    => $isInstructor ? $reserva->alumno->name  : $reserva->instructor->name,
                    'email'   => $isInstructor ? $reserva->alumno->email : $reserva->instructor->email,
                ],
            ],
            'isInstructor'   => $isInstructor,
            'meetingStarted' => !is_null($reserva->meeting_started_at),
        ]);
    }

    /**
     * Polling simple: ¿la reunión ya comenzó?
     */
    public function status(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->first();

        if (!$reserva) {
            return response()->json(['error' => 'Meeting not found'], 404);
        }

        $user = $request->user();
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        $started = !is_null($reserva->meeting_started_at);

        // Log::info('MEETING STATUS', [
        //     'meeting_id' => $meetingId,
        //     'user_id'    => $user->id,
        //     'started'    => $started,
        //     'estado'     => $reserva->estado,
        // ]);

        return response()->json([
            'started' => $started,
            'estado'  => $reserva->estado,
        ]);
    }

    /**
     * Estado resumido (compat).
     */
    public function meetingStatus(string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->first();

        if (!$reserva) {
            return response()->json(['error' => 'Meeting not found'], 404);
        }

        return response()->json([
            'meeting_started' => !is_null($reserva->meeting_started_at),
            'estado'          => $reserva->estado,
            'started_at'      => $reserva->meeting_started_at,
        ]);
    }

    /**
     * Finalizar reunión (cualquiera de las partes).
     */
    public function end(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        $user    = $request->user();

        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        $reserva->update([
            'meeting_ended_at' => now(),
            'estado'           => 'finalizada',
        ]);

        return response()->json(['success' => true]);
    }
}
