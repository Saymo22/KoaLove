<?php

namespace App\Adapters;

use App\Contracts\PaymentGateway;
use App\Models\Purchase;

class SimulatedPaymentGateway implements PaymentGateway
{
    public function confirm(Purchase $purchase, string $method): void
    {
        abort_unless(config('gift.simulated_payments') && ! app()->isProduction(), 503, 'Gateway de pagamento não configurado.');
    }
}
