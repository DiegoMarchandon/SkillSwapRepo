<?php

namespace App\Http\Controllers;

use App\Models\Resena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResenaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'reserva_id' => 'required|exists:reservas,id',
            'receptor_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000'
        ]);

        // Verificar que el usuario no haya ya calificado esta sesión
        $existingResena = Resena::where('reserva_id', $request->reserva_id)
            ->where('emisor_id', Auth::id())
            ->first();

        if ($existingResena) {
            return response()->json([
                'message' => 'Ya has calificado esta sesión'
            ], 422);
        }

        try {
            $resena = Resena::create([
                'reserva_id' => $request->reserva_id,
                'emisor_id' => Auth::id(),
                'receptor_id' => $request->receptor_id,
                'rating' => $request->rating,
                'comentario' => $request->comentario
            ]);

            return response()->json([
                'message' => 'Reseña guardada exitosamente',
                'data' => $resena
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al guardar la reseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($reservaId)
    {
        $resena = Resena::where('reserva_id', $reservaId)
            ->where('emisor_id', Auth::id())
            ->first();

        return response()->json([
            'data' => $resena
        ]);
    }
}