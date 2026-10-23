<?php

// O front controller está em /api, mas as rotas Laravel continuam relativas à raiz.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

$set = static function (string $name, string $value): void {
    putenv($name.'='.$value);
    $_ENV[$name] = $_SERVER[$name] = $value;
};
$default = static function (string $name, string $value) use ($set): void {
    if (getenv($name) === false || getenv($name) === '') {
        $set($name, $value);
    }
};
$root = sys_get_temp_dir().'/projeto-na';
foreach (['storage/framework/views', 'storage/framework/sessions', 'storage/framework/cache/data', 'storage/logs', 'bootstrap/cache'] as $directory) {
    $path = $root.'/'.$directory;
    if (! is_dir($path) && ! mkdir($path, 0700, true) && ! is_dir($path)) {
        throw new RuntimeException('Não foi possível preparar o diretório temporário.');
    }
}
$set('LARAVEL_STORAGE_PATH', $root.'/storage');
$set('VIEW_COMPILED_PATH', $root.'/storage/framework/views');
foreach (['CONFIG', 'EVENTS', 'PACKAGES', 'ROUTES', 'SERVICES'] as $cache) {
    $set('APP_'.$cache.'_CACHE', $root.'/bootstrap/cache/'.strtolower($cache).'.php');
}
$default('APP_ENV', 'production');
$set('APP_DEBUG', 'false');
$default('DB_CONNECTION', 'pgsql');
if (getenv('DATABASE_URL') || getenv('POSTGRES_URL')) {
    $default('DB_URL', getenv('DATABASE_URL') ?: getenv('POSTGRES_URL'));
}
// O libpq do runtime comunitário precisa do endpoint explícito para rotear o TLS no Neon.
$dbHost = parse_url(getenv('DB_URL') ?: '', PHP_URL_HOST) ?: (getenv('DB_HOST') ?: '');
if (preg_match('/^(ep-[a-z0-9-]+?)(?:-pooler)?\.[a-z0-9.-]+\.neon\.tech$/', $dbHost, $endpoint)) {
    $default('PGOPTIONS', 'endpoint='.$endpoint[1]);
}
$default('SESSION_DRIVER', 'database');
$default('SESSION_SECURE_COOKIE', 'true');
$default('CACHE_STORE', 'database');
$default('FILESYSTEM_DISK', 's3');
$default('LOG_CHANNEL', 'stderr');
$default('FFPROBE_PATH', dirname(__DIR__).'/bin/ffprobe');
$default('APP_URL', 'https://'.(getenv('VERCEL_URL') ?: 'localhost'));
unset($set,$default,$root,$path,$directory,$cache,$dbHost,$endpoint);
