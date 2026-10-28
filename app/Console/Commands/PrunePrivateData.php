<?php

namespace App\Console\Commands;

use App\Models\MediaUpload;
use App\Models\Purchase;
use App\Models\User;
use App\Services\GiftMedia;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PrunePrivateData extends Command
{
    protected $signature = 'privacy:prune';

    protected $description = 'Elimina rascunhos, contas desativadas e auditoria ao término da retenção.';

    public function handle(): int
    {
        MediaUpload::where('expires_at', '<=', now())->each(function ($upload) {
            Storage::disk($upload->disk)->delete($upload->path);
            $upload->delete();
        });
        User::where('deletion_requested_at', '<=', now()->subDays(config('gift.deletion_days')))->each(function ($user) {
            // Arquivos primeiro: uma falha permite tentar novamente sem perder a referência.
            Purchase::withTrashed()->where('user_id', $user->id)->each(fn ($p) => GiftMedia::deletePurchase($p));
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
                    GiftMedia::deletePurchase($p);
                    $p->forceDelete();
                });
            });
        DB::table('admin_activities')->where('created_at', '<=', now()->subDays(30))->delete();
        DB::table('admin_invitations')->where('expires_at', '<=', now()->subDays(30))->delete();
        DB::table('audit_events')->where('created_at', '<=', now()->subDays(config('gift.audit_days')))->delete();
        DB::table('google_security_events')->where('received_at', '<=', now()->subDays(30))->delete();
        DB::table('password_reset_tokens')->where('created_at', '<=', now()->subHour())->delete();
        DB::table('sessions')->where('last_activity', '<', now()->subMinutes(config('session.lifetime'))->timestamp)->delete();
        $this->info('Retenção aplicada.');

        return self::SUCCESS;
    }
}
