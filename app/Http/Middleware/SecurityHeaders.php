<?php

namespace App\Http\Middleware;

use App\Services\Seo;
use Closure;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $response = $next($request);
        } catch (\Throwable $error) {
            report($error);
            $response = app(ExceptionHandler::class)->render($request, $error);
        }
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        }
        $response->headers->set('X-Robots-Tag', $response->getStatusCode() === 200 ? app(Seo::class)->metadata($request)['robots'] : 'noindex, nofollow');
        $origins = implode(' ', array_filter(config('gift.upload_origins', []), fn ($origin) => preg_match('/\Ahttps:\/\/[a-z0-9.-]+(?::[0-9]+)?\z/i', $origin)));
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' $origins; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none'");
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store');
        }
        $response->headers->remove('X-Powered-By');
        if (! $request->isMethodSafe() || $request->is('api/admin/*', 'api/privacy/*', 'api/purchases/*') || in_array($response->getStatusCode(), [401, 403, 419, 429], true)) {
            try {
                DB::table('audit_events')->insert(['user_id' => $request->user()?->id, 'action' => $request->method().' '.($request->route()?->uri() ?? 'unmatched'), 'ip_hash' => hash_hmac('sha256', (string) $request->ip(), config('app.key')), 'status' => $response->getStatusCode(), 'created_at' => now()]);
            } catch (\Throwable) {
                // Never undo an operation already committed, or log private SQL bindings.
                Log::warning('Registro de auditoria indisponível.');
            }
        }

        return $response;
    }
}
