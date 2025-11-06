<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ... (dashboardStats / getUserSessions si ya los tenés)

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
            ) // NO seleccionamos 'is_admin' porque no existe en DB
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
            $u->is_admin = $u->is_admin; // fuerza inclusión del accesor
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
            'blocked_reason' => $data['blocked_reason'] ?? null, // usa *blocked_reason* (tu columna)
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
                'is_admin'       => $user->is_admin,          // accesor basado en 'rol'
                'is_blocked'     => (bool)$user->is_blocked,
                'blocked_reason' => $user->blocked_reason,
                'blocked_until'  => $user->blocked_until,
                'blocked_by'     => $user->blocked_by,
                'blocked_at'     => $user->blocked_at,
            ],
        ]);
    }
}
