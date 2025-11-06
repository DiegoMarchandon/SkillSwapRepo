<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserBlockController extends Controller
{
    public function update(Request $r, User $user)
    {
        // por las dudas, no te bloquees vos mismo
        if ($r->user()->id === $user->id) {
            return response()->json(['message' => 'No podés bloquear tu propia cuenta.'], 422);
        }

        $data = $r->validate([
            'is_blocked'      => ['required', 'boolean'],
            'blocked_reason'  => ['nullable', 'string', 'max:500'],
            'blocked_until'   => ['nullable', 'date'],
        ]);

        $payload = [
            'is_blocked'      => (bool)$data['is_blocked'],
            'blocked_reason'  => $data['blocked_reason'] ?? null,
            'blocked_until'   => $data['blocked_until'] ?? null,
            'blocked_by'      => $r->user()->id,
            'blocked_at'      => now(),
        ];

        // si es desbloqueo, limpiamos metadatos
        if ($payload['is_blocked'] === false) {
            $payload['blocked_reason'] = null;
            $payload['blocked_until']  = null;
            $payload['blocked_by']     = null;
            $payload['blocked_at']     = null;
        }

        $user->update($payload);

        return response()->json([
            'ok' => true,
            'user' => $user->only([
                'id',
                'name',
                'email',
                'rol',
                'is_blocked',
                'blocked_reason',
                'blocked_until',
                'blocked_by'
            ])
        ]);
    }
}
