<?php

namespace App\Http\Controllers;

use App\Services\MercadoPagoCheckout;
use Illuminate\Http\Request;

class PaymentWebhookController extends ApiController
{
    public function __invoke(Request $request, MercadoPagoCheckout $checkout)
    {
        $checkout->synchronize($checkout->verify($request));

        return $this->ok(['received' => true]);
    }
}
