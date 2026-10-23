<?php

use App\Http\Middleware\Administrator;
use App\Http\Middleware\ApiAuthentication;
use App\Http\Middleware\LimitJsonBody;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['api.auth' => ApiAuthentication::class, 'admin' => Administrator::class]);
        $middleware->prepend([SecurityHeaders::class, LimitJsonBody::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $error, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            $status = $error instanceof ValidationException ? 422 : ($error instanceof HttpExceptionInterface ? $error->getStatusCode() : 500);
            $code = match ($status) {
                401 => 'NOT_AUTHENTICATED',403 => 'FORBIDDEN',404 => 'NOT_FOUND',409 => 'CONFLICT',419 => 'SESSION_EXPIRED',422 => 'VALIDATION_ERROR',429 => 'RATE_LIMITED',default => $status >= 500 ? 'INTERNAL_ERROR' : 'INVALID_REQUEST'
            };
            $message = $status >= 500 ? 'Não foi possível concluir a operação.' : ($error->getMessage() ?: 'Revise sua solicitação.');
            $meta = $error instanceof ValidationException ? ['fields' => $error->errors()] : null;

            return response()->json(['ok' => false, 'error' => array_filter(['code' => $code, 'message' => $message, 'meta' => $meta])], $status, $error instanceof HttpExceptionInterface ? $error->getHeaders() : []);
        });
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
