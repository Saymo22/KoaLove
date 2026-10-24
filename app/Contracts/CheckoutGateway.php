<?php

namespace App\Contracts;

use App\Models\PaymentCheckout;

interface CheckoutGateway
{
    public function preference(PaymentCheckout $checkout, bool $recover): array;

    public function payment(string $id): array;

    public function collector(): string;
}
