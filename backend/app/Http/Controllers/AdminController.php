<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

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
    public function getUserSessions(Request $r, int $id)
    {
        if (!Schema::hasTable('calls')) {
            return response()->json([]);
        }

        // Traemos solo las llamadas donde el usuario participó
        $q = DB::table('calls')
            ->where(function ($qq) use ($id) {
                $qq->where('caller_id', $id)
                    ->orWhere('receiver_id', $id);
            })
            // si tenés started_at, mejor ordenar por ahí
            ->orderByDesc('started_at')
            ->orderByDesc('created_at');

        $sessions = $q->get()->map(function ($row) use ($id) {
            // Rol relativo en esa llamada
            if (isset($row->caller_id) && $row->caller_id == $id) {
                $row->role = 'caller';   // o 'instructor' si querés
            } elseif (isset($row->receiver_id) && $row->receiver_id == $id) {
                $row->role = 'receiver'; // o 'student'
            } else {
                $row->role = 'participant';
            }

            // Fallback de started_at
            if (empty($row->started_at) && !empty($row->created_at)) {
                $row->started_at = $row->created_at;
            }

            // Duración en minutos usando started_at / ended_at
            $row->duration_minutes = 0;

            if (!empty($row->started_at) && !empty($row->ended_at)) {
                $start = Carbon::parse($row->started_at);
                $end   = Carbon::parse($row->ended_at);

                $mins = $start->diffInMinutes($end);
                // si querés evitar que una sesión de 40s salga como 0:
                $row->duration_minutes = max(1, $mins);
            }

            // Nombre genérico si no tenés aún skill_name
            if (!isset($row->skill_name)) {
                $row->skill_name = 'Sesión de SkillSwap';
            }

            return $row;
        });

        return response()->json($sessions);
    }
}
