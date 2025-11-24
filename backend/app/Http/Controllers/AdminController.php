<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use App\Models\Reserva;


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
        if (!Schema::hasTable('calls')) {
            return response()->json([]);
        }

        // Traemos SOLO sesiones completadas donde participó el usuario
        $rows = DB::table('calls as c')
            ->join('users as caller', 'c.caller_id', '=', 'caller.id')
            ->join('users as receiver', 'c.receiver_id', '=', 'receiver.id')
            ->where('c.status', 'completed')
            ->where(function ($q) use ($id) {
                $q->where('c.caller_id', $id)
                    ->orWhere('c.receiver_id', $id);
            })
            ->orderByDesc('c.started_at')
            ->orderByDesc('c.created_at')
            ->selectRaw('
            c.id,
            c.caller_id,
            c.receiver_id,
            c.started_at,
            c.ended_at,
            c.status,
            c.created_at,
            c.updated_at,
            caller.name   as caller_name,
            receiver.name as receiver_name,
            TIMESTAMPDIFF(MINUTE, c.started_at, c.ended_at) as raw_duration
        ')
            ->get();

        $sessions = $rows->map(function ($row) use ($id) {
            // 1) Buscamos una reserva que matchee ese par de usuarios
            $reserva = Reserva::where(function ($q) use ($row) {
                $q->where('instructor_id', $row->caller_id)
                    ->where('alumno_id', $row->receiver_id);
            })
                ->orWhere(function ($q) use ($row) {
                    $q->where('instructor_id', $row->receiver_id)
                        ->where('alumno_id', $row->caller_id);
                })
                ->orderByDesc('created_at')
                ->first();

            if ($reserva) {
                // Usamos reserva como fuente de verdad
                if ($reserva->instructor_id == $row->caller_id) {
                    $row->instructor_id   = $row->caller_id;
                    $row->instructor_name = $row->caller_name;
                    $row->student_id      = $row->receiver_id;
                    $row->student_name    = $row->receiver_name;
                } else {
                    $row->instructor_id   = $row->receiver_id;
                    $row->instructor_name = $row->receiver_name;
                    $row->student_id      = $row->caller_id;
                    $row->student_name    = $row->caller_name;
                }
            } else {
                // Fallback viejo: asumimos caller como instructor
                $row->instructor_id   = $row->caller_id;
                $row->instructor_name = $row->caller_name;
                $row->student_id      = $row->receiver_id;
                $row->student_name    = $row->receiver_name;
            }

            // Alias por compatibilidad
            $row->alumno_id   = $row->student_id;
            $row->alumno_name = $row->student_name;

            // 2) Rol del usuario cuyo historial estamos viendo
            if ($id == $row->instructor_id) {
                $row->role = 'instructor';
            } elseif ($id == $row->student_id) {
                $row->role = 'student';
            } else {
                $row->role = 'participant';
            }

            // 3) Duración
            $row->duration_minutes = $row->raw_duration !== null
                ? max(1, (int) $row->raw_duration)
                : 0;

            unset($row->raw_duration);

            if (!isset($row->skill_name)) {
                $row->skill_name = 'Sesión de SkillSwap';
            }

            return $row;
        });

        return response()->json($sessions);
    }
}
