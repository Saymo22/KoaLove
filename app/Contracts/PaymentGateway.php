<?php

namespace App\Contracts;

use App\Models\Purchase;

interface PaymentGateway
{
    public function confirm(Purchase $purchase, string $method): void;
}
