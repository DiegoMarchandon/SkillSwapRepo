<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $u = $request->user();
        if (!$u || !$u->is_admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
