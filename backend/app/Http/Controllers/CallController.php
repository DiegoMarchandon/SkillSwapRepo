<?php

namespace App\Http\Controllers;

use App\Models\Call;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CallController extends Controller
{
    /**
     * Muestra el historial de llamadas
     */
    public function index()
    {
        // Cargar todas las llamadas con información del llamador y receptor
        $calls = Call::with(['caller', 'receiver'])->orderBy('created_at', 'desc')->get();

        return response()->json($calls);
    }

    /**
     * Muestra una llamada específica con sus métricas
     */
    public function show($id)
    {
        // Buscar la llamada con las métricas y usuarios asociados
        $call = Call::with(['metrics.user', 'caller', 'receiver'])->findOrFail($id);

        return view('calls.show', compact('call'));
    }

    /**
     * (Opcional) Registra una nueva llamada
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'status' => 'nullable|string',
        ]);

        // Asignar el id del caller_id desde el usuario autenticado
        $validated['caller_id'] = Auth::id();
        $validated['started_at'] = now();

        // Crear la llamada
        $call = Call::create($validated);

        return response()->json(['id' => $call->id, 'call_id' => $call->id], 201);
    }
}

