<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Call;
use App\Models\User;

class AdminController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $range = $request->query('range', 'today');
        
        $query = Call::when($range === 'today', function($q) {
                $q->whereDate('created_at', today());
            })
            ->when($range === 'week', function($q) {
                $q->where('created_at', '>=', now()->subWeek());
            })
            ->when($range === 'month', function($q) {
                $q->where('created_at', '>=', now()->subMonth());
            });

        return response()->json([
            'totalCalls' => $query->count(),
            'activeCalls' => $query->where('status', 'active')->count(),
            'avgDuration' => $query->avg('duration_seconds') ?? 0,
            'avgQuality' => 85, // Aquí calcularías basado en métricas
            // ... más stats según necesites
        ]);
    }

    public function getCalls(Request $request)
    {
        $range = $request->query('range', 'today');
        
        $calls = Call::with('metrics')
            ->when($range === 'today', function($q) {
                $q->whereDate('created_at', today());
            })
            ->when($range === 'week', function($q) {
                $q->where('created_at', '>=', now()->subWeek());
            })
            ->when($range === 'month', function($q) {
                $q->where('created_at', '>=', now()->subMonth());
            })
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($calls);
    }

    public function getUsers()
    {
        $users = User::withCount(['callsAsCaller', 'callsAsReceiver'])
            ->with(['skills'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($user) {
                // Calcular estadísticas manualmente
                $callsAsCaller = Call::where('caller_id', $user->id)->count();
                $callsAsReceiver = Call::where('receiver_id', $user->id)->count();
            
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'stats' => [
                        'total_sessions' => $callsAsCaller + $callsAsReceiver,
                        'as_instructor' => $callsAsCaller,
                        'as_student' => $callsAsReceiver,
                    ]
                ];
            });

        return response()->json($users);
    }

    public function getUserSessions($userId)
    {
        $sessions = Call::where('caller_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['metrics', 'caller', 'receiver', 'usuarioHabilidad.habilidad'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($call) use ($userId) {
                $duration = null;
                if ($call->started_at && $call->ended_at) {
                    $start = \Carbon\Carbon::parse($call->started_at);
                    $end = \Carbon\Carbon::parse($call->ended_at);
                    $duration = $start->diffInMinutes($end);
                }
                return [
                    'id' => $call->id,
                    'instructor_id' => $call->caller_id,
                    'student_id' => $call->receiver_id,
                    'skill_name' => $call->habilidad_nombre,
                    'started_at' => $call->started_at,
                    'ended_at' => $call->ended_at,
                    'duration_minutes' => $duration,
                    'role' => $call->caller_id == $userId ? 'instructor' : 'estudiante',
                    'metrics' => $call->metrics
                ];
            });

        return response()->json($sessions);
    }
}
