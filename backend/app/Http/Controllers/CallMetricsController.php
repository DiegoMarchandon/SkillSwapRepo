<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CallMetric;
use App\Models\Call;

class CallMetricsController extends Controller
{
    public function store(Request $request)
    {

        // dd($request->all()); // Debug: imprimir los datos recibidos
        // Validación completa de call_id y metrics
        $validated = $request->validate([
            'call_id' => 'required|integer|exists:calls,id',
            'metrics' => 'required|array',
            'metrics.*.timestamp' => 'required|numeric',
            'metrics.*.bytesSent' => 'nullable|numeric',
            'metrics.*.bytesReceived' => 'nullable|numeric',
            'metrics.*.framesPerSecond' => 'nullable|numeric',
            'metrics.*.roundTripTime' => 'nullable|numeric',
            'metrics.*.packetsLost' => 'nullable|integer',
            'metrics.*.jitter' => 'nullable|numeric',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Usuario no autenticado o token inválido',
            ], 401);
        }else{
            return response()->json(['message' => 'Usuario autenticado'], 200);
        }

        $userId = $user->id;

        // $userId = $request->user()->id;

        $call = Call::find($validated['call_id']);
        if (!$call) {
            return response()->json(['error' => 'Llamada no encontrada'], 404);
        }else{
            return response()->json(['message' => 'Llamada encontrada'], 200);
        }

        // dd($validated);
        foreach ($validated['metrics'] as $metric) {
            CallMetric::create([
                // 'call_id' => $validated['call_id'],
                'call_id' => $call->id,
                'user_id' => $userId,
                'timestamp' => isset($metric['timestamp']) ? floor($metric['timestamp']/1000) : now()->timestamp,
                'bytes_sent' => $metric['bytesSent'] ?? null,
                'bytes_received' => $metric['bytesReceived'] ?? null,
                'fps' => $metric['framesPerSecond'] ?? null,
                'latency' => $metric['roundTripTime'] ?? null,
                'packets_lost' => $metric['packetsLost'] ?? null,
                'jitter' => $metric['jitter'] ?? null,
            ]);
        }

        return response()->json(['message' => 'Métricas guardadas con éxito.']);
    }
}
