<?php

namespace App\Services;

class PaymentSettings
{
    public function status(): array
    {
        $live = config('payments.mercadopago.live');
        if (config('payments.driver') === 'pix_manual') {
            return ['provider' => 'pix_manual', 'configured' => (bool) config('payments.enabled') && app(ManualPix::class)->configured(), 'live' => true];
        }
        $configured = config('payments.driver') === 'mercadopago' && config('payments.enabled')
            && config('payments.mercadopago.access_token') && config('payments.mercadopago.webhook_secret')
            && str_starts_with(config('app.url'), 'https://') && (! app()->isProduction() || $live);

        return ['provider' => config('payments.driver'), 'configured' => (bool) $configured, 'live' => (bool) $live];
    }
}
