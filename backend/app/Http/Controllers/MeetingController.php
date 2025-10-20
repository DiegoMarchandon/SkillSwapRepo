<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\Notify;


class MeetingController extends Controller
{

    /**
     * Join the waiting room for a meeting.
     *
     * @param Request $request
     * @param string $meetingId
     * @return JsonResponse
     */

    public function joinWaitingRoom(Request $request, string $meetingId): JsonResponse
    {
        // Buscar la reserva por meeting_id
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        $user = $request->user();

        // Verificar que el usuario tenga acceso (instructor o alumno)
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        // Guardar en cache que el usuario está en la sala (5 minutos)
        $cacheKey = "meeting:{$meetingId}:user:{$user->id}";

        // DEBUG: Ver qué se está guardando
        Log::info("JOIN WAITING ROOM - Saving to cache", [
            'meeting_id' => $meetingId,
            'user_id' => $user->id,
            'cache_key' => $cacheKey,
            'cache_driver' => config('cache.default')
        ]);
        Cache::put($cacheKey, true, 300); // 5 minutos

        // Verificar que se guardó
        $savedValue = Cache::get($cacheKey);
        Log::info("JOIN WAITING ROOM - Cache saved verification", [
            'cache_key' => $cacheKey,
            'saved_value' => $savedValue ? 'YES' : 'NO'
        ]);

        // Devolver una respuesta exitosa si el usuario se ha unido a la sala
        return response()->json(['success' => true]);
    }

    /**
     * Devuelve el estado actual de la sala de espera.
     * Si el instructor y el alumno están conectados, devuelve true en "both_connected".
     * Si solo el instructor o el alumno están conectados, devuelve true en "instructor_connected" o "alumno_connected" respectivamente.
     * Si ni el instructor ni el alumno están conectados, devuelve false en "both_connected".
     * Devuelve el rol del usuario actual en "current_user_role".
     *
     * @param Request $request
     * @param string $meetingId
     * @return JsonResponse
     */
    public function getWaitingRoomStatus(Request $request, string $meetingId): JsonResponse
    {
        // Buscar la reserva por meeting_id
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        $user = $request->user();

        // Verificar que el usuario tenga acceso (instructor o alumno)
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        // Verificar presencia real en cache
        $instructorConnected = Cache::get("meeting:{$meetingId}:user:{$reserva->instructor_id}");
        $alumnoConnected = Cache::get("meeting:{$meetingId}:user:{$reserva->alumno_id}");
        $isInstructor = $user->id === $reserva->instructor_id;

        // LOG REAL - ver en storage/logs/laravel.log
        Log::info("PRESENCE DEBUG - Meeting: {$meetingId}", [
            'instructor_id' => $reserva->instructor_id,
            'alumno_id' => $reserva->alumno_id,
            'instructor_connected' => $instructorConnected ? 'YES' : 'NO',
            'alumno_connected' => $alumnoConnected ? 'YES' : 'NO',
            'cache_keys' => [$instructorConnected, $alumnoConnected]
        ]);

        return response()->json([
            'instructor_connected' => (bool) $instructorConnected,
            'alumno_connected' => (bool) $alumnoConnected,
            'both_connected' => $instructorConnected && $alumnoConnected,
            'current_user_role' => $isInstructor ? 'instructor' : 'alumno'
        ]);
    }

    public function start(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();

        Log::info("BEFORE UPDATE - meeting_started_at:", [
            'current_value' => $reserva->meeting_started_at,
            'new_value' => now(),
            'reserva_id' => $reserva->id
        ]);

        // Solo el instructor puede iniciar
        if ($request->user()->id !== $reserva->instructor_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $reserva->update([
            'meeting_started_at' => now(),
            'estado' => 'en_curso'
        ]);
        $reserva->save();

        // Verificar que se actualizó
        $reserva->refresh();
        Log::info("AFTER UPDATE - meeting_started_at:", [
            'new_estado' => $reserva->estado,
            'new_meeting_started_at' => $reserva->meeting_started_at
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


        return response()->json(['success' => true]);
    }

    public function show(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)
            ->with(['instructor', 'alumno'])
            ->firstOrFail();

        $user = $request->user();
        $isInstructor = $user->id === $reserva->instructor_id;

        // Verificar acceso
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        return response()->json([
            'reserva' => [
                'id' => $reserva->id,
                'meeting_id' => $reserva->meeting_id,
                'estado' => $reserva->estado,
                'meeting_started_at' => $reserva->meeting_started_at,
                'current_user' => [
                    'user_id' => $isInstructor ? $reserva->alumno->id : $reserva->instructor->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'other_user' => [
                    'user_id' => $isInstructor ? $reserva->instructor->id : $reserva->alumno->id,
                    'name' => $isInstructor ? $reserva->alumno->name : $reserva->instructor->name,
                    'email' => $isInstructor ? $reserva->alumno->email : $reserva->instructor->email,
                ]
            ],
            'isInstructor' => $isInstructor,
            'meetingStarted' => !is_null($reserva->meeting_started_at)
        ]);
    }

    public function status(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->first();

        if (!$reserva) {
            return response()->json(['error' => 'Meeting not found'], 404);
        }

        // Verificar que el usuario tenga acceso (instructor o alumno)
        $user = $request->user();

        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        // DEBUG: Ver estado real de la reunión
        Log::info("STATUS CHECK - Meeting: {$meetingId}", [
            'user_id' => $user->id,
            'meeting_started_at' => $reserva->meeting_started_at,
            'estado' => $reserva->estado,
            'started' => !is_null($reserva->meeting_started_at)
        ]);

        // $reserva->update([
        //     'meeting_started_at' => !is_null($reserva->meeting_started_at), // ← ESTE es el campo importante
        //     'estado' => $reserva->estado
        // ]);

        return response()->json([
            'success' => true,
            'started' => !is_null($reserva->meeting_started_at),
            'estado' => $reserva->estado
        ]);
    }

    public function meetingStatus(string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->first();

        if (!$reserva) {
            return response()->json(['error' => 'Meeting not found'], 404);
        }

        return response()->json([
            'meeting_started' => !is_null($reserva->meeting_started_at),
            'estado' => $reserva->estado,
            'started_at' => $reserva->meeting_started_at
        ]);
    }

    public function end(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();

        // Verificar que el usuario tenga acceso
        $user = $request->user();
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            return response()->json(['error' => 'No access'], 403);
        }

        $reserva->update([
            'meeting_ended_at' => now(),
            'estado' => 'finalizada'
        ]);

        return response()->json(['success' => true]);
    }
}
