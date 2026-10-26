<?php

namespace App\Console\Commands;

use App\Models\PaymentCheckout;
use App\Models\Refund;
use App\Models\Ticket;
use App\Services\AdminConfiguration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendAdminAlerts extends Command
{
    protected $signature = 'admin:alerts';

    protected $description = 'Envia no máximo um resumo diário de pendências administrativas.';

    public function handle(AdminConfiguration $config): int
    {
        $settings = $config->all();
        if (! $settings['emailNotif'] || ! $settings['supportEmail']) {
            return self::SUCCESS;
        }
        if (in_array(config('mail.default'), ['log', 'array']) && app()->isProduction()) {
            return self::FAILURE;
        }

        return Cache::lock('admin-alerts', 120)->get(function () use ($settings, $config) {
            $last = DB::table('admin_settings')->where('key', 'last_alert')->value('value');
            if ($last && json_decode($last, true)['date'] === now()->toDateString()) {
                return self::SUCCESS;
            }
            $pix = PaymentCheckout::where('provider', 'pix_manual')->where('status', 'awaiting_confirmation')->count();
            $refunds = Refund::where('status', 'pending')->count();
            $tickets = Ticket::where('status', 'open')->count();
            if ($pix + $refunds + $tickets > 0) {
                Mail::raw("Resumo KoaLove: {$pix} Pix para conferir; {$refunds} reembolsos pendentes; {$tickets} atendimentos abertos. Acesse o painel para analisar.", fn ($m) => $m->to($settings['supportEmail'])->subject('Pendências do painel KoaLove'));
            }
            $config->put('last_alert', ['date' => now()->toDateString()]);

            return self::SUCCESS;
        }) ?? self::SUCCESS;
    }
}
