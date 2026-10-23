<?php

namespace App\Console\Commands;

use App\Models\Purchase;
use App\Models\Refund;
use App\Models\Ticket;
use App\Models\User;
use App\Services\MediaValidator;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ImportLegacy extends Command
{
    protected $signature = 'legacy:import {directory : Diretório privado com os JSON e media/} {--commit : Importa apenas em banco vazio; sem esta opção apenas valida}';

    protected $description = 'Importa cópia do banco legado sem escrever na origem. Senhas antigas exigem redefinição.';

    public function handle(MediaValidator $mediaValidator): int
    {
        $root = realpath($this->argument('directory'));
        $paths = [];
        try {
            throw_unless($root && is_dir($root), \RuntimeException::class, 'Diretório inexistente.');
            $tables = [];
            foreach (['users', 'purchases', 'refunds', 'tickets'] as $name) {
                $path = $root.DIRECTORY_SEPARATOR.$name.'.json';
                throw_unless(is_file($path) && filesize($path) <= 52428800, \RuntimeException::class, 'Arquivo ausente ou maior que 50 MB: '.$name);
                $tables[$name] = json_decode(file_get_contents($path), true, 32, JSON_THROW_ON_ERROR);
                throw_unless(is_array($tables[$name]) && array_is_list($tables[$name]), \RuntimeException::class, 'Lista inválida: '.$name);
            }
            $emails = [];
            $ids = [];
            foreach ($tables['users'] as $row) {
                Validator::make($row, ['id' => 'required|string|max:100', 'email' => 'required|email:rfc|max:254', 'name' => 'required|string|max:255', 'role' => 'required|in:user,admin'])->validate();
                $email = strtolower(trim($row['email']));
                throw_if(isset($emails[$email]) || isset($ids[$row['id']]), \RuntimeException::class, 'Usuário duplicado.');
                $emails[$email] = true;
                $ids[$row['id']] = true;
            }
            $purchaseIds = [];
            foreach ($tables['purchases'] as $row) {
                Validator::make($row, ['id' => 'required|string|regex:/^[\w-]{3,100}$/', 'user_id' => 'required|string', 'tema' => 'required|in:'.implode(',', array_keys(config('gift.themes'))), 'status' => 'required|in:pending,paid,refunded', 'price_cents' => 'required|integer|min:0'])->validate();
                throw_unless(isset($ids[$row['user_id']]) && ! isset($purchaseIds[$row['id']]), \RuntimeException::class, 'Referência de compra inválida.');
                $purchaseIds[$row['id']] = true;
                foreach ($row['uploads'] ?? [] as $asset) {
                    Validator::make($asset, ['id' => 'required|string|regex:/^[\w-]{16,100}$/', 'filename' => 'required|string|regex:/^[a-f0-9]{64}$/', 'mime' => 'required|string'])->validate();
                    throw_unless(is_file($root.'/media/'.$asset['filename']), \RuntimeException::class, 'Mídia ausente.');
                }
            }
            foreach (['refunds', 'tickets'] as $table) {
                foreach ($tables[$table] as $row) {
                    throw_unless(isset($ids[$row['user_id'] ?? '']), \RuntimeException::class, 'Referência de atendimento inválida.');
                    if ($table === 'refunds') {
                        throw_unless(isset($purchaseIds[$row['purchase_id'] ?? '']), \RuntimeException::class, 'Referência de reembolso inválida.');
                    }
                }
            }
            foreach ($tables as $name => $rows) {
                $this->line($name.': '.count($rows));
            }
            if (! $this->option('commit')) {
                $this->info('Pré-validação concluída; nenhum dado alterado. A mídia será decodificada e validada ao importar.');

                return self::SUCCESS;
            }
            throw_if(User::exists() || Purchase::withTrashed()->exists() || Refund::exists() || Ticket::exists(), \RuntimeException::class, 'Use um banco vazio. Nenhum dado foi sobrescrito.');
            DB::transaction(function () use ($tables, $root, $mediaValidator, &$paths) {
                $users = [];
                foreach ($tables['users'] as $row) {
                    $u = User::create(['name' => $row['name'], 'email' => strtolower(trim($row['email'])), 'password' => Str::random(80)]);
                    $u->forceFill(['role' => $row['role'], 'created_at' => $this->date($row['created_at'] ?? null)])->save();
                    $users[$row['id']] = $u->id;
                }
                $fields = ['tema', 'titulo', 'para', 'de', 'inicio', 'carta', 'frase', 'eventos', 'amo', 'legendas', 'fotoCapa', 'musicaNome', 'musicaArtista', 'usarIntro', 'autoplay', 'rodapeCustom', 'themeData', 'preview_data_url'];
                foreach ($tables['purchases'] as $row) {
                    $content = array_intersect_key($row, array_flip($fields));
                    $content['themeData'] ??= [];
                    $p = Purchase::create(['id' => $row['id'], 'user_id' => $users[$row['user_id']], 'client_request_id' => $row['client_request_id'] ?? null, 'share_token' => preg_match('/^[a-f0-9]{64}$/', $row['share_token'] ?? '') ? $row['share_token'] : bin2hex(random_bytes(32)), 'status' => $row['status'], 'price_cents' => $row['price_cents'], 'amount_paid_cents' => $row['amount_paid_cents'] ?? null, 'payment_method' => $row['payment_method'] ?? null, 'coupon' => $row['coupon'] ?? null, 'discount_percent' => $row['discount_percent'] ?? 0, 'content' => $content, 'created_at' => $this->date($row['created_at'] ?? null), 'paid_at' => $this->date($row['paid_at'] ?? null), 'content_version' => 0]);
                    $assets = [];
                    foreach ($row['uploads'] ?? [] as $asset) {
                        $tmp = tempnam(sys_get_temp_dir(), 'import_');
                        try {
                            copy($root.'/media/'.$asset['filename'], $tmp);
                            $data = $mediaValidator->validate($tmp, $asset['mime']);
                            $path = 'gifts/'.$p->id.'/'.Str::uuid();
                            $paths[] = $path;
                            throw_unless(Storage::disk('local')->put($path, fopen($tmp, 'rb')), \RuntimeException::class, 'Falha ao copiar mídia.');
                            $p->assets()->create([...$data, 'asset_id' => $asset['id'], 'path' => $path]);
                            $assets[$asset['id']] = $data['kind'];
                        } finally {
                            if (is_file($tmp)) {
                                unlink($tmp);
                            }
                        }
                    }
                    if (($row['content_version'] ?? 0) === 1) {
                        $manifest = $row['media'] ?? [];
                        Validator::make($manifest, ['photos' => 'required|array|min:1|max:12', 'videos' => 'present|array|max:4', 'music' => 'nullable|string'])->validate();
                        foreach (['photos' => 'photo', 'videos' => 'video', 'music' => 'music'] as $key => $kind) {
                            foreach ($key === 'music' ? array_filter([$manifest[$key] ?? null]) : $manifest[$key] as $assetId) {
                                throw_unless(($assets[$assetId] ?? null) === $kind, \RuntimeException::class, 'Manifesto de mídia inválido.');
                            }
                        }
                        $p->update(['manifest' => $manifest, 'content_version' => 1]);
                    }
                    if ($row['deleted'] ?? false) {
                        $p->delete();
                    }
                }
                foreach ($tables['refunds'] as $row) {
                    Refund::create(['id' => $row['id'], 'purchase_id' => $row['purchase_id'], 'user_id' => $users[$row['user_id']], 'reason' => $row['reason'] ?? null, 'status' => $row['status'], 'review_note' => $row['review_note'] ?? null, 'reviewed_at' => $this->date($row['reviewed_at'] ?? null), 'created_at' => $this->date($row['created_at'] ?? null)]);
                }
                foreach ($tables['tickets'] as $row) {
                    Ticket::create(['id' => $row['id'], 'user_id' => $users[$row['user_id']], 'subject' => $row['subject'], 'status' => $row['status'], 'messages' => $row['messages'] ?? [], 'created_at' => $this->date($row['created_at'] ?? null)]);
                }
            });
            $this->warn('Importação concluída. Todas as contas precisam redefinir a senha; sessões e hashes antigos não são importados.');

            return self::SUCCESS;
        } catch (\Throwable $error) {
            foreach ($paths as $path) {
                Storage::disk('local')->delete($path);
            }$this->error('Importação cancelada; banco revertido e origem preservada. Revise formato, referências e arquivos.');

            return self::FAILURE;
        }
    }

    private function date(mixed $value): ?Carbon
    {
        return is_numeric($value) ? Carbon::createFromTimestampMs($value) : null;
    }
}
