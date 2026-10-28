<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && $request->session()->has('google_session_version')
            && ($user->google_signin_disabled_at || (int) $user->google_session_version !== (int) $request->session()->get('google_session_version'))) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        if (! $request->user() || $request->user()->deletion_requested_at) {
            return response()->json(['ok' => false, 'error' => ['code' => 'NOT_AUTHENTICATED', 'message' => 'Faça login para continuar.']], 401);
        }

        return $next($request);
    }
}
