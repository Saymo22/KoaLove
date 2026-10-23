<?php

namespace App\Console\Commands;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PrunePrivateData extends Command
{
    protected $signature = 'privacy:prune';

    protected $description = 'Elimina rascunhos, contas desativadas e auditoria ao término da retenção.';

    public function handle(): int
    {
        User::where('deletion_requested_at', '<=', now()->subDays(config('gift.deletion_days')))->each(function ($user) {
            // Arquivos primeiro: uma falha permite tentar novamente sem perder a referência.
            Purchase::withTrashed()->where('user_id', $user->id)->each(fn ($p) => Storage::disk('local')->deleteDirectory('gifts/'.$p->id));
            $user->delete();
        });
        $expired = function ($q) {
            $q->where(fn ($q) => $q->where('status', 'pending')->where('updated_at', '<=', now()->subDays(config('gift.draft_days'))))->orWhere('deleted_at', '<=', now()->subDays(config('gift.deletion_days')));
        };
        Purchase::withTrashed()->where($expired)
            ->each(function ($candidate) use ($expired) {
                DB::transaction(function () use ($candidate, $expired) {
                    $p = Purchase::withTrashed()->whereKey($candidate->id)->where($expired)->lockForUpdate()->first();
                    if (! $p) {
                        return;
                    }
                    Storage::disk('local')->deleteDirectory('gifts/'.$p->id);
                    $p->forceDelete();
                });
            });
        DB::table('audit_events')->where('created_at', '<=', now()->subDays(config('gift.audit_days')))->delete();
        DB::table('password_reset_tokens')->where('created_at', '<=', now()->subHour())->delete();
        DB::table('sessions')->where('last_activity', '<', now()->subMinutes(config('session.lifetime'))->timestamp)->delete();
        $this->info('Retenção aplicada.');

        return self::SUCCESS;
    }
}
