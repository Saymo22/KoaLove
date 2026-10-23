<?php

namespace Tests\Feature;

use Symfony\Component\Process\Process;
use Tests\TestCase;

class VercelBootstrapTest extends TestCase
{
    public function test_front_controller_preserves_the_api_prefix_when_symfony_captures_the_request(): void
    {
        $script = 'require '.var_export(base_path('vendor/autoload.php'), true).'; $_SERVER["REQUEST_URI"]="/api/config"; $_SERVER["SCRIPT_NAME"]="/api/index.php"; $_SERVER["PHP_SELF"]="/api/index.php"; $_SERVER["SCRIPT_FILENAME"]="/var/task/user/api/index.php"; require '.var_export(base_path('bootstrap/vercel.php'), true).'; echo Symfony\\Component\\HttpFoundation\\Request::createFromGlobals()->getPathInfo();';
        $process = new Process([PHP_BINARY, '-r', $script], base_path());
        $process->mustRun();
        $this->assertSame('/api/config', $process->getOutput());
    }

    public function test_neon_url_sets_endpoint_for_the_runtime_postgres_client(): void
    {
        $script = 'require '.var_export(base_path('bootstrap/vercel.php'), true).'; echo json_encode([getenv("DB_URL"),getenv("PGOPTIONS")]);';
        $url = 'postgresql://fixture:unused@ep-example-123-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
        $process = new Process([PHP_BINARY, '-r', $script], base_path(), ['DATABASE_URL' => $url, 'DB_URL' => false, 'PGOPTIONS' => false]);
        $process->mustRun();
        $this->assertSame([$url, 'endpoint=ep-example-123'], json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR));
    }

    public function test_serverless_bootstrap_uses_only_temporary_paths_and_persistent_drivers(): void
    {
        $script = 'require '.var_export(base_path('bootstrap/vercel.php'), true).'; echo json_encode(array_map("getenv",["LARAVEL_STORAGE_PATH","APP_PACKAGES_CACHE","SESSION_DRIVER","CACHE_STORE","FILESYSTEM_DISK","APP_DEBUG","APP_URL"]));';
        $process = new Process([PHP_BINARY, '-r', $script], base_path(), ['VERCEL' => '1', 'VERCEL_URL' => 'preview.example.test', 'SESSION_DRIVER' => false, 'CACHE_STORE' => false, 'FILESYSTEM_DISK' => false, 'APP_URL' => false]);
        $process->mustRun();
        $values = json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertStringStartsWith(sys_get_temp_dir(), $values[0]);
        $this->assertStringStartsWith(sys_get_temp_dir(), $values[1]);
        $this->assertSame(['database', 'database', 's3', 'false', 'https://preview.example.test'], array_slice($values, 2));
    }

    public function test_unconfigured_serverless_entry_fails_without_disclosing_secrets(): void
    {
        $process = new Process([PHP_BINARY, base_path('api/index.php')], base_path(), ['APP_KEY' => false, 'DB_HOST' => false, 'DB_URL' => false]);
        $process->mustRun();
        $this->assertSame('Serviço temporariamente indisponível. Tente novamente mais tarde.', $process->getOutput());
        $this->assertStringNotContainsString('APP_KEY', $process->getOutput());
    }
}
