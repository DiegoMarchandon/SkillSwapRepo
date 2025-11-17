<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminController extends Controller
{
    public function getUsers(Request $r)
    {
        // El middleware 'admin' ya controló permisos.

        $q = trim((string) $r->input('q', ''));
        $filterByBlocked = $r->has('is_blocked');
        $blockedValue    = $r->boolean('is_blocked');

        $users = User::query()
            ->select(
                'id',
                'name',
                'email',
                'rol',
                'is_blocked',
                'blocked_reason',
                'blocked_by',
                'blocked_until',
                'blocked_at',
                'created_at'
            )
            ->when($q, function ($query) use ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                    if (ctype_digit($q)) $w->orWhere('id', (int) $q);
                });
            })
            ->when($filterByBlocked, fn($qq) => $qq->where('is_blocked', $blockedValue ? 1 : 0))
            ->orderByDesc('id')
            ->paginate(20);

        // Aseguramos que 'is_admin' (accesor basado en 'rol') aparezca en el JSON
        $users->getCollection()->transform(function ($u) {
            $u->is_admin = $u->is_admin;
            return $u;
        });

        return response()->json($users);
    }

    public function blockUser(Request $r, User $user)
    {
        // Evitamos que un admin se bloquee a sí mismo
        if ($r->user()->id === $user->id) {
            return response()->json(['message' => 'No podés bloquear tu propia cuenta.'], 422);
        }

        $data = $r->validate([
            'is_blocked'     => ['required', 'boolean'],
            'blocked_reason' => ['nullable', 'string', 'max:500'],
            'blocked_until'  => ['nullable', 'date'],
        ]);

        $isBlock = (bool) $data['is_blocked'];

        $user->fill([
            'is_blocked'     => $isBlock,
            'blocked_reason' => $data['blocked_reason'] ?? null,
            'blocked_until'  => $data['blocked_until']  ?? null,
            'blocked_by'     => $isBlock ? $r->user()->id : null,
            'blocked_at'     => $isBlock ? now() : null,
        ])->save();

        return response()->json([
            'ok'   => true,
            'user' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'rol'            => $user->rol,
                'is_admin'       => $user->is_admin,
                'is_blocked'     => (bool)$user->is_blocked,
                'blocked_reason' => $user->blocked_reason,
                'blocked_until'  => $user->blocked_until,
                'blocked_by'     => $user->blocked_by,
                'blocked_at'     => $user->blocked_at,
            ],
        ]);
    }

    /**
     * Historial de sesiones de un usuario (para "Ver historial").
     * GET /api/admin/users/{id}/sessions
     */
    public function getUserSessions(int $id)
    {
        // Si todavía no tenés la tabla 'calls', devolvemos vacío y no rompemos.
        if (!Schema::hasTable('calls')) {
            return response()->json([]);
        }

        $hasInstructor = Schema::hasColumn('calls', 'instructor_id');
        $hasStudent    = Schema::hasColumn('calls', 'student_id');
        $hasDuration   = Schema::hasColumn('calls', 'duration_seconds');
        $hasMetrics    = Schema::hasColumn('calls', 'metrics');

        $q = DB::table('calls');

        // Filtrar por el usuario si tenemos columnas para hacerlo
        if ($hasInstructor || $hasStudent) {
            $q->where(function ($qq) use ($id, $hasInstructor, $hasStudent) {
                if ($hasInstructor) {
                    $qq->orWhere('instructor_id', $id);
                }
                if ($hasStudent) {
                    $qq->orWhere('student_id', $id);
                }
            });
        }

        $sessions = $q->orderByDesc('created_at')->get()->map(function ($row) use (
            $id,
            $hasInstructor,
            $hasStudent,
            $hasDuration,
            $hasMetrics
        ) {
            // Rol en esa sesión
            if ($hasInstructor && isset($row->instructor_id)) {
                $row->role = ($row->instructor_id == $id) ? 'instructor' : 'student';
            } else {
                $row->role = 'student';
            }

            // Duración en minutos (si existe duration_seconds)
            if ($hasDuration && isset($row->duration_seconds)) {
                $row->duration_minutes = round(($row->duration_seconds ?? 0) / 60);
            } else {
                $row->duration_minutes = 0;
            }

            // started_at: usamos created_at como fallback
            if (!isset($row->started_at)) {
                $row->started_at = $row->created_at ?? null;
            }

            // Métricas: si hay columna metrics y es JSON, la decodificamos
            if ($hasMetrics && isset($row->metrics) && is_string($row->metrics)) {
                $decoded = json_decode($row->metrics, true);
                $row->metrics = is_array($decoded) ? $decoded : [];
            }

            // Nombre de habilidad: si no tenés esa info en la tabla, dejamos algo genérico
            if (!isset($row->skill_name)) {
                $row->skill_name = 'Sesión de SkillSwap';
            }

            return $row;
        });

        return response()->json($sessions);
    }
}
