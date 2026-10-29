<?php

namespace App\Console\Commands;

use App\Services\MediaStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CheckMediaStorage extends Command
{
    protected $signature = 'media:check {--probe : Grava, lê e remove um arquivo sintético de diagnóstico}
        {--origin= : Verifica OPTIONS e PUT assinado para uma origem HTTPS}
        {--capacity : Mede o volume local, sem inferir capacidade de buckets remotos}';

    protected $description = 'Verifica a configuração do armazenamento privado de mídias.';

    public function handle(MediaStorage $storage): int
    {
        $origin = $this->option('origin');
        if ($origin && (! is_string($origin) || ! preg_match('~^https://[a-z0-9.-]+(?::[0-9]{1,5})?$~iD', $origin))) {
            $this->error('Informe somente uma origem HTTPS, sem caminho ou credenciais.');

            return self::FAILURE;
        }
        if (! $storage->status()['configured']) {
            $this->error('Armazenamento indisponível. O disco local exige um servidor com volume persistente; a função Vercel não oferece essa persistência.');

            return self::FAILURE;
        }
        $disk = Storage::disk(config('filesystems.default'));
        $driver = config('filesystems.disks.'.config('filesystems.default').'.driver');
        if ($this->option('capacity')) {
            if ($driver !== 'local') {
                $this->warn('Capacidade física remota indisponível: o disco desta máquina não mede o bucket. Consulte a quota e o consumo no provedor.');
            } else {
                $root = $disk->path('');
                $total = is_dir($root) ? @disk_total_space($root) : false;
                $free = is_dir($root) ? @disk_free_space($root) : false;
                if ($total === false || $free === false) {
                    $this->error('Volume local indisponível para medição.');

                    return self::FAILURE;
                }
                $this->line('Volume privado: total_bytes='.(int) $total.' livre_bytes='.(int) $free.' medido_em='.now()->toIso8601String());
                $this->line('Temporários: livre_bytes='.(int) disk_free_space(sys_get_temp_dir()).' (podem compartilhar o mesmo volume).');
            }
        }
        if ($origin && ! in_array($driver, ['s3', 'supabase'], true)) {
            $this->error('--origin exige armazenamento S3/Supabase; upload local usa a mesma origem.');

            return self::FAILURE;
        }
        if (! $this->option('probe')) {
            if ($origin) {
                return $this->checkCors($disk, $origin, 'healthchecks/'.Str::uuid(), bin2hex(random_bytes(16))) ? self::SUCCESS : self::FAILURE;
            }
            $this->info('Configuração disponível. Use --probe para testar gravação, leitura e remoção.');

            return self::SUCCESS;
        }
        $path = 'healthchecks/'.Str::uuid();
        $content = bin2hex(random_bytes(16));
        try {
            $start = hrtime(true);
            if ($origin) {
                if (! $this->checkCors($disk, $origin, $path, $content, true)) {
                    return self::FAILURE;
                }
            } elseif (! $disk->put($path, $content, ['visibility' => 'private', 'ContentType' => 'application/octet-stream'])) {
                throw new \RuntimeException('Gravação de diagnóstico falhou.');
            }
            if ($disk->get($path) !== $content || ! $disk->delete($path)) {
                throw new \RuntimeException('Teste de armazenamento falhou.');
            }
            $this->info('Gravação, leitura e remoção confirmadas. Nenhuma mídia de usuário foi alterada.');
            $this->line('Probe total_ms='.round((hrtime(true) - $start) / 1e6).' bytes='.strlen($content));

            return self::SUCCESS;
        } catch (\Throwable) {
            $this->error('Falha no diagnóstico. Confira as permissões do diretório e remova eventuais arquivos de teste em healthchecks/.');

            return self::FAILURE;
        } finally {
            try {
                $disk->delete($path);
            } catch (\Throwable) {
                // A falha já é informada pelo diagnóstico, sem expor credenciais ou dados.
            }
        }
    }

    private function checkCors($disk, string $origin, string $path, string $content, bool $put = false): bool
    {
        try {
            $signed = $disk->temporaryUploadUrl($path, now()->addMinutes(5), ['ContentType' => 'application/octet-stream', 'ContentLength' => strlen($content)]);
            // Browsers set Content-Type from Blob.type even when the SDK omits it.
            $headers = ['Content-Type' => 'application/octet-stream'];
            foreach ($signed['headers'] ?? [] as $key => $value) {
                if (! in_array(strtolower($key), ['host', 'content-length'], true)) {
                    $headers[$key] = is_array($value) ? implode(',', $value) : $value;
                }
            }
            $response = Http::withOptions(['allow_redirects' => false])->connectTimeout(5)->timeout(30)
                ->withHeaders(['Origin' => $origin, 'Access-Control-Request-Method' => 'PUT', 'Access-Control-Request-Headers' => implode(',', array_map('strtolower', array_keys($headers)))])
                ->send('OPTIONS', $signed['url']);
            $allowedOrigin = $response->header('Access-Control-Allow-Origin');
            $methods = array_map('trim', explode(',', strtoupper($response->header('Access-Control-Allow-Methods'))));
            $allowedHeaders = array_map('trim', explode(',', strtolower($response->header('Access-Control-Allow-Headers'))));
            $valid = $response->successful() && in_array($allowedOrigin, ['*', $origin], true) && in_array('PUT', $methods, true)
                && (in_array('*', $allowedHeaders, true) || ! array_diff(array_map('strtolower', array_keys($headers)), $allowedHeaders));
            $this->line('OPTIONS status='.$response->status().' origem_permitida='.(int) in_array($allowedOrigin, ['*', $origin], true).' PUT_permitido='.(int) in_array('PUT', $methods, true).' cabecalhos_permitidos='.(int) (in_array('*', $allowedHeaders, true) || ! array_diff(array_map('strtolower', array_keys($headers)), $allowedHeaders)));
            if (! $valid) {
                $this->error('Preflight recusado. Nenhum PUT enviado; verifique o endpoint no provedor.');

                return false;
            }
            if ($put) {
                $response = Http::withOptions(['allow_redirects' => false])->connectTimeout(5)->timeout(30)->withHeaders([...$headers, 'Origin' => $origin])->withBody($content, 'application/octet-stream')->put($signed['url']);
                $this->line('PUT status='.$response->status());
                if (! $response->successful() || ! in_array($response->header('Access-Control-Allow-Origin'), ['*', $origin], true)) {
                    $this->error('PUT ou CORS da resposta falhou.');

                    return false;
                }
            }
            $this->info('Verificação HTTP concluída; teste em navegador continua necessário.');

            return true;
        } catch (\Throwable) {
            $this->error('Falha ao verificar OPTIONS/PUT. URL assinada e detalhes privados omitidos.');

            return false;
        }
    }
}
