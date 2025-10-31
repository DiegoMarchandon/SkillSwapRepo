<?php

namespace App\Http\Middleware;

use Closure;

class EsAdmin
{
    public function handle($request, Closure $next)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
