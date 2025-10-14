<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class MeetingController extends Controller
{
    public function join($meetingId)
    {
        // Buscar la reserva por meeting_id
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();
        
        // Verificar que el usuario tenga acceso
        $user = Auth::user();
        if ($user->id !== $reserva->instructor_id && $user->id !== $reserva->alumno_id) {
            abort(403, 'No tienes acceso a esta reunión');
        }

        // Determinar el rol del usuario en la reunión
        $isInstructor = $user->id === $reserva->instructor_id;
        $otherUser = $isInstructor ? $reserva->alumno : $reserva->instructor;

        return view('meeting.join', [
            'reserva' => $reserva,
            'isInstructor' => $isInstructor,
            'otherUser' => $otherUser,
            'meetingId' => $meetingId
        ]);
    }

    public function start(Request $request, string $meetingId): JsonResponse
    {
        $reserva = Reserva::where('meeting_id', $meetingId)->firstOrFail();

        // Solo el instructor puede iniciar
        if ($request->user()->id !== $reserva->instructor_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $reserva->update([
            'meeting_started_at' => now(),
            'estado' => 'en_curso'
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
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'other_user' => [
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
    
        $reserva->update([
            'meeting_started_at' => !is_null($reserva->meeting_started_at), // ← ESTE es el campo importante
            'estado' => $reserva->estado
        ]);
    
        return response()->json(['success' => true]);
    }

}