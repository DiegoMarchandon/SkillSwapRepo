<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CallMetric;
use App\Models\Call;
use Illuminate\Support\Facades\Log;

class CallMetricsController extends Controller
{
    public function store(Request $request)
    {

        Log::info('CallMetrics store called', $request->all()); // Para debug
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
        }

        $userId = $user->id;

        // $userId = $request->user()->id;

        $call = Call::find($validated['call_id']);
        if (!$call) {
            return response()->json(['error' => 'Llamada no encontrada'], 404);
        }

        // dd($validated);
        foreach ($validated['metrics'] as $metric) {
            CallMetric::create([
                // 'call_id' => $validated['call_id'],
                'call_id' => $call->id,
                'user_id' => $userId,
                'timestamp' => isset($metric['timestamp']) ? date('Y-m-d H:i:s', $metric['timestamp']) : now()->format('Y-m-d H:i:s'), // Convertir a timestamp si es necesario, o usar la fecha actual si no se proporciona timestamp,
                'bytes_sent' => $metric['bytesSent'] ?? null,
                'bytes_received' => $metric['bytesReceived'] ?? null,
                'fps' => $metric['framesPerSecond'] ?? null,
                'latency' => $metric['roundTripTime'] ?? null,
                'packets_lost' => $metric['packetsLost'] ?? null,
                'jitter' => $metric['jitter'] ?? null,
            ]);
        }

        // Actualizar la llamada con ended_at
        $call->update([
            'ended_at' => now(),
            'status' => 'completed'
        ]);

        Log::info("Métricas guardadas y llamada actualizada. Métricas: " . count($validated['metrics']));

        return response()->json(['message' => 'Métricas guardadas con éxito.']);
    
    }
}