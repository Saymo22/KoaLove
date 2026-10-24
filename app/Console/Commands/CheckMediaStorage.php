<?php

namespace App\Console\Commands;

use App\Services\MediaStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CheckMediaStorage extends Command
{
    protected $signature = 'media:check {--probe : Grava, lê e remove um arquivo sintético de diagnóstico}';

    protected $description = 'Verifica a configuração do armazenamento privado de mídias.';

    public function handle(MediaStorage $storage): int
    {
        if (! $storage->status()['configured']) {
            $this->error('Armazenamento indisponível. O disco local exige um servidor com volume persistente; a função Vercel não oferece essa persistência.');

            return self::FAILURE;
        }
        if (! $this->option('probe')) {
            $this->info('Configuração disponível. Use --probe para testar gravação, leitura e remoção.');

            return self::SUCCESS;
        }
        $disk = Storage::disk(config('filesystems.default'));
        $path = 'healthchecks/'.Str::uuid();
        $content = bin2hex(random_bytes(16));
        try {
            if (! $disk->put($path, $content, ['visibility' => 'private']) || $disk->get($path) !== $content || ! $disk->delete($path)) {
                throw new \RuntimeException('Teste de armazenamento falhou.');
            }
            $this->info('Gravação, leitura e remoção confirmadas. Nenhuma mídia de usuário foi alterada.');

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
}
