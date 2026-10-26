<?php

use App\Http\Middleware\Administrator;
use App\Http\Middleware\ApiAuthentication;
use App\Http\Middleware\LimitJsonBody;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        if (getenv('VERCEL')) {
            $middleware->trustProxies(at: ['127.0.0.1', '::1'], headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO);
        }
        $middleware->alias(['api.auth' => ApiAuthentication::class, 'admin' => Administrator::class]);
        $middleware->validateCsrfTokens(except: ['api/webhooks/mercadopago']);
        $middleware->prepend([SecurityHeaders::class, LimitJsonBody::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (Throwable $error) {
            // Exception messages/SQL bindings can contain private content or signed URLs.
            Log::error('Falha interna da aplicação.', [
                'exception_type' => $error::class,
                'file' => basename($error->getFile()),
                'line' => $error->getLine(),
                'route' => request()->route()?->uri() ?? 'unmatched',
            ]);

            return false;
        });
        $exceptions->render(function (Throwable $error, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            $status = $error instanceof ValidationException ? 422 : ($error instanceof HttpExceptionInterface ? $error->getStatusCode() : 500);
            $code = match ($status) {
                401 => 'NOT_AUTHENTICATED',403 => 'FORBIDDEN',404 => 'NOT_FOUND',409 => 'CONFLICT',419 => 'SESSION_EXPIRED',422 => 'VALIDATION_ERROR',429 => 'RATE_LIMITED',default => $status >= 500 ? 'INTERNAL_ERROR' : 'INVALID_REQUEST'
            };
            $message = match ($status) {
                403 => 'Acesso restrito.',
                404 => 'Recurso não encontrado.',
                405 => 'Método não permitido.',
                419 => 'Sua sessão expirou. Recarregue a página.',
                429 => 'Muitas tentativas. Aguarde e tente novamente.',
                default => $status >= 500 ? 'Não foi possível concluir a operação.' : ($error->getMessage() ?: 'Revise sua solicitação.'),
            };
            $meta = $error instanceof ValidationException ? ['fields' => $error->errors()] : null;

            return response()->json(['ok' => false, 'error' => array_filter(['code' => $code, 'message' => $message, 'meta' => $meta])], $status, $error instanceof HttpExceptionInterface ? $error->getHeaders() : []);
        });
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
