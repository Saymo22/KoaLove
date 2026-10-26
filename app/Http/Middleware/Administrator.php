<?php

namespace App\Http\Middleware;

use App\Services\AdminConfiguration;
use Closure;
use Illuminate\Http\Request;

class Administrator
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Acesso restrito.');

        if (($request->user()->admin_level ?? 'owner') === 'support') {
            abort_unless($request->is('api/admin/workspace', 'api/admin/clients', 'api/admin/clients/*', 'api/admin/tickets', 'api/admin/tickets/*', 'api/admin/settings'), 403, 'Sua função permite somente atendimento e consulta de clientes.');
        }
        $response = $next($request);
        if ($request->isMethod('post') && $response->getStatusCode() < 400) {
            app(AdminConfiguration::class)->log('system', 'Operação administrativa', $request->route()?->uri());
        }

        return $response;
    }
}
