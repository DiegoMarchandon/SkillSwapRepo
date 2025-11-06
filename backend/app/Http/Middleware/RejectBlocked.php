<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RejectBlocked
{
    public function handle(Request $request, Closure $next)
    {
        $u = $request->user();
        if (!$u) return $next($request);

        // Admin nunca bloquea el acceso
        if ($u->is_admin) {   // <- acceso por accessor
            return $next($request);
        }

        $blocked = (bool)$u->is_blocked;
        $until   = $u->blocked_until ?? null;

        if ($blocked || ($until && now()->lt($until))) {
            return response()->json([
                'message' => 'Tu cuenta está bloqueada.',
                'until'   => optional($until)->toISOString(),
                'reason'  => $u->blocked_reason ?? null,
            ], 423);
        }

        return $next($request);
    }
}
