<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentCheckout extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['live' => 'boolean', 'amount_cents' => 'integer', 'discount_percent' => 'integer', 'expires_at' => 'datetime', 'confirmed_at' => 'datetime', 'pix_details' => 'array'];
    }
}
