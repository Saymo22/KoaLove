<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class LimitJsonBody
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*') && $request->isMethod('POST') && (! $request->is('api/purchases/*/media/*') || $request->is('api/purchases/*/media/*/upload-url', 'api/purchases/*/media/*/complete-upload'))) {
            abort_unless($request->isJson(), 415, 'Envie JSON.');
            abort_if((int) $request->header('Content-Length') > 2097152, 413, 'Solicitação muito grande.');
            $stream = $request->getContent(true);
            $raw = stream_get_contents($stream, 2097153);
            if (is_resource($stream)) {
                fclose($stream);
            }
            abort_if(strlen($raw) > 2097152, 413, 'Solicitação muito grande.');
            try {
                $value = json_decode($raw, false, 32, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                abort(400, 'JSON inválido.');
            }
            abort_unless($value instanceof \stdClass, 400, 'Envie um objeto JSON.');
        }

        return $next($request);
    }
}
