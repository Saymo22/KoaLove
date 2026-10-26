<?php

// Único ponto de entrada PHP publicado pela Vercel. Nenhum dado persistente fica em /tmp.
require __DIR__.'/../bootstrap/vercel.php';
// Falha controlada antes de abrir sessão/conexão quando o ambiente ainda não foi configurado.
$missing = [];
if (! getenv('APP_KEY')) {
    $missing[] = 'APP_KEY';
}
if (! getenv('DB_URL') && ! getenv('DB_HOST')) {
    $missing[] = 'DB_HOST/DB_URL';
}
if ($missing) {
    error_log('[setup] Configure '.implode(', ', $missing).' no ambiente da Vercel.');
    http_response_code(503);
    header('Cache-Control: no-store');
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Serviço temporariamente indisponível. Tente novamente mais tarde.';

    return;
}
require __DIR__.'/../public/index.php';
