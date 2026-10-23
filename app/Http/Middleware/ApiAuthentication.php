<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || $request->user()->deletion_requested_at) {
            return response()->json(['ok' => false, 'error' => ['code' => 'NOT_AUTHENTICATED', 'message' => 'Faça login para continuar.']], 401);
        }

        return $next($request);
    }
}
