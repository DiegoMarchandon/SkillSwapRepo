<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function dashboardStats(Request $request)
    {
        // Solo admin por ROL
        if (!$request->user() || $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $range = $request->query('range', 'today');

        if (!Schema::hasTable('calls')) {
            return response()->json([
                'totalCalls'  => 0,
                'activeCalls' => 0,
                'avgDuration' => 0.0,
                'avgQuality'  => 85,
            ]);
        }

        $q = DB::table('calls');
        if ($range === 'today')      $q->whereDate('created_at', today());
        elseif ($range === 'week')   $q->where('created_at', '>=', now()->subWeek());
        elseif ($range === 'month')  $q->where('created_at', '>=', now()->subMonth());

        $total  = (clone $q)->count();
        $active = (clone $q)->where('status', 'active')->count();
        $avgDur = (float) ((clone $q)->avg('duration_seconds') ?? 0);

        return response()->json([
            'totalCalls'  => $total,
            'activeCalls' => $active,
            'avgDuration' => $avgDur,
            'avgQuality'  => 85,
        ]);
    }

    public function getUsers(Request $request)
    {
        if (!$request->user() || $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $users = DB::table('users')
                ->select('id', 'name', 'email', 'created_at', 'rol')
                ->orderBy('created_at', 'desc')
                ->get();

            if (!Schema::hasTable('calls')) {
                return response()->json($users->map(fn($u) => [
                    'id'    => $u->id,
                    'name'  => $u->name,
                    'email' => $u->email,
                    'created_at' => $u->created_at,
                    'rol'   => $u->rol,
                    'stats' => [
                        'total_sessions' => 0,
                        'as_instructor'  => 0,
                        'as_student'     => 0,
                    ],
                ])->values());
            }

            // Columnas tolerantes a esquemas distintos
            $callerCol   = Schema::hasColumn('calls', 'caller_id')   ? 'caller_id'
                : (Schema::hasColumn('calls', 'instructor_id') ? 'instructor_id' : null);
            $receiverCol = Schema::hasColumn('calls', 'receiver_id') ? 'receiver_id'
                : (Schema::hasColumn('calls', 'student_id')    ? 'student_id'    : null);

            $asInstructor = collect();
            $asStudent    = collect();

            if ($callerCol) {
                $asInstructor = DB::table('calls')
                    ->select("$callerCol as user_id", DB::raw('COUNT(*) as c'))
                    ->groupBy($callerCol)
                    ->pluck('c', 'user_id');
            }
            if ($receiverCol) {
                $asStudent = DB::table('calls')
                    ->select("$receiverCol as user_id", DB::raw('COUNT(*) as c'))
                    ->groupBy($receiverCol)
                    ->pluck('c', 'user_id');
            }

            $out = $users->map(function ($u) use ($asInstructor, $asStudent) {
                $inst = (int) $asInstructor->get($u->id, 0);
                $stud = (int) $asStudent->get($u->id, 0);
                return [
                    'id'    => $u->id,
                    'name'  => $u->name,
                    'email' => $u->email,
                    'created_at' => $u->created_at,
                    'rol'   => $u->rol,
                    'stats' => [
                        'total_sessions' => $inst + $stud,
                        'as_instructor'  => $inst,
                        'as_student'     => $stud,
                    ],
                ];
            });

            return response()->json($out->values());
        } catch (\Throwable $e) {
            Log::error('admin.getUsers error', [
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUserSessions(Request $request, $userId)
    {
        if (!$request->user() || $request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            if (!Schema::hasTable('calls')) {
                return response()->json([]);
            }

            $calls = DB::table('calls')
                ->when(
                    Schema::hasTable('usuario_habilidad') &&
                        Schema::hasTable('habilidades') &&
                        Schema::hasColumn('calls', 'usuario_habilidad_id'),
                    function ($q) {
                        $q->leftJoin('usuario_habilidad', 'calls.usuario_habilidad_id', '=', 'usuario_habilidad.id')
                            ->leftJoin('habilidades', 'usuario_habilidad.habilidad_id', '=', 'habilidades.id');
                    }
                )
                ->where(function ($q) use ($userId) {
                    $q->where('caller_id', $userId)->orWhere('receiver_id', $userId);
                })
                ->orderBy('calls.created_at', 'desc')
                ->get([
                    'calls.*',
                    DB::raw(Schema::hasTable('habilidades') ? 'habilidades.nombre as habilidad_nombre' : 'NULL as habilidad_nombre'),
                ]);

            $sessions = $calls->map(function ($c) use ($userId) {
                $duration = null;
                if ($c->started_at && $c->ended_at) {
                    $start = \Carbon\Carbon::parse($c->started_at);
                    $end   = \Carbon\Carbon::parse($c->ended_at);
                    $duration = $start->diffInMinutes($end);
                }
                return [
                    'id'               => $c->id,
                    'instructor_id'    => $c->caller_id,
                    'student_id'       => $c->receiver_id,
                    'skill_name'       => $c->habilidad_nombre,
                    'started_at'       => $c->started_at,
                    'ended_at'         => $c->ended_at,
                    'duration_minutes' => $duration,
                    'role'             => ((int)$c->caller_id === (int)$userId) ? 'instructor' : 'student',
                    'metrics'          => [],
                ];
            });

            return response()->json($sessions->values());
        } catch (\Throwable $e) {
            Log::error('admin.getUserSessions error', [
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
