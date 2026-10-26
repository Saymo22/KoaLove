<?php

namespace App\Http\Middleware;

use App\Services\AdminConfiguration;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminRuntime
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user?->role === 'admin') {
            $idle = (int) (($user->admin_preferences ?? [])['idleMin'] ?? 30);
            $last = $request->session()->get('admin_last_active');
            if ($idle && $last && time() - $last >= $idle * 60) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                abort(401, 'Sessão encerrada por inatividade. Entre novamente.');
            }
            $request->session()->put('admin_last_active', time());
        } elseif ($request->is('api/*') && ! $request->is('api/webhooks/*', 'api/internal/*', 'api/auth/*')) {
            if (app(AdminConfiguration::class)->all()['maintenance']) {
                return response()->json(['ok' => false, 'error' => ['code' => 'MAINTENANCE', 'message' => 'O site está em manutenção. Tente novamente em instantes.']], 503, ['Retry-After' => '300']);
            }
        }

        return $next($request);
    }
}
